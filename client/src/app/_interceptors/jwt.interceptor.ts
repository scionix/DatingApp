import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/user';
import { take } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  //this interceptor is for getting the JWT token out of the accountService's 'currentUser$' observable
  constructor(private accountService: AccountService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let currentUser: User;

    //'take' just means 'complete' after receiving 1 of the observable (in this case 'currentUser$')
    //basically guarantees we unsubscribe
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => currentUser = user);

    //if we get a user, attatch token to every request when we're logged in
    if (currentUser) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      })
    }

    return next.handle(request);
  }
}
