import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginacaoComponent } from './paginacao.component';

describe('PaginacaoComponent', () => {
  let component: PaginacaoComponent;
  let fixture: ComponentFixture<PaginacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginacaoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginacaoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve emitir evento de página ao navegar', () => {
    let evento: { pagina: number; primeiro: number; rows: number } | undefined;
    component.paginaChange.subscribe((e) => (evento = e));
    component.aoMudarPagina({ page: 2, first: 48, rows: 24 });
    expect(evento?.pagina).toBe(2);
  });
});