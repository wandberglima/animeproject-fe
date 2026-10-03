import { chromium } from 'playwright';

const site = process.argv[2] ?? 'https://aniprojects.pages.dev';
const navegador = await chromium.launch();
const p = await navegador.newPage();
const erros = [];
p.on('console', m => { if (m.type() === 'error') erros.push(m.text().slice(0, 120)); });
p.on('pageerror', e => erros.push('PAGEERROR ' + String(e).slice(0, 120)));

await p.goto(site, { waitUntil: 'domcontentloaded', timeout: 60000 });
console.log('pagina inicial: ' + (await p.title()));

const animes = await p.evaluate(async () => {
  const r = await fetch((window.__ANIME_API_URL__ ?? 'https://nights-thy-front-pty.trycloudflare.com') + '/api/animes?pagina=1&tamanho=5');
  return { status: r.status, total: (await r.json()).total ?? null };
});
console.log('API a partir do site publicado: ' + JSON.stringify(animes));

await p.goto(site + '/assistir/1200/1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForSelector('video', { timeout: 30000 });
await p.evaluate(() => document.querySelector('video').play().catch(() => {}));
await p.waitForTimeout(60000);

const st = await p.evaluate(() => {
  const v = document.querySelector('video');
  return {
    tempo: Number(v.currentTime.toFixed(1)),
    readyState: v.readyState,
    pausado: v.paused,
    faixas: Array.from(v.textTracks).map(t => t.label + (t.mode === 'showing' ? ' (ativa)' : '')),
  };
});
console.log('apos 60s: ' + JSON.stringify(st));
console.log('erros no console: ' + (erros.slice(0, 6).join(' || ') || 'nenhum'));
await navegador.close();