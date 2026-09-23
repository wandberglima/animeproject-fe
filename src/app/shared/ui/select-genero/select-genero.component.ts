import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { GENEROS } from '../../../core/models/genero';

@Component({
  selector: 'app-select-genero',
  standalone: true,
  imports: [FormsModule, SelectModule],
  templateUrl: './select-genero.component.html',
  styleUrls: ['./select-genero.component.scss'],
})
export class SelectGeneroComponent {
  readonly generos = GENEROS;

  private _genero: string | null = null;

  @Input() placeholder = 'Gênero';

  @Input()
  set genero(valor: string | null | undefined) {
    this._genero = valor ?? null;
  }

  get genero(): string | null {
    return this._genero;
  }

  @Output() generoChange = new EventEmitter<string | null>();

  aoSelecionar(valor: string | null): void {
    this._genero = valor ?? null;
    this.generoChange.emit(this._genero);
  }
}