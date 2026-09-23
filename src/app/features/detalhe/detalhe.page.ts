import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';

import { Anime } from '../../core/models/anime.model';
import { AnimeService } from '../../core/services/anime.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoritoService } from '../../core/services/favorito.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { AnimeHeroComponent } from './components/anime-hero/anime-hero.component';
import { EpisodioListaComponent } from './components/episodio-lista/episodio-lista.component';

@Component({
  selector: 'app-detalhe-page',
  standalone: true,
  imports: [
    AnimeHeroComponent,
    EpisodioListaComponent,
    SectionHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './detalhe.page.html',
  styleUrls: ['./detalhe.page.scss'],
})
export class DetalhePageComponent implements OnInit, OnDestroy {
  carregando = true;
  erro = false;
  anime?: Anime;

  favoritado = false;
  favoritadoCarregando = false;

  private animeId = 0;
  private paramsSubscription?: { unsubscribe(): void };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animeService: AnimeService,
    private favoritoService: FavoritoService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.paramsSubscription = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id && id !== this.animeId) {
        this.animeId = id;
        this.carregar();
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = false;
    this.animeService
      .obter(this.animeId)
      .pipe(first())
      .subscribe({
        next: (anime) => {
          this.anime = anime;
          this.carregando = false;
          this.verificarFavorito();
        },
        error: () => {
          this.carregando = false;
          this.erro = true;
        },
      });
  }

  private verificarFavorito(): void {
    if (!this.authService.usuario) {
      this.favoritado = false;
      return;
    }
    this.favoritoService
      .listar()
      .pipe(first())
      .subscribe({
        next: (favoritos) => {
          this.favoritado = favoritos.some((a) => a.id === this.animeId);
        },
      });
  }

  alternarFavorito(): void {
    if (!this.authService.usuario) {
      const redirect = encodeURIComponent(`/animes/${this.animeId}`);
      void this.router.navigate(['/login'], { queryParams: { redirect } });
      return;
    }
    this.favoritadoCarregando = true;
    const acao = this.favoritado
      ? this.favoritoService.desfavoritar(this.animeId)
      : this.favoritoService.favoritar(this.animeId);
    acao.pipe(first()).subscribe({
      next: () => {
        this.favoritado = !this.favoritado;
        this.favoritadoCarregando = false;
      },
      error: () => {
        this.favoritadoCarregando = false;
      },
    });
  }
}