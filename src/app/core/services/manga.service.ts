import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CapituloManga, CapituloPaginas, MangaDetalhe, MangaResumo } from '../models/manga.model';
import { ResultadoPaginado } from '../models/filtros.model';

@Injectable({ providedIn: 'root' })
export class MangaService {
  constructor(private http: HttpClient) {}

  listar(termo?: string, pagina = 1, tamanho = 24): Observable<ResultadoPaginado<MangaResumo>> {
    let params = new HttpParams();
    if (termo) params = params.set('q', termo);
    if (pagina > 1) params = params.set('pagina', String(pagina));
    if (tamanho) params = params.set('tamanho', String(tamanho));
    return this.http.get<ResultadoPaginado<MangaResumo>>(`${environment.apiUrl}/mangas`, { params });
  }

  obter(id: string): Observable<MangaDetalhe> {
    return this.http.get<MangaDetalhe>(`${environment.apiUrl}/mangas/${id}`);
  }

  capitulos(
    id: string,
    pagina = 1,
    tamanho = 24,
  ): Observable<ResultadoPaginado<CapituloManga>> {
    let params = new HttpParams();
    if (pagina > 1) params = params.set('pagina', String(pagina));
    if (tamanho) params = params.set('tamanho', String(tamanho));
    return this.http.get<ResultadoPaginado<CapituloManga>>(
      `${environment.apiUrl}/mangas/${id}/capitulos`,
      { params },
    );
  }

  paginas(capituloId: string): Observable<CapituloPaginas> {
    return this.http.get<CapituloPaginas>(
      `${environment.apiUrl}/mangas/capitulos/${capituloId}/paginas`,
    );
  }
}