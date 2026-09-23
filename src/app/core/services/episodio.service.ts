import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EpisodioRecente } from '../models/anime.model';

@Injectable({ providedIn: 'root' })
export class EpisodioService {
  constructor(private http: HttpClient) {}

  recentes(limite = 24): Observable<EpisodioRecente[]> {
    const params = new HttpParams().set('limite', String(limite));
    return this.http.get<EpisodioRecente[]>(`${environment.apiUrl}/episodios/recentes`, { params });
  }
}