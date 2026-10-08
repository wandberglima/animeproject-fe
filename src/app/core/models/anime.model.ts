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
  /**
   * Algum episodio deste titulo ja confirmou faixa de legenda em portugues.
   *
   * A API so sabe isso depois que o episodio e reproduzido, porque e o scraper que devolve as faixas
   * no momento do play. Enquanto o titulo nunca foi aberto o campo vem falso, e nao "sem legenda":
   * quem oferece o filtro "com portugues" usa esses titulos ja confirmados.
   */
  temLegendaPortugues?: boolean;
  temporadas: Temporada[];
}

export interface EpisodioRecente {
  anime: Pick<Anime, 'id' | 'titulo' | 'capaUrl' | 'nota' | 'votos'>;
  episodio: Pick<
    Episodio,
    'id' | 'animeId' | 'temporada' | 'numero' | 'titulo' | 'dataLancamento' | 'idioma'
  >;
}