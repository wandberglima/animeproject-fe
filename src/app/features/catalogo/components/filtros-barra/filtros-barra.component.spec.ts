import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosBarraComponent } from './filtros-barra.component';

describe('FiltrosBarraComponent', () => {
  let component: FiltrosBarraComponent;
  let fixture: ComponentFixture<FiltrosBarraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosBarraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltrosBarraComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve alternar a letra selecionada', () => {
    component.aoSelecionarLetra('A');
    expect(component.letraSelecionada).toBe('A');
    component.aoSelecionarLetra('A');
    expect(component.letraSelecionada).toBeNull();
  });

  it('deve emitir filtro de status', () => {
    let emitido: unknown;
    component.alterar.subscribe((f) => (emitido = f));
    component.aoSelecionarStatus('EM_LANCAMENTO');
    expect(emitido).toEqual({ status: 'EM_LANCAMENTO' });
  });
});