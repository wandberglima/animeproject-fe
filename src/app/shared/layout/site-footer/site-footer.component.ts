import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteLogoComponent } from '../../ui/site-logo/site-logo.component';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink, SiteLogoComponent],
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.scss'],
})
export class SiteFooterComponent {
  @Input() texto = 'Aniprojects';
  ano = new Date().getFullYear();
}