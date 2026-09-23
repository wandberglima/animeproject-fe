import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from './shared/layout/site-header/site-header.component';
import { SiteFooterComponent } from './shared/layout/site-footer/site-footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
})
export class AppComponent {
  title = 'aniprojects';
}