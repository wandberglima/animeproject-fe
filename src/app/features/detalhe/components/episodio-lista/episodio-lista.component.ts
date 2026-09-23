import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Episodio } from '../../../../core/models/episodio.model';
import { Temporada } from '../../../../core/models/anime.model';

@Component({
  selector: 'app-episodio-lista',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './episodio-lista.component.html',
  styleUrls: ['./episodio-lista.component.scss'],
})
export class EpisodioListaComponent {
  @Input() animeId = 0;
  @Input() temporadas: Temporada[] = [];
  @Input() episodioAtual?: number;

  rotaDoEpisodio(episodio: Episodio): string {
    return `/assistir/${this.animeId}/${episodio.numero}`;
  }
}