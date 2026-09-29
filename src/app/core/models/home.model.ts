import { Anime, EpisodioRecente } from './anime.model';

export interface DestaqueHome {
  anime: Anime;
  tag?: string;
}

export interface HomeData {
  destaques: DestaqueHome[];
  ultimosEpisodios: EpisodioRecente[];
  ultimosLancamentos: Anime[];
  populares: Anime[];
}