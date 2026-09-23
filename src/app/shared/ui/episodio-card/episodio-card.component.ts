import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EpisodioRecente } from '../../../core/models/anime.model';
import { IdiomaBadgeComponent } from '../idioma-badge/idioma-badge.component';
import { formatarData } from '../../../core/utils/formatters';

@Component({
  selector: 'app-episodio-card',
  standalone: true,
  imports: [RouterLink, IdiomaBadgeComponent],
  templateUrl: './episodio-card.component.html',
  styleUrls: ['./episodio-card.component.scss'],
})
export class EpisodioCardComponent {
  @Input() episodioRecente!: EpisodioRecente;

  get data(): string {
    return formatarData(this.episodioRecente?.episodio.dataLancamento);
  }

  get rota(): string {
    const { anime, episodio } = this.episodioRecente;
    return `/assistir/${anime.id}/${episodio.numero}`;
  }
}