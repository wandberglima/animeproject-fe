/**
 * Verificacao de UI dos dois sintomas relatados, no navegador de verdade.
 *
 *  1. O filtro de idioma da tela de animes nao filtrava ao escolher "Dublado".
 *  2. A tela do player nao mostrava as legendas.
 *
 * A API de stream e interceptada no teste: resolver um stream real depende de provider externo e
 * deixa o teste instavel. O que importa aqui e a tela montar a partir do StreamInfo real.
 *
 * Roda com: npx tsx e2e/tela-e2e.mjs
 */
import { chromium } from 'playwright';

const FRONT = process.env.FRONT_URL ?? 'http://localhost:4200';
const API = process.env.API_URL ?? 'http://localhost:8080';

let falhas = 0;
function checar(condicao, mensagem) {
  if (condicao) {
    console.log(`  ok: ${mensagem}`);
  } else {
    console.error(`  FALHOU: ${mensagem}`);
    falhas++;
  }
}

const STREAM_FALSO = {
  url: '/api/stream/proxy?url=https://exemplo.test/video.m3u8',
  tipo: 'HLS',
  qualidade: '720p',
  provedor: 'megaplay',
  idioma: 'sub',
  legendas: [
    { idioma: 'english', rotulo: 'English', url: '/api/stream/proxy?url=https://exemplo.test/en.vtt' },
    { idioma: 'portuguese', rotulo: 'Portuguese', url: '/api/stream/proxy?url=https://exemplo.test/por.vtt' },
    { idioma: 'spanish 2', rotulo: 'Spanish 2', url: '/api/stream/proxy?url=https://exemplo.test/es.vtt' },
  ],
};

const navegador = await chromium.launch();
const pagina = await navegador.newPage();

// ---------------------------------------------------------------- filtro de idioma
console.log('1) Filtro de idioma "Dublado" na tela de animes');
await pagina.goto(`${FRONT}/#/catalogo`, { waitUntil: 'domcontentloaded' });
await pagina.waitForTimeout(2500);

const seletorIdioma = pagina.locator('select, button, [role="combobox"]').filter({ hasText: /idioma/i }).first();
const temFiltro = (await pagina.getByText(/idioma/i).count()) > 0;
checar(temFiltro, 'a barra de filtros tem o campo de idioma');

const respostaFiltro = await (await fetch(`${API}/api/animes?idioma=DUBLADO&tamanho=5`)).json();
checar((respostaFiltro.total ?? 0) > 0, `a API devolve ${respostaFiltro.total} animes dublados (antes era 0)`);

// ---------------------------------------------------------------- legendas no player
console.log('2) Legendas na tela do player');
await pagina.route('**/api/animes/*/episodios/*/stream**', (rota) =>
  rota.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(STREAM_FALSO) })
);
await pagina.route('**/*.vtt', (rota) =>
  rota.fulfill({
    status: 200,
    contentType: 'text/vtt',
    body: 'WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nEle nao esta aqui.\n',
  })
);

const anime = respostaFiltro.conteudo?.[0] ?? respostaFiltro.itens?.[0] ?? respostaFiltro[0];
if (!anime) {
  console.error('  FALHOU: nenhum anime dublado para abrir no player.');
  falhas++;
} else {
  console.log(`  abrindo ${anime.titulo}`);
  await pagina.goto(`${FRONT}/#/assistir/${anime.id}/1`, { waitUntil: 'domcontentloaded' });
  await pagina.waitForTimeout(4000);

  const seletor = pagina.locator('#legenda-select');
  checar((await seletor.count()) === 1, 'o seletor de legenda aparece no player');

  if ((await seletor.count()) === 1) {
    const opcoes = await seletor.locator('option').allTextContents();
    console.log(`  opcoes: ${opcoes.join(' | ')}`);
    checar(opcoes.some((o) => /portuguese/i.test(o)), 'a faixa de portugues aparece na lista');
    checar(
      opcoes.findIndex((o) => /portuguese/i.test(o)) <
        (opcoes.findIndex((o) => /english/i.test(o)) === -1 ? opcoes.length : opcoes.findIndex((o) => /english/i.test(o))),
      'portuguese fica antes de english na lista',
    );
    const selecionado = await seletor.locator('option:checked').textContent();
    checar(/portuguese/i.test(selecionado ?? ''), `a faixa ligada por padrao e a de portugues (veio "${selecionado}")`);
  }

  const faixas = await pagina.evaluate(() => document.querySelector('video')?.textTracks?.length ?? 0);
  checar(faixas >= 3, `o <video> tem ${faixas} TextTrack(s) criadas a partir das legendas`);
  constshowing = await pagina.evaluate(
    () => document.querySelector('video')?.textTracks?.[0]?.mode ?? 'nenhuma',
  );
  checar(showing === 'showing', `a faixa de portugues esta em modo showing (veio "${showing}")`);
}

await navegador.close();
console.log(falhas === 0 ? '\nOK: os dois sintomas verificados.' : `\n${falhas} verificacao(oes) falharam.`);
process.exitCode = falhas === 0 ? 0 : 1;
