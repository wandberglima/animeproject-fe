import { Idioma, StatusAnime } from './enums';

export interface FiltrosAnime {
  busca?: string;
  letra?: string;
  generos?: string[];
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

/** Ordenacao padrao da lista: alfabetica. */
export const ORDENACAO_PADRAO = 'nome';

export interface OpcaoOrdenacao {
  id: string;
  nome: string;
}

export const ORDENACOES: OpcaoOrdenacao[] = [
  { id: ORDENACAO_PADRAO, nome: 'Nome (A-Z)' },
  { id: 'popularidade', nome: 'Mais votados' },
  { id: 'avaliacao', nome: 'Melhor avaliados' },
  { id: 'recentes', nome: 'Mais recentes' },
  { id: 'ano', nome: 'Ano (mais novo)' },
];
