import { Component, Input } from '@angular/core';
import { StatusAnime, STATUS_ANIME_LABEL } from '../../../core/models/enums';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent {
  @Input() status?: StatusAnime;
  readonly labels = STATUS_ANIME_LABEL;
}