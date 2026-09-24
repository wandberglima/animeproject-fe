import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePageComponent),
    title: 'Início',
  },
  {
    path: 'animes',
    loadComponent: () =>
      import('./features/catalogo/catalogo.page').then((m) => m.CatalogoPageComponent),
    title: 'Lista de Animes',
  },
  {
    path: 'animes/:id',
    loadComponent: () =>
      import('./features/detalhe/detalhe.page').then((m) => m.DetalhePageComponent),
    title: 'Anime',
  },
  {
    path: 'mangas',
    loadComponent: () => import('./features/mangas/mangas.page').then((m) => m.MangasPageComponent),
    title: 'Lista de Mangás',
  },
  {
    path: 'mangas/:id',
    loadComponent: () =>
      import('./features/mangas/manga-detalhe.page').then((m) => m.MangaDetalhePageComponent),
    title: 'Mangá',
  },
  {
    path: 'mangas/:id/ler/:capituloId',
    loadComponent: () =>
      import('./features/mangas/leitor.page').then((m) => m.LeitorPageComponent),
    title: 'Leitor',
  },
  {
    path: 'assistir/:animeId/:numero',
    loadComponent: () => import('./features/player/player.page').then((m) => m.PlayerPageComponent),
    title: 'Assistir',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPageComponent),
    title: 'Entrar',
  },
  {
    path: 'minha-lista',
    loadComponent: () =>
      import('./features/minha-lista/minha-lista.page').then((m) => m.MinhaListaPageComponent),
    title: 'Minha Lista',
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];