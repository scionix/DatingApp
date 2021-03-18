import { HttpClient, HttpHeaderResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;

  //holds the state of the members
  members: Member[] = [];

  constructor(private http: HttpClient) { }

  //get list of members
  getMembers() {
    //if we already have the members, return that instead of calling the api. 'Of' keyword makes the return value an observable
    if (this.members.length > 0) return of(this.members);

    return this.http.get<Member[]>(this.baseUrl + 'users').pipe(
      map(members => {
        this.members = members;
        return members;
      })
    );
  }

  //get singular member by username
  getMember(username: string) {
    //if we already have the member inside the members collection, return that instead
    const member = this.members.find(x => x.username === username);
    if (member !== undefined)
      return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  //update current user
  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        //update the member in the state when you update it in the database
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  //set a new main photo
  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  //remove a photo
  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }
}
