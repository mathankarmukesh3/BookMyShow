import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { UserRole } from '../models/user.model';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();

  if (user && user.role === UserRole.Admin) {
    return true;
  }

  router.navigate(['/movies']);
  return false;
};