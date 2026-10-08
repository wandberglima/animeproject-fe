/*
 * Endereco da API usado pelo site publicado.
 *
 * A API roda na maquina de quem desenvolve e, por isso, so e alcancavel por um tunel rapido do
 * Cloudflare (trycloudflare.com). Esse tunel cria uma URL nova a cada reinicio, entao a URL fica
 * neste arquivo em vez de compilationada no bundle: o atalho que sobe a API reescreve este arquivo
 * e republica as paginas, sem precisar recompilar o projeto.
 *
 * A URL padrao (o tunel atual) fica em src/environments/environment.prod.ts e vale quando este
 * arquivo nao define nada, ou seja, num build de desenvolvimento ou se o arquivo for removido.
 *
 * Formato: sem barra no final, porque os servicos concatenam `${apiUrl}/animes` e uma barra
 * duplicaria caminho com //.
 */
window.__ANIME_API_URL__ = 'https://lawn-catalyst-collar-carries.trycloudflare.com';