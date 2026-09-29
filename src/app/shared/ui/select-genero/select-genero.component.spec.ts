import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../../../environments/environment';
import { SelectGeneroComponent } from './select-genero.component';

describe('SelectGeneroComponent', () => {
  let component: SelectGeneroComponent;
  let fixture: ComponentFixture<SelectGeneroComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectGeneroComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectGeneroComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/animes/generos`).flush([]);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve emitir os gêneros selecionados', () => {
    let valorEmitido: string[] | undefined;
    component.generosChange.subscribe((g) => (valorEmitido = g));
    component.aoSelecionar(['action', 'comedy']);
    expect(valorEmitido).toEqual(['action', 'comedy']);
  });

  it('deve normalizar um único gênero em lista', () => {
    let valorEmitido: string[] | undefined;
    component.generosChange.subscribe((g) => (valorEmitido = g));
    component.aoSelecionar('action');
    expect(valorEmitido).toEqual(['action']);
  });
});
