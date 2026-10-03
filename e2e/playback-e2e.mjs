/**
 * Reproduz um episodio por um tempo e conta se o video avanca de verdade.
 *
 * "Parou de reproduzir" nao aparece em teste de carga: so aparece quando o player comeca a tocar e
 * em algum momento o `currentTime` deixa de andar. Aqui o app roda de verdade, contra a API de
 * verdade, e o que se mede e o proprio `<video>`: tempo de reproducao, quantos segmentos falharam
 * e com que status, e os erros que o hls.js emitiu.
 *
 * Uso: node e2e/playback-e2e.mjs [idDoAnime] [numeroDoEpisodio] [segundos]
 */
import { chromium } from 'playwright';

const baseFrontend = process.env.FRONTEND ?? 'http://localhost:4200';
const animeId = process.argv[2] ?? '1200';
const episodio = process.argv[3] ?? '1';
const segundos = Number(process.argv[4] ?? '75');

const navegador = await chromium.launch();
const pagina = await navegador.newPage();

const segmentos = new Map();
pagina.on('response', (r) => {
  const u = r.url();
  if (!u.includes('/api/stream/proxy')) return;
  const tipo = /\.m3u8(\?|$)/i.test(u) ? 'm3u8' : /\.vtt(\?|$)/i.test(u) ? 'vtt' : 'segmento';
  const k = `${tipo} ${r.status()}`;
  segmentos.set(k, (segmentos.get(k) || 0) + 1);
});

const errosHls = [];
await pagina.addInitScript(() => {
  window.__erros = [];
  const orig = window.console.error;
  window.console.error = (...a) => {
    window.__erros.push(a.map(String).join(' ').slice(0, 300));
    orig(...a);
  };
  window.addEventListener('error', (e) => window.__erros.push('window.error: ' + String(e.message).slice(0, 200)));
  window.addEventListener('unhandledrejection', (e) =>
    window.__erros.push('rejection: ' + String(e.reason).slice(0, 200)),
  );
});

await pagina.goto(`${baseFrontend}/assistir/${animeId}/${episodio}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await pagina.waitForSelector('video', { timeout: 30000 });

// Deixa o video tocar sozinho: autoplay pode ser barrado, entao o play e tentado e, se falhar,
// o teste diz que o video nao comecou a rodar.
const comecou = await pagina.evaluate(async () => {
  const v = document.querySelector('video');
  v.muted = true;
  try {
    await v.play();
  } catch (e) {
    return 'play() falhou: ' + String(e).slice(0, 120);
  }
  return 'ok';
});
console.log('play():', comecou);

const amostras = [];
for (let s = 0; s < segundos; s += 15) {
  await pagina.waitForTimeout(15000);
  const m = await pagina.evaluate(() => {
    const v = document.querySelector('video');
    const faixas = [];
    for (let i = 0; i < v.textTracks.length; i++) {
      if (v.textTracks[i].mode === 'showing') faixas.push(v.textTracks[i].label);
    }
    return {
      tempo: Number(v.currentTime.toFixed(2)),
      paused: v.paused,
      pronto: v.readyState,
      buffer: v.buffered.length ? Number(v.buffered.end(v.buffered.length - 1).toFixed(2)) : 0,
      faixas,
    };
  });
  amostras.push({ s: s + 15, ...m });
  console.log(`t=${s + 15}s  tempo=${m.tempo}s  pausado=${m.paused}  readyState=${m.pronto}  buffer=${m.buffer}s  legendas=[${m.faixas.join(', ')}]`);
}

const erros = await pagina.evaluate(() => window.__erros ?? []);
await navegador.close();

console.log('\nrespostas do proxy:', JSON.stringify([...segmentos]));
console.log('erros no navegador:', erros.length ? erros.slice(0, 6).join(' || ') : 'nenhum');

const primeiro = amostras[0].tempo;
const ultimo = amostras[amostras.length - 1].tempo;
const avancou = ultimo - primeiro;
const travou = amostras.find((a, i) => i > 0 && a.tempo - amostras[i - 1].tempo < 3);

console.log(`\navanco total: ${avancou.toFixed(2)}s em ${segundos}s de teste`);
if (travou) {
  console.log(`TRAVOU a partir de t=${travou.s}s (tempo ${travou.tempo}s, pausado=${travou.paused}, readyState=${travou.pronto})`);
  process.exit(1);
}
if (avancou < segundos * 0.5) {
  console.log('FAIL: reproduziu muito menos que o esperado');
  process.exit(1);
}
console.log('OK: reproduziu continuamente');
