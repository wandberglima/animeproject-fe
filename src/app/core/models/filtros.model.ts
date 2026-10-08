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
  /**
   * Mostra apenas titulos ja confirmados com faixa de legenda em portugues.
   *
   * So cerca de um quinto do catalogo tem pt nas fontes atuais, e o dado aparece quando o episodio e
   * reproduzido. Por isso o filtro lista os titulos ja confirmados, em vez de prometer que todo
   * titulo sem a marca esta sem legenda.
   */
  somentePortugues?: boolean;
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
