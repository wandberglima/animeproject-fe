import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-logo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-logo.component.html',
  styleUrls: ['./site-logo.component.scss'],
})
export class SiteLogoComponent {
  @Input() rota = '/';
  @Input() texto = 'Aniprojects';
}