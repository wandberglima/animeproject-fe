import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss'],
})
export class SectionHeaderComponent {
  @Input() titulo = '';
  @Input() subtitulo?: string;
  @Input() link?: string;
  @Input() queryParams?: Params;
  @Input() linkLabel = 'Ver mais';

  @Output() verMais = new EventEmitter<void>();

  get exibirLink(): boolean {
    return !!this.link || this.verMais.observers.length > 0;
  }
}