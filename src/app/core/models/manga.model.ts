import { StatusAnime } from './enums';
import { ResultadoPaginado } from './filtros.model';

export interface MangaResumo {
  id: string;
  titulo: string;
  capaUrl?: string;
  ano?: number;
  status: StatusAnime;
  idioma?: string;
}

export interface MangaDetalhe {
  id: string;
  titulo: string;
  descricao?: string;
  capaUrl?: string;
  ano?: number;
  status: StatusAnime;
  generos: string[];
  autores: string[];
}

export interface CapituloManga {
  id: string;
  numero: string;
  titulo?: string;
  idioma: string;
  paginas: number;
  publicacao?: string;
}

export interface CapituloPaginas {
  idCapitulo: string;
  paginas: string[];
}

export type ResultadoMangas = ResultadoPaginado<MangaResumo>;
export type ResultadoCapitulos = ResultadoPaginado<CapituloManga>;