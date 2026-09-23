import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PesquisaInputComponent } from './pesquisa-input.component';

describe('PesquisaInputComponent', () => {
  let component: PesquisaInputComponent;
  let fixture: ComponentFixture<PesquisaInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PesquisaInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PesquisaInputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve emitir o termo buscado', () => {
    let termoEmitido = '';
    component.buscar.subscribe((t) => (termoEmitido = t));
    component.termoLocal = 'naruto';
    component.aoBuscar();
    expect(termoEmitido).toBe('naruto');
  });
});