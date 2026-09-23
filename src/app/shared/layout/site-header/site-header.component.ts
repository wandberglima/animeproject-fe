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

  generoSelecionado: string | null = null;
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
      {
        label: 'Legendado',
        icon: 'pi pi-closed-captioning',
        routerLink: '/animes',
        queryParams: { idioma: 'LEGENDADO' },
      },
      {
        label: 'Dublado',
        icon: 'pi pi-mic',
        routerLink: '/animes',
        queryParams: { idioma: 'DUBLADO' },
      },
      { label: 'Episódios', icon: 'pi pi-play', routerLink: '/' },
      { label: 'Gêneros', icon: 'pi pi-tag', routerLink: '/animes' },
    ];
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  aoBuscar(termo: string): void {
    this.router.navigate(['/animes'], { queryParams: { q: termo || null } });
  }

  aoFiltrarGenero(genero: string | null): void {
    this.generoSelecionado = genero;
    this.router.navigate(['/animes'], {
      queryParams: { genero: genero ?? null },
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