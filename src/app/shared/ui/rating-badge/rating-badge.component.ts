import { Component, Input } from '@angular/core';
import { formatarNota } from '../../../core/utils/formatters';

@Component({
  selector: 'app-rating-badge',
  standalone: true,
  templateUrl: './rating-badge.component.html',
  styleUrls: ['./rating-badge.component.scss'],
})
export class RatingBadgeComponent {
  @Input() nota: number | null = null;

  get valor(): string {
    return formatarNota(this.nota);
  }

  get exibir(): boolean {
    return this.nota != null;
  }
}