import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { first } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../core/services/auth.service';

type ModoLogin = 'entrar' | 'cadastrar';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPageComponent {
  modo: ModoLogin = 'entrar';
  nome = '';
  email = '';
  senha = '';

  carregando = false;
  erro = false;
  mensagemErro = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  get valido(): boolean {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    const senhaOk = this.senha.length >= 6;
    return emailOk && senhaOk && (this.modo === 'entrar' || this.nome.trim().length >= 2);
  }

  alternarModo(modo: ModoLogin): void {
    this.modo = modo;
    this.erro = false;
    this.mensagemErro = '';
  }

  enviar(): void {
    if (!this.valido || this.carregando) {
      return;
    }
    this.carregando = true;
    this.erro = false;

    const requisicao =
      this.modo === 'entrar'
        ? this.authService.login({ email: this.email, senha: this.senha })
        : this.authService.registrar({ nome: this.nome.trim(), email: this.email, senha: this.senha });

    requisicao.pipe(first()).subscribe({
      next: () => this.aposAutenticar(),
      error: (e) => this.tratarErro(e),
    });
  }

  private aposAutenticar(): void {
    this.carregando = false;
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    void this.router.navigate([redirect || '/']);
  }

  private tratarErro(e: unknown): void {
    this.carregando = false;
    this.erro = true;
    const status = (e as { status?: number })?.status;
    if (status === 401) {
      this.mensagemErro = 'E-mail ou senha inválidos.';
    } else if (status === 409) {
      this.mensagemErro = 'Este e-mail já está cadastrado.';
    } else {
      this.mensagemErro = 'Não foi possível concluir. Verifique a conexão com a API e tente novamente.';
    }
  }
}