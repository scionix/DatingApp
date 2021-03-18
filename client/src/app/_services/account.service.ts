import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators'
import { environment } from '../../environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;

  //holds our current user in a ReplaySubject list of type 'User'
  //only one logged in user at a time, so ReplaySubject has length 1
  private currentUserSource = new ReplaySubject<User>(1);

  //the observable we get from looking at the ReplaySubject
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) { }

  //call 'login' in the API
  login(model: any) {
    return this.http.post(this.baseUrl + 'account/login', model).pipe(
      map((user: User) => {
        if (user) {
          //if our login POST gets a user back, we're logged in
          this.setCurrentUser(user);
        }
        return user;
      })
    )
  }

  //call 'register' in the API
  register(model: any) {
    return this.http.post(this.baseUrl + 'account/register', model).pipe(
      map((user: User) => {
        if (user) {
          //if our register POST gets a user back, we're logged in
          this.setCurrentUser(user);
        }
      })
    )
  }

  //puts the given user into the ReplaySubject list and in browser's localstorage
  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  //remove user from localStorage and the ReplaySubject list
  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }
}
