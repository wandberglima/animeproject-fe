import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { first } from 'rxjs';

import { Anime } from '../../core/models/anime.model';
import { Idioma } from '../../core/models/enums';
import { Episodio } from '../../core/models/episodio.model';
import { LegendaStream, StreamInfo } from '../../core/models/stream.model';
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
  readonly Idioma = Idioma;

  carregando = true;
  erro = false;
  anime?: Anime;
  episodio?: Episodio;
  stream?: StreamInfo;
  streamCarregando = false;
  streamIndisponivel = false;
  idioma: Idioma = Idioma.LEGENDADO;
  avisoIdioma?: string;

  /**
   * Legendas com URL ja absoluta, calculadas uma vez por stream.
   *
   * Este valor era um getter que devolvia um array novo a cada ciclo de deteccao. O Angular compara
   * o binding por referencia, entao `ngOnChanges` do player disparava continuamente: o hls.js era
   * destruido e recriado cerca de 125 vezes por segundo, o `play()` era abortado a cada vez
   * ("interrompido por uma nova carga") e o proxy recebia milhares de pedidos, esgotando as vagas e
   * respondendo 503. Era essa a origem de "o episodio para de reproduzir".
   */
  private legendasResolvidas: LegendaStream[] = [];

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
    this.avisoIdioma = undefined;
    this.animeService
      .obterStream(this.animeId, this.numeroAtual, this.idioma)
      .pipe(first())
      .subscribe({
        next: (stream) => {
          this.stream = stream;
          this.legendasResolvidas = (stream.legendas ?? []).map((legenda) => ({
            ...legenda,
            url: this.absoluto(legenda.url),
          }));
          this.streamCarregando = false;
          // O backend cai para a legenda quando o provider nao tem dublagem. A resposta diz o que
          // foi entregue, e sem esta checagem o botao "Dublado" tocava legenda sem avisar.
          if (this.idioma === Idioma.DUBLADO && stream.idioma === 'sub') {
            this.avisoIdioma = 'Dublagem indisponível neste servidor; tocando a versão legendada.';
          } else if (this.idioma === Idioma.DUBLADO && !stream.idioma) {
            this.avisoIdioma = 'Servidor não informou o idioma entregue.';
          }
        },
        error: () => {
          this.streamCarregando = false;
          this.streamIndisponivel = true;
        },
      });
  }

  /** So troca o idioma quando existe dub; o backend cai para a legenda sozinho se nao houver. */
  alternarIdioma(): void {
    this.idioma = this.idioma === Idioma.LEGENDADO ? Idioma.DUBLADO : Idioma.LEGENDADO;
    if (this.idioma === Idioma.DUBLADO && !this.episodio?.dublado) {
      this.avisoIdioma = 'Este episódio não consta como dublado; o servidor tentará assim mesmo.';
    }
    this.carregarStream();
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

  /**
   * As faixas que o player deve oferecer. O StreamInfo ja trazia `legendas`, mas nada as levava
   * ate o componente, entao a legenda nunca aparecia mesmo quando o provider mandava pt-BR.
   * O prefixo do proxy e resolvido aqui porque o hls.js busca a URL diretamente.
   */
  get legendasDoStream(): LegendaStream[] {
    return this.legendasResolvidas;
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