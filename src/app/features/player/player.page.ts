import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { first } from 'rxjs';

import { Anime } from '../../core/models/anime.model';
import { Episodio } from '../../core/models/episodio.model';
import { StreamInfo } from '../../core/models/stream.model';
import { AnimeService } from '../../core/services/anime.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';
import { EpisodioListaComponent } from '../detalhe/components/episodio-lista/episodio-lista.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { environment } from '../../../environments/environment';

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
  stream?: StreamInfo;
  streamCarregando = false;
  streamIndisponivel = false;

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
        this.stream = undefined;
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
        this.carregarStream();
        return;
      }
    }
  }

  private carregarStream(): void {
    this.stream = undefined;
    this.streamCarregando = true;
    this.streamIndisponivel = false;
    this.animeService
      .obterStream(this.animeId, this.numeroAtual)
      .pipe(first())
      .subscribe({
        next: (stream) => {
          this.stream = stream;
          this.streamCarregando = false;
        },
        error: () => {
          this.streamCarregando = false;
          this.streamIndisponivel = true;
        },
      });
  }

  private absoluto(url: string): string {
    if (!url.startsWith('/')) {
      return url;
    }
    const origem = new URL(environment.apiUrl).origin;
    return `${origem}${url}`;
  }

  get urlDoVideo(): string {
    if (this.stream?.url) {
      return this.absoluto(this.stream.url);
    }
    return this.episodio?.videoUrl ?? '';
  }

  get usaStream(): boolean {
    return Boolean(this.stream?.url);
  }

  get ehHls(): boolean {
    return this.stream?.tipo === 'HLS';
  }

  get usandoStream(): boolean {
    return this.usaStream || this.streamCarregando || (this.streamIndisponivel && !this.episodio?.videoUrl);
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