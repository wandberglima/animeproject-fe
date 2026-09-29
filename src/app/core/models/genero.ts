export interface Genero {
  id: string;
  nome: string;
}

/** Genero disponivel no catalogo, com a quantidade de animes (vem de GET /api/animes/generos). */
export interface GeneroFiltro extends Genero {
  totalAnimes: number;
}
