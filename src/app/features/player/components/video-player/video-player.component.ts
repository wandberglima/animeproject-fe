import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import Hls from 'hls.js';

import { LegendaStream } from '../../../../core/models/stream.model';
import { codigoIdioma, pesoIdioma, rotuloIdioma } from '../../../../shared/utils/idioma-legenda';
import { FalasLegenda, lerVtt } from '../../../../shared/utils/legenda-vtt';
import { SafeUrlPipe } from '../../../../shared/pipes/safe-url.pipe';

/**
 * `TextTrackList.remove` faz parte da spec e o Chrome implementa, mas o lib.dom.d.ts do
 * TypeScript ainda expoe so `getTrackById`. O cast deixa o uso correto e o `typeof` cobre o
 * navegador que nao tem o metodo.
 */
interface TextTrackListRemovivel extends TextTrackList {
  remove?: (track: TextTrack) => void;
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() videoUrl = '';
  @Input() streamUrl = '';
  @Input() streamHls = false;
  /**
   * Faixas de legenda do provider. O StreamInfo ja trazia `legendas`, mas o componente nao tinha
   * suporte nenhum a legenda: o video tocava sem legenda. Agora cada faixa e lida, convertida em
   * falas e ligada na TextTrack do video, com pt-BR ja ativo.
   */
  @Input() legendas: LegendaStream[] = [];
  @ViewChild('playerVideo') private videoElement?: ElementRef<HTMLVideoElement>;

  private hls?: Hls;
  private hlsPendente = false;
  /**
   * Alinhado por posicao com `legendasOrdenadas`: a posicao e o indice do indiceAtiva. Uma faixa
   * que falhou ao baixar fica como undefined no lugar, para nao trocar o indice de uma por outra.
   */
  private faixas: (TextTrack | undefined)[] = [];
  private indiceAtiva = -1;
  private legendasCarregadasPara = '';
  /** Erros fatais seguidos do hls.js; acima do limite o player desiste em vez de insistir. */
  private errosFataisSeguidos = 0;
  /** Elemento onde as faixas foram criadas, para nao repetir a carga no mesmo <video>. */
  private elementoDasLegendas?: HTMLVideoElement;

  private readonly fontesIframe = [
    'youtube',
    'youtu.be',
    'vimeo',
    'dailymotion',
    'mp4upload',
    'streamtape',
    'gogoplayer',
    'iframe',
  ];

  get ehIframe(): boolean {
    const url = this.videoUrl.toLowerCase();
    return this.fontesIframe.some((fonte) => url.includes(fonte));
  }

  /** pt-BR primeiro, depois as demais na ordem em que o provider devolveu. */
  get legendasOrdenadas(): LegendaStream[] {
    const origem = this.legendas;
    return [...origem].sort((a, b) => {
      const peso = this.peso(b) - this.peso(a);
      return peso !== 0 ? peso : origem.indexOf(a) - origem.indexOf(b);
    });
  }

  /** Faixas que realmente carregaram, para o seletor nao oferecer legenda quebrada. */
  get legendasDisponiveis(): LegendaStream[] {
    return this.legendasOrdenadas.filter((_, indice) => this.faixas[indice] !== undefined);
  }

  /**
   * Indice da faixa que entra ligada: a primeira que carregou, na ordem de preferencia.
   *
   * Precisa conferir `faixas` de proposito. O provider manda varias faixas e a pt-BR nem sempre
   * esta disponivel (o animeparadise so devolve ingles); se a escolhida falhasse ao baixar, o
   * indice apontaria para um espaco vazio e todas as faixas que deram certo ficariam desligadas,
   * ou seja, o episodio tocaria sem legenda nenhuma.
   */
  get indicePreferido(): number {
    return this.legendasOrdenadas.findIndex((_legenda, indice) => this.faixas[indice] !== undefined);
  }

  get temLegendas(): boolean {
    return this.legendasDisponiveis.length > 0;
  }

  get indiceSelecionado(): number {
    return this.indiceAtiva;
  }

