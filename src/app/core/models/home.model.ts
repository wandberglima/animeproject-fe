import { Anime, EpisodioRecente } from './anime.model';

export interface DestaqueHome {
  anime: Anime;
  tag?: string;
}

export interface HomeData {
  destaques: DestaqueHome[];
  ultimosEpisodios: EpisodioRecente[];
  recentes: Anime[];
  populares: Anime[];
}