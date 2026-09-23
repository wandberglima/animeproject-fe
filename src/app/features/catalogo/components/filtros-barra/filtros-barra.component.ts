import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { IDIOMA_LABEL, Idioma, STATUS_ANIME_LABEL, StatusAnime } from '../../../../core/models/enums';
import { FiltrosAnime } from '../../../../core/models/filtros.model';
import { PesquisaInputComponent } from '../../../../shared/ui/pesquisa-input/pesquisa-input.component';
import { SelectGeneroComponent } from '../../../../shared/ui/select-genero/select-genero.component';

@Component({
  selector: 'app-filtros-barra',
  standalone: true,
  imports: [
    FormsModule,
    SelectModule,
    ButtonModule,
    PesquisaInputComponent,
    SelectGeneroComponent,
  ],
  templateUrl: './filtros-barra.component.html',
  styleUrls: ['./filtros-barra.component.scss'],
})
export class FiltrosBarraComponent implements OnChanges {
  @Input() filtros: FiltrosAnime = {};
  @Input() total = 0;
  @Output() alterar = new EventEmitter<Partial<FiltrosAnime>>();
  @Output() limpar = new EventEmitter<void>();

  private readonly anoAtual = new Date().getFullYear();
  readonly anos = Array.from({ length: 20 }, (_, i) => this.anoAtual - i);
  readonly letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  readonly statusOpcoes = (Object.keys(StatusAnime) as StatusAnime[]).map((s) => ({
    id: s,
    nome: STATUS_ANIME_LABEL[s],
  }));
  readonly idiomaOpcoes = (Object.keys(Idioma) as Idioma[]).map((i) => ({
    id: i,
    nome: IDIOMA_LABEL[i],
  }));
  readonly ordenacoes = [
    { id: 'recentes', nome: 'Mais recentes' },
    { id: 'avaliacao', nome: 'Melhor avaliados' },
    { id: 'nome', nome: 'Nome (A-Z)' },
  ];

  busca = '';
  letraSelecionada: string | null = null;
  generoSelecionado: string | null = null;
  statusSelecionado: string | null = null;
  idiomaSelecionado: string | null = null;
  anoSelecionado: number | null = null;
  ordenacaoSelecionada: string | null = null;

  get temFiltro(): boolean {
    const f = this.filtros;
    return !!(f.busca || f.letra || f.genero || f.idioma || f.status || f.ano || f.ordenacao);
  }

  ngOnChanges(): void {
    this.busca = this.filtros.busca ?? '';
    this.letraSelecionada = this.filtros.letra ?? null;
    this.generoSelecionado = this.filtros.genero ?? null;
    this.statusSelecionado = this.filtros.status ?? null;
    this.idiomaSelecionado = this.filtros.idioma ?? null;
    this.anoSelecionado = this.filtros.ano ?? null;
    this.ordenacaoSelecionada = this.filtros.ordenacao ?? null;
  }

  aoBuscar(termo: string): void {
    this.alterar.emit({ busca: termo || undefined });
  }

  aoSelecionarGenero(valor: string | null): void {
    this.generoSelecionado = valor ?? null;
    this.alterar.emit({ genero: valor ?? undefined });
  }

  aoSelecionarLetra(letra: string): void {
    this.letraSelecionada = this.letraSelecionada === letra ? null : letra;
    this.alterar.emit({ letra: this.letraSelecionada ?? undefined });
  }

  aoSelecionarStatus(valor: string | null): void {
    this.statusSelecionado = valor ?? null;
    this.alterar.emit({ status: (valor as StatusAnime) ?? undefined });
  }

  aoSelecionarIdioma(valor: string | null): void {
    this.idiomaSelecionado = valor ?? null;
    this.alterar.emit({ idioma: (valor as Idioma) ?? undefined });
  }

  aoSelecionarAno(valor: number | null): void {
    this.anoSelecionado = valor ?? null;
    this.alterar.emit({ ano: valor ?? undefined });
  }

  aoSelecionarOrdenacao(valor: string | null): void {
    this.ordenacaoSelecionada = valor ?? null;
    this.alterar.emit({ ordenacao: valor ?? undefined });
  }

  aoLimpar(): void {
    this.busca = '';
    this.letraSelecionada = null;
    this.generoSelecionado = null;
    this.statusSelecionado = null;
    this.idiomaSelecionado = null;
    this.anoSelecionado = null;
    this.ordenacaoSelecionada = null;
    this.limpar.emit();
  }
}