  rotulo(legenda: LegendaStream): string {
    const original = legenda.rotulo || legenda.idioma;
    // A deteccao junta idioma e rotulo porque o provider as vezes so escreve o pais no rotulo
    // ("portuguese" no idioma, "Portuguese (Brazil)" no rotulo) e as vezes so no rotulo.
    const deteccao = `${legenda.idioma} ${original}`;
    const amigavel = rotuloIdioma(deteccao);
    // Fora do portugues `rotuloIdioma` devolve a propria entrada, ou seja, a deteccao: nesse caso o
    // rotulo do provider e devolvido intacto, sem repetir o idioma duas vezes.
    if (amigavel === deteccao) {
      return original;
    }
    // Duas faixas de portugues podem cair no mesmo nome ("Portuguese" e "Portuguese 2"). Quando
    // isso acontece o rotulo do provider volta como complemento, senao o seletor mostraria duas
    // opcoes identicas e nao daria para escolher entre elas.
    const repetidas = this.legendasOrdenadas.filter(
      (outra) => rotuloIdioma(`${outra.idioma} ${outra.rotulo || outra.idioma}`) === amigavel,
    );
    return repetidas.length > 1 ? `${amigavel} — ${original}` : amigavel;
  }

  track(indice: number): number {
    return indice;
  }

  alterarLegenda(indice: number): void {
    this.indiceAtiva = indice;
    this.aplicarLegendas();
  }

  ngOnChanges(): void {
    this.programarInicio();
  }

  ngAfterViewInit(): void {
    this.programarInicio();
  }

  ngOnDestroy(): void {
    this.pararHls();
  }

  /**
   * Peso da faixa na ordenacao, direto de `pesoIdioma`.
   *
   * O segundo degrau e o que importa aqui: o megaplay nomeia a faixa pt-BR apenas como
   * "Portuguese", sem dizer o pais. Se so contasse pt-BR explicito, essa faixa ficaria com o mesmo
   * peso do ingles e do arabe, e o arabe, que vem antes na lista do provider, seria a legenda
   * escolhida por padrao.
   */
  private peso(legenda: LegendaStream): number {
    return pesoIdioma(`${legenda.idioma} ${legenda.rotulo}`);
  }

  private programarInicio(): void {
    this.pararHls();
    if (!this.streamUrl || !this.streamHls) {
      return;
    }
    const tentar = (): boolean => {
      const elemento = this.videoElement?.nativeElement;
      if (!elemento) {
        return false;
      }
      this.iniciarHls(elemento);
      return true;
    };
    if (tentar()) {
      return;
    }
    this.hlsPendente = true;
    setTimeout(() => {
      if (this.hlsPendente) {
        tentar();
      }
    }, 0);
  }

