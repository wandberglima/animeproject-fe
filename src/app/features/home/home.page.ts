import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { first } from 'rxjs';

import { GENEROS } from '../../core/models/genero';
import { HomeData } from '../../core/models/home.model';
import { HomeService } from '../../core/services/home.service';
import { AnimeCardComponent } from '../../shared/ui/anime-card/anime-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { EpisodioCardComponent } from '../../shared/ui/episodio-card/episodio-card.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';
import { RatingBadgeComponent } from '../../shared/ui/rating-badge/rating-badge.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { HeroCarouselComponent } from './components/hero-carousel/hero-carousel.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterLink,
    HeroCarouselComponent,
    SectionHeaderComponent,
    AnimeCardComponent,
    EpisodioCardComponent,
    RatingBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePageComponent implements OnInit {
  readonly generos = GENEROS;

  carregando = true;
  erro = false;
  dados?: HomeData;

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = false;
    this.homeService
      .obterDados()
      .pipe(first())
      .subscribe({
        next: (dados) => {
          this.dados = dados;
          this.carregando = false;
        },
        error: () => {
          this.carregando = false;
          this.erro = true;
        },
      });
  }
}