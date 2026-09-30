/**
 * Endereco da API no build de producao.
 *
 * Ordem de resolucao:
 *  1. window.__ANIME_API_URL__, que pode ser definido por quem publica o build (script inline no
 *     index.html, por exemplo). Assim da para apontar a aplicacao para outro ambiente sem rebuild.
 *  2. O valor padrao abaixo.
 *
 * IMPORTANTE: o endereco padrao ainda responde 404. O backend e um Spring Boot empacotado em JAR,
 * que nao roda como funcao serverless da Vercel, entao o deploy precisa acontecer em um host que
 * execute processo de longa duracao (Render, Railway, Fly.io, uma VM). Enquanto nao for esse o
 * caso, aponte o valor padrao para o host que realmente responde, ou defina o global acima.
 *
 * A barra final e removida de proposito: os servicos concatenam `${apiUrl}/animes` e uma barra
 * duplicada geraria caminho com //.
 */
const definido = typeof window !== 'undefined' ? window.__ANIME_API_URL__ : undefined;

function resolverPadrao(padrao: string): string {
  const base = (definido ?? padrao).replace(/\/+$/, '');
  return `${base}/api`;
}

declare global {
  interface Window {
    __ANIME_API_URL__?: string;
  }
}

export const environment = {
  production: true,
  apiUrl: resolverPadrao('https://animeproject-api.vercel.app'),
};
