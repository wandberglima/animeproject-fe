import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-favorito-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './favorito-button.component.html',
  styleUrls: ['./favorito-button.component.scss'],
})
export class FavoritoButtonComponent {
  @Input() ativo = false;
  @Input() carregando = false;

  @Output() toggle = new EventEmitter<void>();

  aoClicar(): void {
    if (!this.carregando) {
      this.toggle.emit();
    }
  }
}