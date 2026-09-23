import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { first } from 'rxjs';

import { Anime } from '../../core/models/anime.model';
import { IDIOMA_LABEL, STATUS_ANIME_LABEL } from '../../core/models/enums';
import { FiltrosAnime, ResultadoPaginado } from '../../core/models/filtros.model';
import { GENEROS } from '../../core/models/genero';
import { AnimeService } from '../../core/services/anime.service';
import { AnimeCardComponent } from '../../shared/ui/anime-card/anime-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';
import { EventoPagina, PaginacaoComponent } from '../../shared/ui/paginacao/paginacao.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { FiltrosBarraComponent } from './components/filtros-barra/filtros-barra.component';

@Component({
  selector: 'app-catalogo-page',
  standalone: true,
  imports: [
    FiltrosBarraComponent,
    SectionHeaderComponent,
    AnimeCardComponent,
    PaginacaoComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
})
export class CatalogoPageComponent implements OnInit, OnDestroy {
  carregando = true;
  erro = false;

  filtros: FiltrosAnime = { pagina: 1, tamanho: 24 };
  resultado: ResultadoPaginado<Anime> = { itens: [], total: 0, pagina: 1, totalPaginas: 0 };

  private paramsSubscription?: { unsubscribe(): void };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animeService: AnimeService,
  ) {}

  ngOnInit(): void {
    this.paramsSubscription = this.route.queryParams.subscribe((params) => {
      this.filtros = this.emFiltros(params);
      this.carregar();
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  get subtitulo(): string {
    const partes: string[] = [];
    if (this.filtros.busca) partes.push(`busca "${this.filtros.busca}"`);
    if (this.filtros.letra) partes.push(`letra ${this.filtros.letra}`);
    const genero = this.filtros.genero ? GENEROS.find((g) => g.id === this.filtros.genero) : undefined;
    if (genero) partes.push(`gênero ${genero.nome}`);
    if (this.filtros.idioma) partes.push(IDIOMA_LABEL[this.filtros.idioma]);
    if (this.filtros.status) partes.push(STATUS_ANIME_LABEL[this.filtros.status]);
    if (this.filtros.ano) partes.push(`ano ${this.filtros.ano}`);
    return partes.length ? `Filtrando por: ${partes.join(' · ')}` : 'Todos os animes do catálogo';
  }

  private emFiltros(params: Params): FiltrosAnime {
    return {
      busca: params['q'] ?? undefined,
      letra: params['letra'] ?? undefined,
      genero: params['genero'] ?? undefined,
      idioma: params['idioma'] ?? undefined,
      status: params['status'] ?? undefined,
      ano: params['ano'] ? Number(params['ano']) : undefined,
      ordenacao: params['ordenacao'] ?? undefined,
      pagina: params['pagina'] ? Number(params['pagina']) : 1,
      tamanho: 24,
    };
  }

  carregar(): void {
    this.carregando = true;
    this.erro = false;
    this.animeService
      .listar(this.filtros)
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

  aplicarAlteracao(parcial: Partial<FiltrosAnime>): void {
    this.navegar({ ...this.filtros, ...parcial, pagina: 1 });
  }

  aoMudarPagina(evento: EventoPagina): void {
    this.navegar({ ...this.filtros, tamanho: evento.rows, pagina: evento.pagina + 1 });
  }

  aoLimpar(): void {
    this.router.navigate(['/animes']);
  }

  private navegar(filtros: FiltrosAnime): void {
    const params: Params = {};
    if (filtros.busca) params['q'] = filtros.busca;
    if (filtros.letra) params['letra'] = filtros.letra;
    if (filtros.genero) params['genero'] = filtros.genero;
    if (filtros.idioma) params['idioma'] = filtros.idioma;
    if (filtros.status) params['status'] = filtros.status;
    if (filtros.ano) params['ano'] = String(filtros.ano);
    if (filtros.ordenacao) params['ordenacao'] = filtros.ordenacao;
    if (filtros.pagina && filtros.pagina > 1) params['pagina'] = String(filtros.pagina);
    this.router.navigate(['/animes'], { queryParams: params });
  }
}