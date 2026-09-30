import { Temporada } from '../../../../core/models/anime.model';

import { EpisodioListaComponent } from './episodio-lista.component';

function temporada(numero: number, ...numerosEpisodios: number[]): Temporada {
  return {
    numero,
    titulo: String(numero),
    episodios: numerosEpisodios.map((n) => ({
      id: numero * 1000 + n,
      animeId: 1,
      temporada: numero,
      numero: n,
      titulo: `Episodio ${n}`,
      idioma: 'LEGENDADO',
    })),
  } as Temporada;
}

describe('EpisodioListaComponent', () => {
  it('mostra as temporadas da mais atual para a mais antiga', () => {
    const componente = new EpisodioListaComponent();
    componente.temporadas = [temporada(1, 1, 2), temporada(2, 1, 2), temporada(3, 1, 2)];

    componente.ngOnChanges({
      temporadas: { currentValue: componente.temporadas, previousValue: [], firstChange: true, isFirstChange: () => true },
    });

    expect(componente.temporadasOrdenadas.map((t) => t.numero)).toEqual([3, 2, 1]);
  });

  it('abre a temporada mais recente e lista os episodios do mais novo para o mais antigo', () => {
    const componente = new EpisodioListaComponent();
    componente.temporadas = [temporada(1, 1, 2, 3), temporada(2, 7, 8)];

    componente.ngOnChanges({
      temporadas: { currentValue: componente.temporadas, previousValue: [], firstChange: true, isFirstChange: () => true },
    });

    expect(componente.abertas).toEqual([2]);
    expect(componente.temporadasOrdenadas[0].episodios.map((e) => e.numero)).toEqual([8, 7]);
    expect(componente.temporadasOrdenadas[1].episodios.map((e) => e.numero)).toEqual([3, 2, 1]);
  });

  it('nao altera as listas recebidas da API', () => {
    const componente = new EpisodioListaComponent();
    const original = [temporada(1, 1, 2), temporada(2, 3, 4)];
    componente.temporadas = original;

    componente.ngOnChanges({
      temporadas: { currentValue: original, previousValue: [], firstChange: true, isFirstChange: () => true },
    });

    expect(original.map((t) => t.numero)).toEqual([1, 2]);
    expect(original[0].episodios.map((e) => e.numero)).toEqual([1, 2]);
  });
});
