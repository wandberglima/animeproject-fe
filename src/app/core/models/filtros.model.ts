import { Idioma, StatusAnime } from './enums';

export interface FiltrosAnime {
  busca?: string;
  letra?: string;
  genero?: string;
  idioma?: Idioma;
  status?: StatusAnime;
  ano?: number;
  ordenacao?: string;
  pagina?: number;
  tamanho?: number;
}

export interface ResultadoPaginado<T> {
  itens: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
}