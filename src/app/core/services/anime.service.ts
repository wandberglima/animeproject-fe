import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Anime } from '../models/anime.model';
import { FiltrosAnime, ResultadoPaginado } from '../models/filtros.model';
import { StreamInfo } from '../models/stream.model';

@Injectable({ providedIn: 'root' })
export class AnimeService {
  constructor(private http: HttpClient) {}

  listar(filtros: FiltrosAnime): Observable<ResultadoPaginado<Anime>> {
    let params = new HttpParams();
    if (filtros.busca) params = params.set('busca', filtros.busca);
    if (filtros.letra) params = params.set('letra', filtros.letra);
    if (filtros.genero) params = params.set('genero', filtros.genero);
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

  obterStream(animeId: number, numero: number): Observable<StreamInfo> {
    return this.http.get<StreamInfo>(
      `${environment.apiUrl}/animes/${animeId}/episodios/${numero}/stream`,
    );
  }
}