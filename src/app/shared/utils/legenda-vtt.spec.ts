import { lerVtt } from './legenda-vtt';

describe('lerVtt', () => {
  const VTT_REAL = `WEBVTT

00:00:31.010 --> 00:00:32.570
Ele não está aqui.

00:00:39.010 --> 00:00:41.070
Ele também não está aqui!

00:00:47.640 --> 00:00:49.270
Onde você está?!
`;

  it('le as falas de um WebVTT padrao', () => {
    const falas = lerVtt(VTT_REAL);
    expect(falas.length).toBe(3);
    expect(falas[0].inicio).toBeCloseTo(31.01, 2);
    expect(falas[0].fim).toBeCloseTo(32.57, 2);
    expect(falas[0].texto).toBe('Ele não está aqui.');
    expect(falas[2].texto).toBe('Onde você está?!');
  });

  it('aceita o formato sem hora e com virgula', () => {
    const falas = lerVtt('WEBVTT\n\n01:02,500 --> 01:03,750\nOi\n');
    expect(falas.length).toBe(1);
    expect(falas[0].inicio).toBeCloseTo(62.5, 2);
    expect(falas[0].fim).toBeCloseTo(63.75, 2);
  });

  it('aceita o identificador numerico antes do tempo', () => {
    const falas = lerVtt('WEBVTT\n\n1\n00:00:01.000 --> 00:00:02.000\nPrimeira\n\n2\n00:00:03.000 --> 00:00:04.000\nSegunda\n');
    expect(falas.length).toBe(2);
    expect(falas[0].texto).toBe('Primeira');
    expect(falas[1].texto).toBe('Segunda');
  });

  it('ignora configuracoes depois do tempo', () => {
    const falas = lerVtt('WEBVTT\n\n00:00:01.000 --> 00:00:02.000 align:start position:10%\nOi\n');
    expect(falas.length).toBe(1);
    expect(falas[0].texto).toBe('Oi');
  });

  it('junta fala de multiplas linhas', () => {
    const falas = lerVtt('WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nlinha um\nlinha dois\n');
    expect(falas[0].texto).toBe('linha um\nlinha dois');
  });

  it('pula blocos NOTE, STYLE e REGION', () => {
    const conteudo = `WEBVTT

NOTE isto e um comentario
que continua na linha seguinte

STYLE
::cue { color: yellow }

00:00:01.000 --> 00:00:02.000
Fala real
`;
    const falas = lerVtt(conteudo);
    expect(falas.length).toBe(1);
    expect(falas[0].texto).toBe('Fala real');
  });

  it('descarta falas com tempo invalido ou invertido', () => {
    // Uma duracao zero deixaria o cue nunca aparecendo, e o navegador erro ao receber.
    expect(lerVtt('WEBVTT\n\n00:00:05.000 --> 00:00:05.000\nIgual\n').length).toBe(0);
    expect(lerVtt('WEBVTT\n\n00:00:09.000 --> 00:00:05.000\nInvertida\n').length).toBe(0);
    expect(lerVtt('WEBVTT\n\nsem tempo aqui\nFala\n').length).toBe(0);
  });

  it('aceita CRLF e BOM', () => {
    const falas = lerVtt('﻿WEBVTT\r\n\r\n00:00:01.000 --> 00:00:02.000\r\nOi\r\n');
    expect(falas.length).toBe(1);
    expect(falas[0].texto).toBe('Oi');
  });

  it('devolve lista vazia em vez de estourar com conteudo invalido', () => {
    expect(lerVtt('')).toEqual([]);
    expect(lerVtt('qualquer coisa')).toEqual([]);
    expect(lerVtt('WEBVTT\n\n')).toEqual([]);
  });
});
