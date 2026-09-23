import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectGeneroComponent } from './select-genero.component';

describe('SelectGeneroComponent', () => {
  let component: SelectGeneroComponent;
  let fixture: ComponentFixture<SelectGeneroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectGeneroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectGeneroComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve emitir gênero selecionado', () => {
    let valorEmitido: string | null | undefined;
    component.generoChange.subscribe((g) => (valorEmitido = g));
    component.aoSelecionar('acao');
    expect(valorEmitido).toBe('acao');
  });
});