import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { Usuario } from '../../../core/models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';
import { AuthMenuComponent } from '../../ui/auth-menu/auth-menu.component';
import { PesquisaInputComponent } from '../../ui/pesquisa-input/pesquisa-input.component';
import { SelectGeneroComponent } from '../../ui/select-genero/select-genero.component';
import { SiteLogoComponent } from '../../ui/site-logo/site-logo.component';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MenuModule,
    SiteLogoComponent,
    PesquisaInputComponent,
    SelectGeneroComponent,
    AuthMenuComponent,
  ],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss'],
})
export class SiteHeaderComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;

  generosSelecionados: string[] = [];
  itensMobile: MenuItem[] = [];

  private authSubscription?: { unsubscribe(): void };

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
    });
    this.itensMobile = [
      { label: 'Início', icon: 'pi pi-home', routerLink: '/' },
      { label: 'Lista de Animes', icon: 'pi pi-th-large', routerLink: '/animes' },
      { label: 'Mangás', icon: 'pi pi-book', routerLink: '/mangas' },
    ];
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  aoBuscar(termo: string): void {
    this.router.navigate(['/animes'], { queryParams: { q: termo || null } });
  }

  aoFiltrarGenero(generos: string[]): void {
    this.generosSelecionados = generos;
    this.router.navigate(['/animes'], {
      queryParams: { genero: generos.length ? generos : null },
      queryParamsHandling: 'merge',
    });
  }

  aoLogin(): void {
    this.router.navigate(['/login']);
  }

  aoLogout(): void {
    this.authService.sair();
  }
}