/**
 * Endereco da API.
 *
 * Ordem de resolucao:
 *  1. window.__ANIME_API_URL__, que pode ser definido por quem publica o build (script inline no
 *     index.html, por exemplo). Assim da para apontar a aplicacao para outro ambiente sem rebuild.
 *  2. O valor padrao abaixo.
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
  production: false,
  apiUrl: resolverPadrao('http://localhost:8080'),
};
