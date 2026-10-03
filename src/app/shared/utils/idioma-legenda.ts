/**
 * Deteccao de portugues brasileiro e de codigo de idioma nas faixas de legenda.
 *
 * Os providers devolvem o nome da faixa como vem ("portuguese", "pt-BR", "Portuguese (Brazil)",
 * "Spanish 2"), sem um codigo normalizado. O <track> do HTML precisa de srclang em BCP-47, e o
 * usuario espera pt-BR ligado sozinho, entao as tres coisas precisam sair daqui: se a faixa e a
 * preferida, qual o codigo BCP-47, e a ordem de exibicao.
 */

/**
 * Palavras que indicam pt-BR. "br" so vale como palavra inteira: sem isso "breton" casaria e
 * viraria a legenda escolhida.
 */
const PALAVRAS_PT_BR = [
  'ptbr',
  'pt',
  'br',
  'brazil',
  'brazilian',
  'brasil',
  'brasileiro',
  'brasileira',
];

/** "portuguese"/"pt" sem dizer o pais: nos providers brasileiros e pt-BR na pratica. */
const PALAVRAS_PT = ['portuguese', 'portugues', 'portuguesbrasil', 'portuguesebrazil', 'portuguesebr'];

const ISO_POR_NOME: Record<string, string> = {
  english: 'en',
  inglesh: 'en',
  spanish: 'es',
  espanol: 'es',
  castelhano: 'es',
  portugues: 'pt',
  portuguese: 'pt',
  frances: 'fr',
  french: 'fr',
  alemao: 'de',
  german: 'de',
  italiano: 'it',
  italian: 'it',
  russo: 'ru',
  russian: 'ru',
  japones: 'ja',
  japanese: 'ja',
  coreano: 'ko',
  korean: 'ko',
  chines: 'zh',
  chinese: 'zh',
  mandarim: 'zh',
  cantonese: 'zh',
  arabe: 'ar',
  arabic: 'ar',
  indiano: 'hi',
  hindi: 'hi',
  turco: 'tr',
  turkish: 'tr',
  holandes: 'nl',
  dutch: 'nl',
  polones: 'pl',
  polish: 'pl',
  sueco: 'sv',
  swedish: 'sv',
  indonesio: 'id',
  indonesian: 'id',
  tailandes: 'th',
  thai: 'th',
  vietnamita: 'vi',
  vietnamese: 'vi',
};

/** Codigos BCP-47 usados direto, quando o provider ja manda "en" ou "es". */
const CODIGOS_DIRETOS = new Set([
  'en',
  'es',
  'fr',
  'de',
  'it',
  'ru',
  'ja',
  'ko',
  'zh',
  'ar',
  'hi',
  'tr',
  'nl',
  'pl',
  'sv',
  'id',
  'th',
  'vi',
  'pt',
  'enUS',
  'esES',
  'frFR',
  'deDE',
]);

/** Minusculas, sem acento e sem pontuacao, para comparar texto livre. */
function normalizar(texto: string): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Palavras inteiras do texto normalizado: "portuguese (brazil)" -> br, portuguese, brazil. */
function palavras(valor: string): string[] {
  return (valor ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length > 0);
}

/**
 * 3 = pt-BR explicito, 2 = portugues sem pais, 1 = qualquer outra lingua.
 * Serve para ordenar: pt-BR vem antes de portugues, que vem antes do resto.
 */
export function pesoIdioma(valor: string): number {
  const bruto = normalizar(valor);
  if (!bruto) {
    return 0;
  }
  const partes = palavras(valor);
  if (partes.some((p) => PALAVRAS_PT_BR.includes(p))) {
    return 3;
  }
  if (bruto.includes('brazil') || bruto.includes('brasil')) {
    return 3;
  }
  if (PALAVRAS_PT.some((p) => bruto.includes(p))) {
    return 2;
  }
  return 1;
}

export function ehPortuguesBrasileiro(valor: string): boolean {
  return pesoIdioma(valor) === 3;
}

/**
 * srclang para a faixa. O HTML so aceita BCP-47, e um rotulo livre como "Spanish 2" faria o
 * navegador recusar a faixa inteira; quando nao da para advinhar, "und" e o valor honesto.
 */
export function codigoIdioma(valor: string): string {
  const bruto = normalizar(valor);
  if (!bruto) {
    return 'und';
  }
  if (ehPortuguesBrasileiro(valor)) {
    return 'pt-BR';
  }
  if (pesoIdioma(valor) === 2) {
    return 'pt';
  }
  if (CODIGOS_DIRETOS.has(valor.trim())) {
    return valor.trim();
  }
  // O provider numera faixas repetidas ("spanish 2"); o numero nao faz parte do nome.
  const nome = bruto.replace(/[0-9]+$/, '');
  if (ISO_POR_NOME[nome]) {
    return ISO_POR_NOME[nome];
  }
  // Rotulo composto ("spanish (- espanol)", "english (ai)"): as chaves do mapa sao palavras
  // soltas, mas `normalizar` juntou tudo sem separador ("spanishespanol"), entao a busca pela
  // string inteira nunca casava e a faixa caia em "und". Aqui cada palavra do rotulo original e
  // testada na ordem em que aparece, e a primeira que resolver define o idioma.
  for (const parte of palavras(valor)) {
    if (ISO_POR_NOME[parte]) {
      return ISO_POR_NOME[parte];
    }
  }
  return 'und';
}

/** Como o provider nomeia as faixas de portugues. */
const ROTULO_PT_BR = 'Português (Brasil)';
const ROTULO_PT = 'Português';

/**
 * Rotulo de exibicao no seletor de legenda.
 *
 * As outras linguas mantem o rotulo do provider: ele carrega o qualificador que a traducao nao
 * tem como adivinhar, como as duas faixas de espanhol de "spanish (- espanol (latin american))" e
 * "spanish (- espanol (espana))", que virariam "Espanhol" uma e outra se fossem traduzidas. O
 * portugues nao tem essa ambiguidade, e o usuario precisa conseguir achar a faixa pt-BR pelo nome.
 */
export function rotuloIdioma(valor: string): string {
  if (ehPortuguesBrasileiro(valor)) {
    return ROTULO_PT_BR;
  }
  if (pesoIdioma(valor) === 2) {
    return ROTULO_PT;
  }
  return valor;
}
