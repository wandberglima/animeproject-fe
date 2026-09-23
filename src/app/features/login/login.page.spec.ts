import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LoginPageComponent } from './login.page';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve validar credenciais de login', () => {
    component.modo = 'entrar';
    component.email = 'ana@email.com';
    component.senha = '123456';
    expect(component.valido).toBeTrue();
  });

  it('deve exigir nome no cadastro', () => {
    component.modo = 'cadastrar';
    component.nome = 'A';
    component.email = 'ana@email.com';
    component.senha = '123456';
    expect(component.valido).toBeFalse();
  });
});