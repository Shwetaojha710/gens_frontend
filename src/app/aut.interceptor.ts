import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Employee portal has its own token stored under a different key
  const empPortalToken  = localStorage.getItem('empPortalToken');
  const adminToken      = localStorage.getItem('token');

  const isEmpPortal = !!empPortalToken;
  const token       = isEmpPortal ? empPortalToken : adminToken;
  const branchId    = isEmpPortal
    ? localStorage.getItem('empPortalBranchId')
    : localStorage.getItem('branchId');

  const clonedRequest = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          branchId: `${branchId ?? ''}`
        }
      })
    : req;

  return next(clonedRequest).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as any;
        if (body && body.status === 'expired') {
          localStorage.clear();
          // Redirect to the correct login page depending on context
          router.navigate([isEmpPortal ? '/employee-portal/login' : '/login']);
        }
      }
    })
  );
};
