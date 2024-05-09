import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
  },
  {
    // path: 'inscricao/:id',
    // loadChildren: () =>
    //  import( caminho do componente).then((m) => m.DadosCandidatoInscricaoModule),
  }
  // ,
  // { path: '403', component:  },
  // {
  //   path: '**',
  //   redirectTo: '/404',
  //   resolve: {
  //     url: 'externalUrlRedirectResolver',
  //   },
  //   data: {
  //     externalUrl: `${environment.FRONT_URL}`,
  //   },
  // },
  // { path: '404', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
