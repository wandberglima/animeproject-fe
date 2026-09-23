import { Component, Input } from '@angular/core';
import { Idioma, IDIOMA_LABEL } from '../../../core/models/enums';

@Component({
  selector: 'app-idioma-badge',
  standalone: true,
  templateUrl: './idioma-badge.component.html',
  styleUrls: ['./idioma-badge.component.scss'],
})
export class IdiomaBadgeComponent {
  @Input() idioma?: Idioma;
  readonly labels = IDIOMA_LABEL;
}