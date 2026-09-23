import { Usuario } from './usuario.model';

export interface CredenciaisLogin {
  email: string;
  senha: string;
}

export interface DadosRegistro {
  nome: string;
  email: string;
  senha: string;
}

export interface RespostaAuth {
  token: string;
  usuario: Usuario;
}