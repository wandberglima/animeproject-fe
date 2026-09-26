import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BuscaExternaItem } from '../../../core/models/busca.model';

@Component({
  selector: 'app-busca-externa-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './busca-externa-card.component.html',
  styleUrls: ['./busca-externa-card.component.scss'],
})
export class BuscaExternaCardComponent {
  @Input() item!: BuscaExternaItem;

  get rota(): string {
    return `/assistir-externo/${this.item.provider}/${this.item.mediaId}`;
  }
}