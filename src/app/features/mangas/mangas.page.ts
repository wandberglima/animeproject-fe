import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { first } from 'rxjs';

import { MangaResumo } from '../../core/models/manga.model';
import { ResultadoPaginado } from '../../core/models/filtros.model';
import { MangaService } from '../../core/services/manga.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';
import { EventoPagina, PaginacaoComponent } from '../../shared/ui/paginacao/paginacao.component';
import { PesquisaInputComponent } from '../../shared/ui/pesquisa-input/pesquisa-input.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { MangaCardComponent } from './components/manga-card/manga-card.component';

@Component({
  selector: 'app-mangas-page',
  standalone: true,
  imports: [
    SectionHeaderComponent,
    PesquisaInputComponent,
    MangaCardComponent,
    PaginacaoComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './mangas.page.html',
  styleUrls: ['./mangas.page.scss'],
})
export class MangasPageComponent implements OnInit, OnDestroy {
  carregando = true;
  erro = false;

  termo = '';
  pagina = 1;
  tamanho = 24;
  resultado: ResultadoPaginado<MangaResumo> = { itens: [], total: 0, pagina: 1, totalPaginas: 0 };

  private paramsSubscription?: { unsubscribe(): void };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mangaService: MangaService,
  ) {}

  ngOnInit(): void {
    this.paramsSubscription = this.route.queryParams.subscribe((params) => {
      this.termo = params['q'] ?? '';
      this.pagina = params['pagina'] ? Number(params['pagina']) : 1;
      this.carregar();
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  get subtitulo(): string {
    return this.termo
      ? `Resultados para "${this.termo}"`
      : 'Mangás disponíveis no MangaDex (PT-BR e EN)';
  }

  buscar(termo: string): void {
    const params: Params = termo ? { q: termo } : {};
    void this.router.navigate(['/mangas'], { queryParams: params });
  }

  aoMudarPagina(evento: EventoPagina): void {
    const params: Params = {};
    if (this.termo) params['q'] = this.termo;
    params['pagina'] = String(evento.pagina + 1);
    void this.router.navigate(['/mangas'], { queryParams: params });
  }

  carregar(): void {
    this.carregando = true;
    this.erro = false;
    this.mangaService
      .listar(this.termo, this.pagina, this.tamanho)
      .pipe(first())
      .subscribe({
        next: (resultado) => {
          this.resultado = resultado;
          this.carregando = false;
        },
        error: () => {
          this.carregando = false;
          this.erro = true;
        },
      });
  }
}