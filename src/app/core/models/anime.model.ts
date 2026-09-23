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
  ano: number;
  status: StatusAnime;
  idioma: Idioma;
  temporadas: Temporada[];
}

export interface EpisodioRecente {
  anime: Pick<Anime, 'id' | 'titulo' | 'capaUrl' | 'nota'>;
  episodio: Pick<
    Episodio,
    'id' | 'animeId' | 'temporada' | 'numero' | 'titulo' | 'dataLancamento' | 'idioma'
  >;
}