import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { first } from 'rxjs';

import { CapituloManga } from '../../core/models/manga.model';
import { MangaService } from '../../core/services/manga.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-leitor-page',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './leitor.page.html',
  styleUrls: ['./leitor.page.scss'],
})
export class LeitorPageComponent implements OnInit, OnDestroy {
  carregando = true;
  erro = false;
  paginas: string[] = [];

  capitulo?: CapituloManga;
  capituloAnterior?: CapituloManga;
  capituloProximo?: CapituloManga;

  mangaId = '';
  private capituloId = '';
  private capitulosCacheados: CapituloManga[] = [];
  private paramsSubscription?: { unsubscribe(): void };

  readonly tamanhoFeed = 100;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mangaService: MangaService,
  ) {}

  ngOnInit(): void {
    this.paramsSubscription = this.route.paramMap.subscribe((params) => {
      const mangaId = params.get('id');
      const capituloId = params.get('capituloId');
      if (!mangaId || !capituloId) {
        return;
      }
      const mudouId = mangaId !== this.mangaId;
      this.mangaId = mangaId;
      this.capituloId = capituloId;
      if (mudouId) {
        this.carregarCapítulos();
      } else {
        this.definirVizinhos();
      }
      this.carregarPaginas();
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  carregarCapítulos(): void {
    this.mangaService
      .capitulos(this.mangaId, 1, this.tamanhoFeed)
      .pipe(first())
      .subscribe({
        next: (resultado) => {
          this.capitulosCacheados = resultado.itens;
          this.definirVizinhos();
        },
      });
  }

  definirVizinhos(): void {
    const indice = this.capitulosCacheados.findIndex((c) => c.id === this.capituloId);
    this.capitulo = indice >= 0 ? this.capitulosCacheados[indice] : undefined;
    this.capituloAnterior = indice > 0 ? this.capitulosCacheados[indice - 1] : undefined;
    this.capituloProximo = indice >= 0 && indice < this.capitulosCacheados.length - 1
      ? this.capitulosCacheados[indice + 1]
      : undefined;
  }

  carregarPaginas(): void {
    this.carregando = true;
    this.erro = false;
    this.paginas = [];
    this.mangaService
      .paginas(this.capituloId)
      .pipe(first())
      .subscribe({
        next: (resultado) => {
          this.paginas = resultado.paginas;
          this.carregando = false;
        },
        error: () => {
          this.carregando = false;
          this.erro = true;
        },
      });
  }

  rotaLeitor(capitulo: CapituloManga): string {
    return `/mangas/${this.mangaId}/ler/${capitulo.id}`;
  }

  navegar(capitulo: CapituloManga): void {
    window.scrollTo({ top: 0 });
    void this.router.navigate(['/mangas', this.mangaId, 'ler', capitulo.id]);
  }
}