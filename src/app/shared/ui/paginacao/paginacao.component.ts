import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';

export interface EventoPagina {
  pagina: number;
  primeiro: number;
  rows: number;
}

@Component({
  selector: 'app-paginacao',
  standalone: true,
  imports: [PaginatorModule],
  templateUrl: './paginacao.component.html',
  styleUrls: ['./paginacao.component.scss'],
})
export class PaginacaoComponent {
  @Input() totalRecords = 0;
  @Input() rows = 24;
  @Input() pagina = 0;

  @Output() paginaChange = new EventEmitter<EventoPagina>();

  get primeiro(): number {
    return this.pagina * this.rows;
  }

  aoMudarPagina(evento: { first?: number; rows?: number; page?: number }): void {
    this.paginaChange.emit({
      pagina: evento.page ?? 0,
      primeiro: evento.first ?? 0,
      rows: evento.rows ?? this.rows,
    });
  }
}