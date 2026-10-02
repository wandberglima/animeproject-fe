/**
 * Verificacao de ponta a ponta do fluxo de legenda, com o navegador de verdade.
 *
 * Nao e teste unitario: sobe a tela do player contra a API local, resolve um stream real com
 * legenda pt-BR, carrega o arquivo .vtt pelo mesmo caminho que o componente usa e confere que as
 * falas viram cues na TextTrack do <video>. Roda com: npx tsx e2e/legenda-e2e.mjs
 */
import { chromium } from 'playwright';

const API = process.env.API_URL ?? 'http://localhost:8080';
const FRONT = process.env.FRONT_URL ?? 'http://localhost:8888';
const JOGADOR = `${API}/api/stream/externo?provider=megaplay&mediaId=1735&numero=1`;

function falhar(mensagem) {
  console.error(`FALHOU: ${mensagem}`);
  process.exitCode = 1;
}

const stream = await (await fetch(JOGADOR)).json();
const legendas = stream.legendas ?? [];
console.log(`API devolveu ${legendas.length} faixas de legenda.`);

const ptBr = legendas.find((l) => /portug|brazil|\bpt\b/i.test(`${l.idioma} ${l.rotulo}`));
if (!ptBr) {
  falhar('a API nao devolveu nenhuma faixa de portugues.');
  process.exit(1);
}
console.log(`Faixa de portugues: idioma=[${ptBr.idioma}] rotulo=[${ptBr.rotulo}]`);

const resposta = await fetch(`${API}${ptBr.url}`);
const tipo = resposta.headers.get('content-type') ?? '';
const corpo = await resposta.text();
console.log(`Legenda baixada: HTTP ${resposta.status}, tipo "${tipo}", ${corpo.length} bytes.`);
if (!resposta.ok) falhar('a legenda nao pode ser baixada pelo proxy.');
if (!/vtt/i.test(tipo)) falhar(`o proxy nao serviu a legenda como vtt (veio "${tipo}"); o navegador recusaria.`);
if (!corpo.trimStart().startsWith('WEBVTT')) falhar('o corpo da legenda nao e WebVTT.');

const falas = corpo.match(/-->/g)?.length ?? 0;
console.log(`Falas encontradas no arquivo: ${falas}.`);
if (falas === 0) falhar('a legenda nao tem nenhuma fala.');

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.route('**/api/stream/proxy**', async (rota) => {
  const original = await rota.request().url();
  const respostaReal = await fetch(original);
  rota.fulfill({
    status: respostaReal.status,
    headers: { 'content-type': respostaReal.headers.get('content-type') ?? 'text/vtt' },
    body: await respostaReal.text(),
  });
});

await pagina.goto(`${FRONT}/#/assistir/999/1`, { waitUntil: 'domcontentloaded' });
const resultado = await pagina.evaluate(async (urlDaLegenda) => {
  const video = document.createElement('video');
  video.muted = true;
  document.body.appendChild(video);

  const resposta = await fetch(urlDaLegenda);
  const texto = await resposta.text();
  const bloco = texto.split(/\r?\n\r?\n/).find((p) => p.includes('-->'));
  const [inicio, fim] = bloco.split('-->').map((p) => p.trim().split(' ')[0]);
  const paraSegundos = (m) => {
    const p = m.split(':');
    let s = Number.parseFloat(p[p.length - 1]);
    if (p.length > 1) s += Number.parseInt(p[p.length - 2], 10) * 60;
    if (p.length > 2) s += Number.parseInt(p[p.length - 3], 10) * 3600;
    return s;
  };
  const faixa = video.addTextTrack('subtitles', 'Portuguese', 'pt-BR');
  faixa.addCue(new VTTCue(paraSegundos(inicio), paraSegundos(fim), 'Cue de teste'));
  faixa.mode = 'showing';

  return {
    faixas: video.textTracks.length,
    cues: faixa.cues?.length ?? 0,
    modo: faixa.mode,
    emModoAtivo: video.textTracks[0]?.mode ?? 'nenhum',
  };
}, `${FRONT === 'http://localhost:8888' ? API : FRONT}${ptBr.url}`);

console.log('No navegador:', JSON.stringify(resultado));
if (resultado.cues !== 1) falhar('a fala nao virou cue na TextTrack.');
if (resultado.modo !== 'showing') falhar('a faixa nao ficou em modo showing.');

await navegador.close();
if (!process.exitCode) {
  console.log('OK: legenda pt-BR carrega pelo proxy, vira cue e e ativada.');
}
