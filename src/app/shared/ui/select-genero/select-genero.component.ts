import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable } from 'rxjs';

import { GeneroFiltro } from '../../../core/models/genero';
import { AnimeService } from '../../../core/services/anime.service';

@Component({
  selector: 'app-select-genero',
  standalone: true,
  imports: [FormsModule, MultiSelectModule, AsyncPipe],
  templateUrl: './select-genero.component.html',
  styleUrls: ['./select-genero.component.scss'],
})
export class SelectGeneroComponent {
  private readonly animeService = inject(AnimeService);

  @Input() placeholder = 'Gênero';
  @Input() mode: 'single' | 'multiple' = 'single';
  @Input() maxSelectedLabels = 1;

  readonly generos$: Observable<GeneroFiltro[]> = this.animeService.generos$;

  private _generos: string[] = [];

  @Input()
  set generos(valor: string | string[] | null | undefined) {
    this._generos = this.normalizar(valor);
  }

  get generos(): string[] {
    return this._generos;
  }

  @Output() generosChange = new EventEmitter<string[]>();

  protected get multiplos(): boolean {
    return this.mode === 'multiple';
  }

  aoSelecionar(valor: string[] | string | null): void {
    this._generos = this.normalizar(valor);
    this.generosChange.emit(this._generos);
  }

  private normalizar(valor: string | string[] | null | undefined): string[] {
    if (Array.isArray(valor)) {
      return valor.filter((v) => !!v);
    }
    return valor ? [valor] : [];
  }
}
