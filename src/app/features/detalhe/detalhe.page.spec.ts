import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DetalhePageComponent } from './detalhe.page';

describe('DetalhePageComponent', () => {
  let component: DetalhePageComponent;
  let fixture: ComponentFixture<DetalhePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhePageComponent, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});