import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthMenuComponent } from './auth-menu.component';

describe('AuthMenuComponent', () => {
  let component: AuthMenuComponent;
  let fixture: ComponentFixture<AuthMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthMenuComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve montar itens do menu do usuário', () => {
    component.usuario = { id: 1, nome: 'Ana', email: 'ana@email.com' };
    component.ngOnChanges();
    expect(component.itens.length).toBe(3);
  });
});