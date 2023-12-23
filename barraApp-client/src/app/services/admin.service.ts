import { Injectable } from '@angular/core';
import { throwError, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { environment } from 'src/environments/environment';
import { User } from '../classes/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl: string = environment.apiBaseUrl;

  constructor(
    private authenticationService: AuthenticationService,
    private httpClient: HttpClient
  ) { }

  getUserList(): Observable<User[]> {
    return this.httpClient.get(`${this.apiUrl}/admin/list-users`, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        const userList: User[] = [];
        if (response.result === 0) {
          for (const user of response.data) {
            userList.push(new User(user));
          }
        }
        return userList;
      }),
      catchError((error: any) => { return of([]) }));
  }

  updateUser(user: User): Observable<boolean> {
    const body = {
      USR_Id: user.id,
      USR_Email: user.email,
      USR_Role: user.role,
      USR_Name: user.name,
      USR_Surname1: user.surname1,
      USR_Surname2: user.surname2,
      USR_BirthDate: user.birthDate,
      USR_Verified: user.verified ? 1 : 0,
      USR_Balance: user.balance
    }
    return this.httpClient.post(environment.apiBaseUrl + '/admin/update-user', body, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        console.log(response);
        return response.result === 0
      }),
      catchError((error: any) => { return of(false) }));
  }

  handleError(error: any) {
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg);
    return throwError(() => errMsg);
  }

}
