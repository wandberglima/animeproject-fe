import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { first } from 'rxjs';

import { CapituloManga, MangaDetalhe } from '../../core/models/manga.model';
import { ResultadoPaginado } from '../../core/models/filtros.model';
import { StatusAnime, STATUS_ANIME_LABEL } from '../../core/models/enums';
import { MangaService } from '../../core/services/manga.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';
import { EventoPagina, PaginacaoComponent } from '../../shared/ui/paginacao/paginacao.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-manga-detalhe-page',
  standalone: true,
  imports: [
    RouterLink,
    SectionHeaderComponent,
    StatusBadgeComponent,
    PaginacaoComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './manga-detalhe.page.html',
  styleUrls: ['./manga-detalhe.page.scss'],
})
export class MangaDetalhePageComponent implements OnInit, OnDestroy {
  carregando = true;
  capitulosCarregando = false;
  erro = false;
  manga?: MangaDetalhe;

  pagina = 1;
  tamanho = 50;
  capitulos: ResultadoPaginado<CapituloManga> = { itens: [], total: 0, pagina: 1, totalPaginas: 0 };

  private mangaId = '';
  private paramsSubscription?: { unsubscribe(): void };

  readonly labelsStatus = STATUS_ANIME_LABEL;

  constructor(
    private route: ActivatedRoute,
    private mangaService: MangaService,
  ) {}

  ngOnInit(): void {
    this.paramsSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id && id !== this.mangaId) {
        this.mangaId = id;
        this.carregar();
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = false;
    this.mangaService
      .obter(this.mangaId)
      .pipe(first())
      .subscribe({
        next: (manga) => {
          this.manga = manga;
          this.carregando = false;
          this.carregarCapitulos();
        },
        error: () => {
          this.carregando = false;
          this.erro = true;
        },
      });
  }

  carregarCapitulos(): void {
    this.capitulosCarregando = true;
    this.mangaService
      .capitulos(this.mangaId, this.pagina, this.tamanho)
      .pipe(first())
      .subscribe({
        next: (capitulos) => {
          this.capitulos = capitulos;
          this.capitulosCarregando = false;
        },
        error: () => {
          this.capitulosCarregando = false;
        },
      });
  }

  aoMudarPagina(evento: EventoPagina): void {
    this.pagina = evento.pagina + 1;
    this.carregarCapitulos();
  }

  rotaLeitor(capitulo: CapituloManga): string {
    return `/mangas/${this.mangaId}/ler/${capitulo.id}`;
  }

  statusValido(status?: StatusAnime): status is StatusAnime {
    return !!status;
  }
}