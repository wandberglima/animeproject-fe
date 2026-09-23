import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Anime } from '../../../core/models/anime.model';
import { RatingBadgeComponent } from '../rating-badge/rating-badge.component';

@Component({
  selector: 'app-anime-card',
  standalone: true,
  imports: [RouterLink, RatingBadgeComponent],
  templateUrl: './anime-card.component.html',
  styleUrls: ['./anime-card.component.scss'],
})
export class AnimeCardComponent {
  @Input() anime!: Anime;
  @Input() link?: string;

  @Output() abrirDetalhes = new EventEmitter<void>();

  get rota(): string | undefined {
    return this.link ?? (this.anime ? `/animes/${this.anime.id}` : undefined);
  }
}