import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { first } from 'rxjs';

import { Anime } from '../../core/models/anime.model';
import { FavoritoService } from '../../core/services/favorito.service';
import { AnimeCardComponent } from '../../shared/ui/anime-card/anime-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';

@Component({
  selector: 'app-minha-lista-page',
  standalone: true,
  imports: [
    RouterLink,
    SectionHeaderComponent,
    AnimeCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './minha-lista.page.html',
  styleUrls: ['./minha-lista.page.scss'],
})
export class MinhaListaPageComponent implements OnInit {
  carregando = true;
  erro = false;
  favoritos: Anime[] = [];

  constructor(private favoritoService: FavoritoService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = false;
    this.favoritoService
      .listar()
      .pipe(first())
      .subscribe({
        next: (favoritos) => {
          this.favoritos = favoritos;
          this.carregando = false;
        },
        error: () => {
          this.carregando = false;
          this.erro = true;
        },
      });
  }
}