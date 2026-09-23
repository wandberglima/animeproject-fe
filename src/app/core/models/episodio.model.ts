import { Idioma } from './enums';

export interface Episodio {
  id: number;
  animeId: number;
  temporada: number;
  numero: number;
  titulo: string;
  videoUrl?: string;
  capaUrl?: string;
  dataLancamento: string;
  idioma: Idioma;
}