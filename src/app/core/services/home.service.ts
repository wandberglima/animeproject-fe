import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HomeData } from '../models/home.model';

@Injectable({ providedIn: 'root' })
export class HomeService {
  constructor(private http: HttpClient) {}

  obterDados(): Observable<HomeData> {
    return this.http.get<HomeData>(`${environment.apiUrl}/home`);
  }
}