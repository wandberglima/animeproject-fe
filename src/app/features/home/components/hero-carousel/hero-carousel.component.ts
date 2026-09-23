import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';

import { DestaqueHome } from '../../../../core/models/home.model';
import { STATUS_ANIME_LABEL, StatusAnime } from '../../../../core/models/enums';
import { RatingBadgeComponent } from '../../../../shared/ui/rating-badge/rating-badge.component';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CarouselModule, RouterLink, RatingBadgeComponent],
  templateUrl: './hero-carousel.component.html',
  styleUrls: ['./hero-carousel.component.scss'],
})
export class HeroCarouselComponent {
  @Input() destaques: DestaqueHome[] = [];

  readonly statusLabel = STATUS_ANIME_LABEL;

  fundo(destaque: DestaqueHome): string {
    return `url('${destaque.anime.bannerUrl || destaque.anime.capaUrl}')`;
  }

  statusDoAnime(status: StatusAnime): string {
    return this.statusLabel[status];
  }
}