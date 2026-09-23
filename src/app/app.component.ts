import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CabecalhoComponent } from './modules/containers/components/cabecalho/cabecalho.component';
import { RodapeComponent } from './modules/containers/components/rodape/rodape.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, CabecalhoComponent, RodapeComponent],
})
export class AppComponent {
  title = 'aniprojects';
}