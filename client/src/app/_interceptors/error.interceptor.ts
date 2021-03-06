import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NavigationExtras, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) { }

  //this class is for intercepting http errors for toastr so we can display them in browser
  //if we get an error, do some stuff based on the error and give it to toastr
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (error) {
          switch (error.status) {
            case 400:
              //400 Auth error
              if (error.error.errors) {
                const modalStateErrors = [];
                for (const key in error.error.errors) {
                  if (error.error.errors[key]) {
                    modalStateErrors.push(error.error.errors[key])
                  }
                }
                throw modalStateErrors.flat();
              }
              //regular 400 error
              else {
                this.toastr.error(error.statusText, error.status);
              }
              break;

            case 401:
              this.toastr.error(error.statusText, error.status);
              break;

            case 404:
              this.router.navigateByUrl('/not-found');
              break;

            case 500:
              //save the error state before redirecting
              const navigationExtras: NavigationExtras = { state: { error: error.error } }
              this.router.navigateByUrl('/server-error', navigationExtras);
              break;

            default:
              this.toastr.error('Something unexpected went wrong');
              console.log(error);
              break;
          }
        }

        return throwError(error);
      })
    )
  }

}
