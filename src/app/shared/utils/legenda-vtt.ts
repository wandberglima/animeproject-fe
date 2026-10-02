/**
 * Parser de WebVTT.
 *
 * O hls.js 1.7 removiu a API de faixa de legenda externa (so aceita legenda embutida no manifest) e
 * o proxy de stream responde "application/octet-stream", que o navegador rejeita num <track
 * src="...">. A alternativa que funciona nos dois casos e buscar o arquivo, ler as falas aqui e
 * monta-las na TextTrack do <video> -- assim nem o content-type nem o hls.js atrapalham.
 */

export interface FalasLegenda {
  inicio: number;
  fim: number;
  texto: string;
}

/** "01:02:03.456", "02:03.456" ou "03.456" -> segundos. */
function tempoParaSegundos(marcador: string): number {
  const partes = marcador.trim().split(':');
  if (partes.length === 0) {
    return NaN;
  }
  const segundos = Number.parseFloat(partes[partes.length - 1].replace(',', '.'));
  if (Number.isNaN(segundos)) {
    return NaN;
  }
  let total = segundos;
  if (partes.length > 1) {
    total += Number.parseInt(partes[partes.length - 2], 10) * 60;
  }
  if (partes.length > 2) {
    total += Number.parseInt(partes[partes.length - 3], 10) * 3600;
  }
  return total;
}

/**
 * Extrai as falas de um WebVTT. Formato aceito:
 *
 *   WEBVTT
 *
 *   00:00:31.010 --> 00:00:32.570
 *   Ele não está aqui.
 *
 * Sao tolerados cabecalho opcional, identificador numerico antes do tempo, configuracoes depois do
 * tempo e o marcador NOTE/STYLE/REGION, que sao blocos que nao produzem fala.
 */
export function lerVtt(conteudo: string): FalasLegenda[] {
  if (!conteudo) {
    return [];
  }
  const linhas = conteudo.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  const falas: FalasLegenda[] = [];
  let i = 0;

  // Pula o cabecalho "WEBVTT" e o bloco de metadados ate a primeira linha em branco.
  if (/^WEBVTT/.test(linhas[0] ?? '')) {
    i = 1;
    while (i < linhas.length && linhas[i].trim() !== '') {
      i++;
    }
  }

  while (i < linhas.length) {
    const linha = linhas[i].trim();

    if (linha === '') {
      i++;
      continue;
    }
    if (/^(NOTE|STYLE|REGION)\b/.test(linha)) {
      // Bloco de metadados: pula ate a linha em branco seguinte.
      i++;
      while (i < linhas.length && linhas[i].trim() !== '') {
        i++;
      }
      continue;
    }

    let linhaTempo = linha;
    // O identificador da fala (numero, id) vem na linha anterior e nao tem "-->".
    if (!linhaTempo.includes('-->')) {
      i++;
      linhaTempo = (linhas[i] ?? '').trim();
      if (!linhaTempo.includes('-->')) {
        continue;
      }
    }

    const [inicioBruto, resto] = linhaTempo.split('-->');
    const fimBruto = (resto ?? '').trim().split(/\s+/)[0] ?? '';
    const inicio = tempoParaSegundos(inicioBruto ?? '');
    const fim = tempoParaSegundos(fimBruto);
    i++;

    const texto: string[] = [];
    while (i < linhas.length && linhas[i].trim() !== '') {
      texto.push(linhas[i]);
      i++;
    }

    if (Number.isNaN(inicio) || Number.isNaN(fim) || fim <= inicio || texto.length === 0) {
      continue;
    }
    falas.push({ inicio, fim, texto: texto.join('\n') });
  }
  return falas;
}
