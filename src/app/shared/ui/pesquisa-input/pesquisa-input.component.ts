import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-pesquisa-input',
  standalone: true,
  imports: [FormsModule, IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './pesquisa-input.component.html',
  styleUrls: ['./pesquisa-input.component.scss'],
})
export class PesquisaInputComponent {
  termoLocal = '';

  @Input() placeholder = 'Buscar animes...';

  @Input()
  set termo(valor: string | null | undefined) {
    this.termoLocal = valor ?? '';
  }

  @Output() buscar = new EventEmitter<string>();

  aoBuscar(): void {
    this.buscar.emit(this.termoLocal.trim());
  }
}