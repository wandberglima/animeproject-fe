export enum StatusAnime {
  EM_LANCAMENTO = 'EM_LANCAMENTO',
  COMPLETO = 'COMPLETO',
  EM_BREVE = 'EM_BREVE',
}

export const STATUS_ANIME_LABEL: Record<StatusAnime, string> = {
  [StatusAnime.EM_LANCAMENTO]: 'Em lançamento',
  [StatusAnime.COMPLETO]: 'Completo',
  [StatusAnime.EM_BREVE]: 'Em breve',
};

export enum Idioma {
  LEGENDADO = 'LEGENDADO',
  DUBLADO = 'DUBLADO',
}

export const IDIOMA_LABEL: Record<Idioma, string> = {
  [Idioma.LEGENDADO]: 'Legendado',
  [Idioma.DUBLADO]: 'Dublado',
};

/** Siglas de formato do AniList traduzidas para o catalogo. */
export const FORMATO_LABEL: Record<string, string> = {
  TV: 'Série TV',
  TV_SHORT: 'Curta',
  MOVIE: 'Filme',
  SPECIAL: 'Especial',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Musical',
};