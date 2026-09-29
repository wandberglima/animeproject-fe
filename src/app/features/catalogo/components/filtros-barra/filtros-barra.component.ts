import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { IDIOMA_LABEL, Idioma, STATUS_ANIME_LABEL, StatusAnime } from '../../../../core/models/enums';
import {
  FiltrosAnime,
  ORDENACAO_PADRAO,
  ORDENACOES,
} from '../../../../core/models/filtros.model';
import { AnimeService } from '../../../../core/services/anime.service';
import { PesquisaInputComponent } from '../../../../shared/ui/pesquisa-input/pesquisa-input.component';
import { SelectGeneroComponent } from '../../../../shared/ui/select-genero/select-genero.component';

@Component({
  selector: 'app-filtros-barra',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    SelectModule,
    ButtonModule,
    PesquisaInputComponent,
    SelectGeneroComponent,
  ],
  templateUrl: './filtros-barra.component.html',
  styleUrls: ['./filtros-barra.component.scss'],
})
export class FiltrosBarraComponent implements OnChanges {
  private readonly animeService = inject(AnimeService);

  @Input() filtros: FiltrosAnime = {};
  @Input() total = 0;
  @Output() alterar = new EventEmitter<Partial<FiltrosAnime>>();
  @Output() limpar = new EventEmitter<void>();

  /** Anos que realmente existem no catalogo, vindos da API. */
  readonly anos$ = this.animeService.anos$;

  readonly letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  readonly statusOpcoes = (Object.keys(StatusAnime) as StatusAnime[]).map((s) => ({
    id: s,
    nome: STATUS_ANIME_LABEL[s],
  }));
  readonly idiomaOpcoes = (Object.keys(Idioma) as Idioma[]).map((i) => ({
    id: i,
    nome: IDIOMA_LABEL[i],
  }));
  readonly ordenacoes = ORDENACOES;

  busca = '';
  letraSelecionada: string | null = null;
  generosSelecionados: string[] = [];
  statusSelecionado: string | null = null;
  idiomaSelecionado: string | null = null;
  anoSelecionado: number | null = null;
  ordenacaoSelecionada: string = ORDENACAO_PADRAO;

  get temFiltro(): boolean {
    const f = this.filtros;
    return !!(
      f.busca ||
      f.letra ||
      (f.generos?.length ?? 0) ||
      f.idioma ||
      f.status ||
      f.ano ||
      (f.ordenacao && f.ordenacao !== ORDENACAO_PADRAO)
    );
  }

  ngOnChanges(): void {
    this.busca = this.filtros.busca ?? '';
    this.letraSelecionada = this.filtros.letra ?? null;
    this.generosSelecionados = this.filtros.generos ?? [];
    this.statusSelecionado = this.filtros.status ?? null;
    this.idiomaSelecionado = this.filtros.idioma ?? null;
    this.anoSelecionado = this.filtros.ano ?? null;
    this.ordenacaoSelecionada = this.filtros.ordenacao ?? ORDENACAO_PADRAO;
  }

  aoBuscar(termo: string): void {
    this.alterar.emit({ busca: termo || undefined });
  }

  aoSelecionarGenero(valor: string[]): void {
    this.generosSelecionados = valor;
    this.alterar.emit({ generos: valor.length ? valor : undefined });
  }

  aoSelecionarLetra(letra: string): void {
    // "Todos" (string vazia) sempre limpa o filtro, sem alternar.
    this.letraSelecionada = letra ? (this.letraSelecionada === letra ? null : letra) : null;
    this.alterar.emit({ letra: this.letraSelecionada ?? undefined });
  }

  aoSelecionarStatus(valor: string | null): void {
    this.statusSelecionado = valor;
    this.alterar.emit({ status: (valor as StatusAnime) ?? undefined });
  }

  aoSelecionarIdioma(valor: string | null): void {
    this.idiomaSelecionado = valor;
    this.alterar.emit({ idioma: (valor as Idioma) ?? undefined });
  }

  aoSelecionarAno(valor: number | null): void {
    this.anoSelecionado = valor;
    this.alterar.emit({ ano: valor ?? undefined });
  }

  aoSelecionarOrdenacao(valor: string | null): void {
    this.ordenacaoSelecionada = valor || ORDENACAO_PADRAO;
    this.alterar.emit({ ordenacao: this.ordenacaoSelecionada });
  }

  aoLimpar(): void {
    this.busca = '';
    this.letraSelecionada = null;
    this.generosSelecionados = [];
    this.statusSelecionado = null;
    this.idiomaSelecionado = null;
    this.anoSelecionado = null;
    this.ordenacaoSelecionada = ORDENACAO_PADRAO;
    this.limpar.emit();
  }
}
