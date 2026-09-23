import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Anime } from '../../../../core/models/anime.model';
import { IDIOMA_LABEL, STATUS_ANIME_LABEL } from '../../../../core/models/enums';
import { GENEROS } from '../../../../core/models/genero';
import { RatingBadgeComponent } from '../../../../shared/ui/rating-badge/rating-badge.component';
import { FavoritoButtonComponent } from '../favorito-button/favorito-button.component';

@Component({
  selector: 'app-anime-hero',
  standalone: true,
  imports: [RouterLink, RatingBadgeComponent, FavoritoButtonComponent],
  templateUrl: './anime-hero.component.html',
  styleUrls: ['./anime-hero.component.scss'],
})
export class AnimeHeroComponent {
  readonly statusLabel = STATUS_ANIME_LABEL;
  readonly idiomaLabel = IDIOMA_LABEL;
  readonly generos = GENEROS;

  @Input() anime!: Anime;
  @Input() favoritado = false;
  @Input() favoritadoCarregando = false;

  @Output() alternarFavorito = new EventEmitter<void>();

  get fundo(): string {
    return `url('${this.anime.bannerUrl || this.anime.capaUrl}')`;
  }

  get primeiroEpisodioNumero(): number {
    const primeiro = this.anime.temporadas[0]?.episodios[0];
    return primeiro?.numero ?? 1;
  }
}