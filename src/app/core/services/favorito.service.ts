import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Anime } from '../models/anime.model';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Anime[]> {
    return this.http.get<Anime[]>(`${environment.apiUrl}/usuarios/me/favoritos`);
  }

  favoritar(animeId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/usuarios/me/favoritos/${animeId}`, null);
  }

  desfavoritar(animeId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/usuarios/me/favoritos/${animeId}`);
  }
}