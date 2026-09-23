import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MinhaListaPageComponent } from './minha-lista.page';

describe('MinhaListaPageComponent', () => {
  let component: MinhaListaPageComponent;
  let fixture: ComponentFixture<MinhaListaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhaListaPageComponent, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MinhaListaPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});