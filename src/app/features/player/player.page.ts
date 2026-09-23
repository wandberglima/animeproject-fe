import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { first } from 'rxjs';

import { Anime } from '../../core/models/anime.model';
import { Episodio } from '../../core/models/episodio.model';
import { AnimeService } from '../../core/services/anime.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';
import { EpisodioListaComponent } from '../detalhe/components/episodio-lista/episodio-lista.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';

@Component({
  selector: 'app-player-page',
  standalone: true,
  imports: [
    RouterLink,
    VideoPlayerComponent,
    EpisodioListaComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPageComponent implements OnInit, OnDestroy {
  carregando = true;
  erro = false;
  anime?: Anime;
  episodio?: Episodio;

  private animeId = 0;
  private numeroAtual = 0;
  private paramsSubscription?: { unsubscribe(): void };

  constructor(private route: ActivatedRoute, private animeService: AnimeService) {}

  get numeroParam(): number {
    return this.numeroAtual;
  }

  ngOnInit(): void {
    this.paramsSubscription = this.route.paramMap.subscribe((params) => {
      const animeId = Number(params.get('animeId'));
      const numero = Number(params.get('numero'));
      if (animeId !== this.animeId) {
        this.animeId = animeId;
        this.anime = undefined;
        this.episodio = undefined;
        this.carregar();
      }
      this.numeroAtual = numero;
      this.localizar();
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
          this.localizar();
        },
        error: () => {
          this.carregando = false;
          this.erro = true;
        },
      });
  }

  private localizar(): void {
    this.episodio = undefined;
    if (!this.anime) {
      return;
    }
    for (const temporada of this.anime.temporadas) {
      const encontrado = temporada.episodios.find((e) => e.numero === this.numeroAtual);
      if (encontrado) {
        this.episodio = encontrado;
        return;
      }
    }
  }

  get episodios(): Episodio[] {
    return this.anime?.temporadas.flatMap((t) => t.episodios) ?? [];
  }

  get indiceAtual(): number {
    return this.episodios.findIndex((e) => e.numero === this.numeroAtual);
  }

  get anterior(): Episodio | undefined {
    const indice = this.indiceAtual;
    return indice > 0 ? this.episodios[indice - 1] : undefined;
  }

  get proximo(): Episodio | undefined {
    const indice = this.indiceAtual;
    return indice >= 0 && indice < this.episodios.length - 1 ? this.episodios[indice + 1] : undefined;
  }
}