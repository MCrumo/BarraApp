import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';


export const roleActivateGuard: CanActivateFn = (route, state) => {

  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  if (!authenticationService.loggedIn()) {
    return router.navigate(['/login']);
  } else {
    if (state.url.startsWith(`/${authenticationService.user.role}/`) || state.url === `/${authenticationService.user.role}`) {
      return true;
    } else {
      console.log(`torna al entorn del seu rol: ${authenticationService.user.role}`)
      return router.navigate([`/${authenticationService.user.role}`]);
    }
  }
};

