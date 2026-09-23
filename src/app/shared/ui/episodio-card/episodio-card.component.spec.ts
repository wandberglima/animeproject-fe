import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EpisodioRecente } from '../../../core/models/anime.model';
import { Idioma } from '../../../core/models/enums';
import { EpisodioCardComponent } from './episodio-card.component';

const episodioRecenteMock: EpisodioRecente = {
  anime: { id: 1, titulo: 'Naruto', capaUrl: 'https://exemplo.com/capa.jpg', nota: 8 },
  episodio: {
    id: 10,
    animeId: 1,
    temporada: 1,
    numero: 10,
    titulo: 'Episódio 10',
    dataLancamento: '2026-09-20',
    idioma: Idioma.LEGENDADO,
  },
};

describe('EpisodioCardComponent', () => {
  let component: EpisodioCardComponent;
  let fixture: ComponentFixture<EpisodioCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodioCardComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(EpisodioCardComponent);
    component = fixture.componentInstance;
    component.episodioRecente = episodioRecenteMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve montar a rota do player', () => {
    expect(component.rota).toBe('/assistir/1/10');
  });
});