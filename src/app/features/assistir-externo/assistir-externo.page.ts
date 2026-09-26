import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs';

import { environment } from '../../../environments/environment';
import { StreamInfo } from '../../core/models/stream.model';
import { AnimeService } from '../../core/services/anime.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';
import { VideoPlayerComponent } from '../player/components/video-player/video-player.component';

@Component({
  selector: 'app-assistir-externo-page',
  standalone: true,
  imports: [VideoPlayerComponent, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './assistir-externo.page.html',
  styleUrls: ['./assistir-externo.page.scss'],
})
export class AssistirExternoPageComponent implements OnInit, OnDestroy {
  carregando = true;
  streamIndisponivel = false;
  stream?: StreamInfo;

  provider = '';
  mediaId = '';

  private paramsSubscription?: { unsubscribe(): void };

  constructor(private route: ActivatedRoute, private animeService: AnimeService) {}

  ngOnInit(): void {
    this.paramsSubscription = this.route.paramMap.subscribe((params) => {
      const provider = params.get('provider') ?? '';
      const mediaId = params.get('mediaId') ?? '';
      if (provider !== this.provider || mediaId !== this.mediaId) {
        this.provider = provider;
        this.mediaId = mediaId;
        this.carregar();
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  carregar(): void {
    this.stream = undefined;
    this.carregando = true;
    this.streamIndisponivel = false;
    this.animeService
      .obterStreamExterno(this.provider, this.mediaId)
      .pipe(first())
      .subscribe({
        next: (stream) => {
          this.stream = stream;
          this.carregando = false;
        },
        error: () => {
          this.carregando = false;
          this.streamIndisponivel = true;
        },
      });
  }

  get urlDoVideo(): string {
    return this.stream?.url ? this.absoluto(this.stream.url) : '';
  }

  get ehHls(): boolean {
    return this.stream?.tipo === 'HLS';
  }

  private absoluto(url: string): string {
    if (!url.startsWith('/')) {
      return url;
    }
    const origem = new URL(environment.apiUrl).origin;
    return `${origem}${url}`;
  }
}