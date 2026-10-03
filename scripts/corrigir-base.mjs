// Reescreve as URLs relativas da raiz do index.html gerado para caminhos absolutos.
//
// Por que: em rotas profundas (/assistir/1200/1), o Chromium resolve os <link rel="modulepreload">
// do Angular contra a URL do documento em vez de usar o <base href="/">. O pedido sai como
// /assistir/1200/chunk-XXXX.js, o fallback SPA da Cloudflare Pages responde index.html nesse
// caminho, e o navegador acusa "Expected a JavaScript-or-Wasm module script but the server
// responded with a MIME type of text/html". Os modulos reais carregam depois na raiz, entao o app
// funciona, mas cada rota direta baixa ~65 KB de HTML a toa e enche o console de erro.
//
// Os <script> do Angular ja sao resolvidos corretamente pelo <base href="/">; por isso so os
// prefetch/preload precisam de caminho absoluto.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const alvo = resolve(process.argv[2] ?? 'dist/aniprojects/browser/index.html');
const html = readFileSync(alvo, 'utf8');

// Matches href/src que comecam em "chunk-", "main-", "polyfills-", "styles-" ou "media-",
// isto e, artefatos do proprio build. Nao toca em URLs http(s), "/" nem "./".
const artefato = /(href|src)="((?:chunk|main|polyfills|styles|media|runtime)-[A-Z0-9]+\.(?:js|mjs|css))/g;

let trocadas = 0;
const corrigido = html.replace(artefato, (_, atributo, caminho) => {
  trocadas++;
  return `${atributo}="/${caminho}"`;
});

if (trocadas === 0) {
  console.error(`nenhuma URL relativa de artefato encontrada em ${alvo}; o build mudou de formato?`);
  process.exit(1);
}

writeFileSync(alvo, corrigido, 'utf8');
console.log(`base absoluta aplicada em ${trocadas} artefatos de ${alvo}`);