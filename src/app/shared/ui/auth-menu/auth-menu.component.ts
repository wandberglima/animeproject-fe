import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-auth-menu',
  standalone: true,
  imports: [AvatarModule, MenuModule],
  templateUrl: './auth-menu.component.html',
  styleUrls: ['./auth-menu.component.scss'],
})
export class AuthMenuComponent implements OnChanges {
  @Input() usuario: Usuario | null = null;

  @Output() loginClick = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  itens: MenuItem[] = [];

  ngOnChanges(): void {
    this.itens = [
      { label: 'Minha Lista', icon: 'pi pi-heart', routerLink: '/minha-lista' },
      { separator: true },
      { label: 'Sair', icon: 'pi pi-sign-out', command: () => this.logout.emit() },
    ];
  }

  iniciarSessao(): void {
    this.loginClick.emit();
  }
}