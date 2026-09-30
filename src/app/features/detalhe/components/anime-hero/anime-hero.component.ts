import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Anime } from '../../../../core/models/anime.model';
import { FORMATO_LABEL, IDIOMA_LABEL, STATUS_ANIME_LABEL } from '../../../../core/models/enums';
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

  @Input() anime!: Anime;
  @Input() favoritado = false;
  @Input() favoritadoCarregando = false;

  @Output() alternarFavorito = new EventEmitter<void>();

  get fundo(): string {
    return `url('${this.anime.bannerUrl || this.anime.capaUrl}')`;
  }

  /** AniList devolve formato em sigla (TV, MOVIE, OVA, ONA, SPECIAL, TV_SHORT). */
  get formatoLabel(): string | undefined {
    const formato = this.anime.formato;
    return formato ? FORMATO_LABEL[formato] ?? formato : undefined;
  }

  get temDublagem(): boolean {
    return this.anime.temporadas.some((t) => t.episodios.some((e) => e.dublado));
  }

  get primeiroEpisodioNumero(): number {
    const primeiro = this.anime.temporadas[0]?.episodios[0];
    return primeiro?.numero ?? 1;
  }
}