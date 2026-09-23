import { Component, Input } from '@angular/core';

import { SafeUrlPipe } from '../../../../shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent {
  @Input() videoUrl = '';

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
}