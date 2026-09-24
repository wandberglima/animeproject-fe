import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import Hls from 'hls.js';

import { SafeUrlPipe } from '../../../../shared/pipes/safe-url.pipe';

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
  @ViewChild('playerVideo') private videoElement?: ElementRef<HTMLVideoElement>;

  private hls?: Hls;
  private hlsPendente = false;

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

  ngOnChanges(): void {
    this.programarInicio();
  }

  ngAfterViewInit(): void {
    this.programarInicio();
  }

  ngOnDestroy(): void {
    this.pararHls();
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
      this.hls = new Hls({ enableWorker: true, backBufferLength: 90 });
      this.hls.loadSource(this.streamUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.ERROR, (_evento, dados) => {
        if (dados.fatal) {
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
  }

  private pararHls(): void {
    this.hlsPendente = false;
    if (this.hls) {
      this.hls.destroy();
      this.hls = undefined;
    }
  }
}