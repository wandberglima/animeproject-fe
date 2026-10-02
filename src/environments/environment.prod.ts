/**
 * Endereco da API no build de producao.
 *
 * Ordem de resolucao:
 *  1. window.__ANIME_API_URL__, que pode ser definido por quem publica o build (script inline no
 *     index.html, por exemplo). Assim da para apontar a aplicacao para outro ambiente sem rebuild.
 *  2. O valor padrao abaixo.
 *
 * IMPORTANTE: este endereco e um tunel rapido do Cloudflare (trycloudflare.com), que muda a cada
 * reinicio. Ele existe porque a API roda na sua maquina: um site em HTTPS nao consegue chamar
 * http://localhost. Para um endereco estavel, crie um tunel nomeado no painel da Cloudflare
 * (Zero Trust > Networks > Tunnels) e troque o valor abaixo pelo hostname dele.
 *
 * Depois que o projeto existir na Cloudflare Pages, acrescente o dominio real
 * (https://<projeto>.pages.dev) em CORS_ORIGENS, no arquivo api-env.ps1, e reinicie a API. Sem
 * essa entrada o navegador bloqueia a resposta, mesmo com a API no ar.
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
  apiUrl: resolverPadrao('https://nights-thy-front-pty.trycloudflare.com'),
};
