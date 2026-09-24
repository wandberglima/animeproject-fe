import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MangaResumo } from '../../../../core/models/manga.model';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-manga-card',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './manga-card.component.html',
  styleUrls: ['./manga-card.component.scss'],
})
export class MangaCardComponent {
  @Input() manga!: MangaResumo;

  get rota(): string | undefined {
    return this.manga ? `/mangas/${this.manga.id}` : undefined;
  }
}