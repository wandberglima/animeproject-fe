import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Anime } from '../models/anime.model';
import { BuscaAgregada } from '../models/busca.model';
import { FiltrosAnime, ResultadoPaginado } from '../models/filtros.model';
import { GeneroFiltro } from '../models/genero';
import { Idioma } from '../models/enums';
import { StreamInfo } from '../models/stream.model';

@Injectable({ providedIn: 'root' })
export class AnimeService {
  /** Anos e generos vem do servidor para o filtro nunca oferecer valores sem resultado. */
  readonly anos$: Observable<number[]>;
  readonly generos$: Observable<GeneroFiltro[]>;

  constructor(private http: HttpClient) {
    this.anos$ = this.http
      .get<number[]>(`${environment.apiUrl}/animes/anos`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.generos$ = this.http
      .get<GeneroFiltro[]>(`${environment.apiUrl}/animes/generos`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
  }

  listar(filtros: FiltrosAnime): Observable<ResultadoPaginado<Anime>> {
    let params = new HttpParams();
    if (filtros.busca) params = params.set('busca', filtros.busca);
    if (filtros.letra) params = params.set('letra', filtros.letra);
    for (const genero of filtros.generos ?? []) {
      params = params.append('genero', genero);
    }
    if (filtros.idioma) params = params.set('idioma', filtros.idioma);
    if (filtros.status) params = params.set('status', filtros.status);
    if (filtros.ano !== undefined) params = params.set('ano', String(filtros.ano));
    if (filtros.ordenacao) params = params.set('ordenacao', filtros.ordenacao);
    if (filtros.pagina !== undefined) params = params.set('pagina', String(filtros.pagina));
    if (filtros.tamanho !== undefined) params = params.set('tamanho', String(filtros.tamanho));
    return this.http.get<ResultadoPaginado<Anime>>(`${environment.apiUrl}/animes`, { params });
  }

  obter(id: number): Observable<Anime> {
    return this.http.get<Anime>(`${environment.apiUrl}/animes/${id}`);
  }

  obterStream(animeId: number, numero: number, linguagem?: Idioma): Observable<StreamInfo> {
    let params = new HttpParams();
    // A API espera os codigos do scraper (sub/dub), nao os nomes do enum (LEGENDADO/DUBLADO).
    // Sem esta traducao o botao "Dublado" voltava com o episode legendado.
    if (linguagem) params = params.set('linguagem', linguagem === Idioma.DUBLADO ? 'dub' : 'sub');
    return this.http.get<StreamInfo>(
      `${environment.apiUrl}/animes/${animeId}/episodios/${numero}/stream`,
      { params },
    );
  }

  buscarAgregado(q: string, tamanho?: number): Observable<BuscaAgregada> {
    let params = new HttpParams().set('q', q);
    if (tamanho !== undefined) params = params.set('tamanho', String(tamanho));
    return this.http.get<BuscaAgregada>(`${environment.apiUrl}/busca`, { params });
  }

  obterStreamExterno(provider: string, mediaId: string): Observable<StreamInfo> {
    let params = new HttpParams().set('provider', provider).set('mediaId', mediaId);
    return this.http.get<StreamInfo>(`${environment.apiUrl}/stream/externo`, { params });
  }
}
