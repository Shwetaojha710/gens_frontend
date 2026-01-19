import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const branchId = localStorage.getItem('branchId');

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        branchId: `${branchId}`
      }
    });

    return next(clonedRequest);
  }

  return next(req);

};
