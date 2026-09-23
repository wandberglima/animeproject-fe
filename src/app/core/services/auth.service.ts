import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CredenciaisLogin, DadosRegistro, RespostaAuth } from '../models/auth.model';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'aniprojects_token';
  private readonly USUARIO_KEY = 'aniprojects_usuario';

  private readonly usuarioSubject = new BehaviorSubject<Usuario | null>(this.usuarioSalvo());

  readonly usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {}

  get usuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(credenciais: CredenciaisLogin): Observable<Usuario> {
    return this.http
      .post<RespostaAuth>(`${environment.apiUrl}/auth/login`, credenciais)
      .pipe(
        tap((resposta) => this.salvarSessao(resposta)),
        map((resposta) => resposta.usuario),
      );
  }

  registrar(dados: DadosRegistro): Observable<Usuario> {
    return this.http
      .post<RespostaAuth>(`${environment.apiUrl}/auth/registrar`, dados)
      .pipe(
        tap((resposta) => this.salvarSessao(resposta)),
        map((resposta) => resposta.usuario),
      );
  }

  obterMe(): Observable<Usuario> {
    return this.http.get<Usuario>(`${environment.apiUrl}/auth/me`);
  }

  sair(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
    this.usuarioSubject.next(null);
  }

  private salvarSessao(resposta: RespostaAuth): void {
    localStorage.setItem(this.TOKEN_KEY, resposta.token);
    localStorage.setItem(this.USUARIO_KEY, JSON.stringify(resposta.usuario));
    this.usuarioSubject.next(resposta.usuario);
  }

  private usuarioSalvo(): Usuario | null {
    const bruto = localStorage.getItem(this.USUARIO_KEY);
    if (!bruto) {
      return null;
    }
    try {
      return JSON.parse(bruto) as Usuario;
    } catch {
      localStorage.removeItem(this.USUARIO_KEY);
      return null;
    }
  }
}