  private iniciarHls(video: HTMLVideoElement): void {
    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        backBufferLength: 90,
        // Por padrao o hls.js repete uma carga que falhou indefinidamente. Com o CDN devolvendo
        // 502 de vez em quando, isso virou mais de mil requisicoes em 20 segundos: nao era o
        // player travado, era ele martelando o proxy ate derrubar a API. Aqui a retentativa e
        // curta e limitada.
        manifestLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: 10000,
            maxLoadTimeMs: 20000,
            timeoutRetry: { maxNumRetry: 2, retryDelayMs: 500, maxRetryDelayMs: 2000 },
            errorRetry: { maxNumRetry: 2, retryDelayMs: 500, maxRetryDelayMs: 2000 },
          },
        },
        fragLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: 10000,
            maxLoadTimeMs: 30000,
            timeoutRetry: { maxNumRetry: 3, retryDelayMs: 500, maxRetryDelayMs: 2000 },
            errorRetry: { maxNumRetry: 3, retryDelayMs: 500, maxRetryDelayMs: 2000 },
          },
        },
      });
      this.hls.loadSource(this.streamUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.ERROR, (_evento, dados) => {
        if (dados.fatal) {
          // O hls.js engole o erro e o player simplesmente para, sem dizer nada no console. Sem
          // esta linha "o episodio parou de reproduzir" nao tem causa nenhuma: so se sabe que algo
          // deu errado, nao o que.
          console.warn('hls.js: erro fatal', dados.type, dados.details);
          // `startLoad()` e `recoverMediaError()` sao retentativas infinitas. Quando o host de
          // video esta fora do ar, o hls.js refaz a busca indefinidamente: foram mais de mil
          // requisicoes em poucos segundos, o que derruba o proxy e transforma um problema de
          // CDN em "a API inteira parou". Tres tentativas e desistimos.
          if (this.errosFataisSeguidos >= 3) {
            this.pararHls();
            return;
          }
          this.errosFataisSeguidos++;
          switch (dados.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              this.hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.hls?.recoverMediaError();
              break;
            default:
              this.pararHls();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = this.streamUrl;
    }
    void this.carregarLegendas(video);
  }

  /**
   * Busca cada arquivo .vtt e monta as falas na TextTrack do video. As URLs ja vem do proxy da
   * propria API, entao sao mesma origem e o fetch funciona. Ler o arquivo aqui tambem contorna o
   * "application/octet-stream" que o proxy devolve, que faria o navegador recusar um <track src>,
   * e a ausencia da API de legenda externa no hls.js 1.7.
   */
  private async carregarLegendas(video: HTMLVideoElement): Promise<void> {
    const ordenadas = this.legendasOrdenadas;
    if (ordenadas.length === 0) {
      this.removerFaixas(video);
      return;
    }
    const assinatura = ordenadas.map((l) => l.url).join('|');
    // Uma carga por conjunto de faixas e por elemento. Sem esta guarda, `programarInicio` (chamado
    // por ngOnChanges e por ngAfterViewInit) disparava duas leituras: cada uma baixava os 3
    // arquivos de novo e criava 3 TextTracks, e o video acabava com as mesmas faixas duplicadas,
    // metade delas com mode "hidden" e a legenda errada aparecendo.
    if (assinatura === this.legendasCarregadasPara && this.elementoDasLegendas === video) {
      return;
    }
    this.removerFaixas(video);
    this.elementoDasLegendas = video;
    this.legendasCarregadasPara = assinatura;
    this.faixas = new Array(ordenadas.length).fill(undefined);
    this.indiceAtiva = -1;

    await Promise.all(
      ordenadas.map(async (legenda, indice) => {
        try {
          const resposta = await fetch(legenda.url);
          if (!resposta.ok) {
            return;
          }
          const falas: FalasLegenda[] = lerVtt(await resposta.text());
          if (falas.length === 0) {
            return;
          }
          const faixa = video.addTextTrack('subtitles', this.rotulo(legenda), codigoIdioma(legenda.idioma));
          for (const fala of falas) {
            faixa.addCue(this.criarCue(fala));
          }
          this.faixas[indice] = faixa;
        } catch {
          // Faixa indisponivel: o video segue sem ela, sem derrubar as demais.
        }
      })
    );
    this.indiceAtiva = this.indicePreferido;
    this.aplicarLegendas();
  }

/**
   * As TextTracks pertencem ao elemento <video>, nao a este componente. Sem remover as antigas,
   * uma segunda carga no mesmo elemento empilhava outro conjunto e o seletor passava a oferecer
   * "Portuguese" duas vezes.
   */
  private removerFaixas(video: HTMLVideoElement): void {
    const lista = video.textTracks as TextTrackListRemovivel;
    for (let i = video.textTracks.length - 1; i >= 0; i--) {
      const faixa = video.textTracks[i];
      if (typeof lista.remove === 'function') {
        lista.remove(faixa);
      } else {
        // Navegador sem `remove`: esvazia as falas e desliga, para a faixa velha nao piscar na tela.
        if (faixa.cues) {
          for (let c = faixa.cues.length - 1; c >= 0; c--) {
            faixa.removeCue(faixa.cues[c]);
          }
        }
        faixa.mode = 'disabled';
      }
    }
    this.faixas = [];
    this.indiceAtiva = -1;
  }

  /** Cue de WebVTT, que e o unico tipo de cue que o construtor aceita. */
  private criarCue(fala: FalasLegenda): TextTrackCue {
    return new VTTCue(fala.inicio, fala.fim, fala.texto);
  }

  private aplicarLegendas(): void {
    this.faixas.forEach((faixa, indice) => {
      if (faixa) {
        faixa.mode = indice === this.indiceAtiva ? 'showing' : 'disabled';
      }
    });
  }

  private pararHls(): void {
    this.hlsPendente = false;
    this.errosFataisSeguidos = 0;
    if (this.hls) {
      this.hls.destroy();
      this.hls = undefined;
    }
    // Aqui nao se apaga `legendasCarregadasPara`: `programarInicio` chama `pararHls` no começo e
    // roda mais de uma vez na mesma exibicao. Zerar a guarda aqui faria a legenda ser baixada e
    // recriada a cada chamada, duplicando as faixas no video.
  }
}
