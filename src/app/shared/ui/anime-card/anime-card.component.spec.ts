import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Anime, EpisodioRecente } from '../../../core/models/anime.model';
import { Idioma, StatusAnime } from '../../../core/models/enums';
import { AnimeCardComponent } from './anime-card.component';

const animeMock: Anime = {
  id: 1,
  titulo: 'Naruto',
  capaUrl: 'https://exemplo.com/capa.jpg',
  sinopse: 'Sinopse',
  generos: [],
  nota: 8,
  ano: 2002,
  status: StatusAnime.COMPLETO,
  idioma: Idioma.LEGENDADO,
  temporadas: [],
};

describe('AnimeCardComponent', () => {
  let component: AnimeCardComponent;
  let fixture: ComponentFixture<AnimeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimeCardComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimeCardComponent);
    component = fixture.componentInstance;
    component.anime = animeMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve montar a rota de detalhes', () => {
    expect(component.rota).toBe('/animes/1');
  });
});