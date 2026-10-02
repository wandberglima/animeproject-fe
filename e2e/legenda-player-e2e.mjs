/**
 * Verifica no navegador de verdade qual legenda o player deixa ligada.
 *
 * Os testes unitarios cobrem a ordenacao das faixas, mas nao cobrem a parte que mais importa para
 * o usuario: qual `TextTrack` fica com `mode = 'showing'` quando o provider devolve varias lingua e
 * uma delas e portugues. Aqui o app roda de verdade, contra a API de verdade, e o que se le e o
 * estado do `textTracks` do elemento <video>.
 *
 * Uso: node e2e/legenda-player-e2e.mjs [idDoAnime] [numeroDoEpisodio]
 */
import { chromium } from 'playwright';

const baseFrontend = process.env.FRONTEND ?? 'http://localhost:4200';
const animeId = process.argv[2] ?? '1200';
const episodio = process.argv[3] ?? '1';

const resposta = await fetch(`${process.env.API ?? 'http://localhost:8080'}/api/animes/${animeId}/episodios/${episodio}/stream`);
if (!resposta.ok) {
  console.error(`API respondeu ${resposta.status} para o anime ${animeId} ep ${episodio}`);
  process.exit(1);
}
const stream = await resposta.json();
const faixas = stream.legendas ?? [];
console.log(`anime ${animeId} ep ${episodio} | provedor ${stream.provedor} | idioma ${stream.idioma}`);
console.log(`faixas da API: ${faixas.map((f) => f.idioma).join(' | ') || '(nenhuma)'}`);

const temPortugues = faixas.some((f) => /portug|pt|brazil/i.test(`${f.idioma} ${f.rotulo}`));
if (!temPortugues) {
  console.log('este episodio nao tem faixa portuguesa na API; nada a conferir no player');
  process.exit(0);
}

const navegador = await chromium.launch();
const pagina = await navegador.newPage();

const erros = [];
pagina.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
pagina.on('pageerror', (e) => erros.push(String(e)));

// O app usa PathLocationStrategy (provideRouter sem withHashLocation), entao a URL e por path.
// Com "#/assistir/..." o router ignorava o hash e caia na rota '', que e a home.
await pagina.goto(`${baseFrontend}/assistir/${animeId}/${episodio}`, { waitUntil: 'domcontentloaded' });

// Espera o <video> e as Tracks. O componente so carrega legenda depois de iniciar o HLS, entao
// a espera e pelo estado final e nao por um tempo fixo. Exigir uma faixa em 'showing' evita o
// falso positivo de voltar no instante em que a primeira faixa foi criada e as outras ainda
// estavam sendo baixadas.
const estado = await pagina
  .waitForFunction(
    () => {
      const video = document.querySelector('video');
      if (!video || video.textTracks.length === 0) {
        return null;
      }
      const ativas = [];
      for (let i = 0; i < video.textTracks.length; i++) {
        const faixa = video.textTracks[i];
        if (faixa.mode === 'showing') {
          ativas.push({ indice: faixa.id, rotulo: faixa.label, lang: faixa.language });
        }
      }
      return ativas.length > 0 ? { total: video.textTracks.length, ativas } : null;
    },
    { timeout: 60000 },
  )
  .then((h) => h.jsonValue())
  .catch(() => null);

await navegador.close();

if (!estado) {
  console.error('FAIL: o player nao criou nenhuma TextTrack');
  if (erros.length) {
    console.error(erros.slice(0, 5).join('\n'));
  }
  process.exit(1);
}

console.log(`TextTracks no video: ${estado.total}`);
console.log(`ligadas: ${JSON.stringify(estado.ativas)}`);

if (estado.ativas.length !== 1) {
  console.error('FAIL: esperado exatamente uma faixa ligada');
  process.exit(1);
}

const ligada = estado.ativas[0];
const ehPortugues = /^(pt|por)/i.test(ligada.lang);
console.log(ehPortugues ? 'OK: legenda portuguesa ligada automaticamente' : `FAIL: legenda ligada e "${ligada.lang}"`);

if (erros.length) {
  console.log(`avisos no console: ${erros.length}`);
}

process.exit(ehPortugues ? 0 : 1);
