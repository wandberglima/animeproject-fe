import { Idioma, StatusAnime } from './enums';
import { Genero } from './genero';
import { Episodio } from './episodio.model';

export interface Temporada {
  numero: number;
  titulo?: string;
  episodios: Episodio[];
}

export interface Anime {
  id: number;
  titulo: string;
  tituloOriginal?: string;
  capaUrl: string;
  bannerUrl?: string;
  sinopse: string;
  generos: Genero[];
  nota: number;
  votos?: number;
  ano: number;
  dataLancamento?: string;
  status: StatusAnime;
  idioma: Idioma;
  /** TV, MOVIE, OVA, ONA, SPECIAL... do AniList. */
  formato?: string;
  temporadas: Temporada[];
}

export interface EpisodioRecente {
  anime: Pick<Anime, 'id' | 'titulo' | 'capaUrl' | 'nota' | 'votos'>;
  episodio: Pick<
    Episodio,
    'id' | 'animeId' | 'temporada' | 'numero' | 'titulo' | 'dataLancamento' | 'idioma'
  >;
}