import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  if (authService.usuario) {
    return true;
  }
  const router = inject(Router);
  return router.createUrlTree(['/login'], {
    queryParams: { redirect: router.url },
  });
};