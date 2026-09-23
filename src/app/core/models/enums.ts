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