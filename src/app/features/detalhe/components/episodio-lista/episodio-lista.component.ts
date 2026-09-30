import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';

import { environment } from '../../../../../environments/environment';
import { Episodio } from '../../../../core/models/episodio.model';
import { Temporada } from '../../../../core/models/anime.model';

@Component({
  selector: 'app-episodio-lista',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DatePipe, AccordionModule],
  templateUrl: './episodio-lista.component.html',
  styleUrls: ['./episodio-lista.component.scss'],
})
export class EpisodioListaComponent implements OnChanges {
  @Input() animeId = 0;
  @Input() temporadas: Temporada[] = [];
  @Input() episodioAtual?: number;

  /** Temporadas abertas no accordion; por padrao apenas a mais recente. */
  abertas: number[] = [];

  /**
   * Temporadas da mais atual para a mais antiga, com os episodios de cada uma em ordem decrescente
   * (do mais novo para o mais antigo). Calculado uma vez por troca de anime para nao
   * recriar listas a cada ciclo de deteccao de mudancas.
   */
  temporadasOrdenadas: Temporada[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['temporadas'] || !this.temporadas.length) {
      return;
    }
    const ordenadas = [...this.temporadas]
      .sort((a, b) => b.numero - a.numero)
      .map((temporada) => ({ ...temporada, episodios: [...temporada.episodios].reverse() }));
    const maisRecente = ordenadas[0];
    this.abertas = [maisRecente.numero];
    this.temporadasOrdenadas = ordenadas;
  }

  rotaDoEpisodio(episodio: Episodio): string {
    return `/assistir/${this.animeId}/${episodio.numero}`;
  }

  gradienteDe(episodio: Episodio): string {
    const matiz = (episodio.temporada * 47 + episodio.numero * 31) % 360;
    return `linear-gradient(135deg, hsl(${matiz} 62% 42%), hsl(${(matiz + 48) % 360} 58% 26%))`;
  }

  urlDaCapa(episodio: Episodio): string | undefined {
    const capa = episodio.capaUrl;
    if (!capa) {
      return undefined;
    }
    return capa.startsWith('/') ? `${environment.apiUrl}${capa}` : capa;
  }
}
