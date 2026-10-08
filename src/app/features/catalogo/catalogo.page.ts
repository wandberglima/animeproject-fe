import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { first } from 'rxjs';

import { Anime } from '../../core/models/anime.model';
import { BuscaExternaItem } from '../../core/models/busca.model';
import { IDIOMA_LABEL, STATUS_ANIME_LABEL } from '../../core/models/enums';
import { FiltrosAnime, ORDENACAO_PADRAO, ResultadoPaginado } from '../../core/models/filtros.model';
import { GeneroFiltro } from '../../core/models/genero';
import { AnimeService } from '../../core/services/anime.service';
import { AnimeCardComponent } from '../../shared/ui/anime-card/anime-card.component';
import { BuscaExternaCardComponent } from '../../shared/ui/busca-externa-card/busca-externa-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';
import { EventoPagina, PaginacaoComponent } from '../../shared/ui/paginacao/paginacao.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { FiltrosBarraComponent } from './components/filtros-barra/filtros-barra.component';

const TAMANHO_PADRAO = 24;

@Component({
  selector: 'app-catalogo-page',
  standalone: true,
  imports: [
    FiltrosBarraComponent,
    SectionHeaderComponent,
    AnimeCardComponent,
    BuscaExternaCardComponent,
    PaginacaoComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
})
export class CatalogoPageComponent implements OnInit, OnDestroy {
  private readonly animeService = inject(AnimeService);

  carregando = true;
  erro = false;
  buscaExternaErro = false;

  generosCatalogo: GeneroFiltro[] = [];

  filtros: FiltrosAnime = { pagina: 1, tamanho: TAMANHO_PADRAO, ordenacao: ORDENACAO_PADRAO };
  resultado: ResultadoPaginado<Anime> = { itens: [], total: 0, pagina: 1, totalPaginas: 0 };
  externos: BuscaExternaItem[] = [];

  private paramsSubscription?: { unsubscribe(): void };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.animeService.generos$.pipe(first()).subscribe((generos) => (this.generosCatalogo = generos));
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
    for (const nome of this.nomesDosGeneros()) {
      partes.push(`gênero ${nome}`);
    }
    if (this.filtros.idioma) partes.push(IDIOMA_LABEL[this.filtros.idioma]);
    if (this.filtros.status) partes.push(STATUS_ANIME_LABEL[this.filtros.status]);
    if (this.filtros.ano) partes.push(`ano ${this.filtros.ano}`);
    if (this.filtros.somentePortugues) partes.push('com legenda em português');
    return partes.length ? `Filtrando por: ${partes.join(' · ')}` : 'Todos os animes do catálogo';
  }

  get subtituloExterno(): string {
    return this.externos.length
      ? `Resultados de ${this.externos.length} títulos externos para "${this.filtros.busca}"`
      : '';
  }

  private nomesDosGeneros(): string[] {
    return (this.filtros.generos ?? [])
      .map((id) => this.generosCatalogo.find((g) => g.id === id)?.nome)
      .filter((nome): nome is string => !!nome);
  }

  private emFiltros(params: Params): FiltrosAnime {
    const generos = this.paramGeneros(params['genero']);
    return {
      busca: params['q'] ?? undefined,
      letra: params['letra'] ?? undefined,
      generos: generos.length ? generos : undefined,
      idioma: params['idioma'] ?? undefined,
      status: params['status'] ?? undefined,
      ano: params['ano'] ? Number(params['ano']) : undefined,
      ordenacao: params['ordenacao'] ?? ORDENACAO_PADRAO,
      pagina: params['pagina'] ? Number(params['pagina']) : 1,
      tamanho: params['tamanho'] ? Number(params['tamanho']) : TAMANHO_PADRAO,
      somentePortugues: params['pt'] === 'true' || undefined,
    };
  }

  private paramGeneros(valor: unknown): string[] {
    if (Array.isArray(valor)) {
      return valor.flatMap((v) => String(v).split(','));
    }
    if (typeof valor === 'string') {
      return valor.split(',');
    }
    return [];
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
    this.carregarBuscaExterna();
  }

  private carregarBuscaExterna(): void {
    this.externos = [];
    this.buscaExternaErro = false;
    const termo = this.filtros.busca;
    if (!termo) {
      return;
    }
    this.animeService
      .buscarAgregado(termo, 6)
      .pipe(first())
      .subscribe({
        next: (resultado) => {
          this.externos = resultado.externos ?? [];
        },
        error: () => {
          this.buscaExternaErro = true;
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
    if (filtros.generos?.length) params['genero'] = filtros.generos;
    if (filtros.idioma) params['idioma'] = filtros.idioma;
    if (filtros.status) params['status'] = filtros.status;
    if (filtros.ano) params['ano'] = String(filtros.ano);
    if (filtros.ordenacao && filtros.ordenacao !== ORDENACAO_PADRAO) params['ordenacao'] = filtros.ordenacao;
    if (filtros.pagina && filtros.pagina > 1) params['pagina'] = String(filtros.pagina);
    if (filtros.tamanho && filtros.tamanho !== TAMANHO_PADRAO) params['tamanho'] = String(filtros.tamanho);
    // "pt" na URL em vez do nome da API: e o que o usuario digita para compartilhar o link, e o
    // filtro precisa sobreviver a recarregar a pagina, entao vira query param em vez de estado local.
    if (filtros.somentePortugues) params['pt'] = 'true';
    this.router.navigate(['/animes'], { queryParams: params });
  }
}
