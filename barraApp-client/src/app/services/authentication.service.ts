import { Injectable } from '@angular/core';
import { throwError, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from '../classes/user';
import { Router } from '@angular/router';
import { ConfigService } from './config.service';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private apiUrl: string = environment.apiBaseUrl;
  private headers: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:4200' });
  private token: string = null;
  public user: User = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private configService:ConfigService
  ) {
    const token = localStorage.getItem('auth_token');
    console.log('token: ', token);
    if (token) {
      this.verifyToken(token);
    }
  }

  public setToken(token: string): void {
    this.token = token;
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json', 'authorization': `Bearer ${token}` });
  }

  public haveToken(): boolean {
    return this.token != null;
  }

  public getHttpRequestOptions(responseType: string = 'json'): any {
    return { headers: this.headers, withCredentials: true, responseType };
  }

  public async verifyToken(token: string): Promise<void> {
    const body = { token };
    console.log('verify token inicio: ', token);
  
    try {
      const response: any = await this.http.post(this.apiUrl + '/verify-token', body, { withCredentials: true }).toPromise();
      console.log(response);
  
      let user: User = null;
      if (response && response.result === 0) {
        user = new User();
        console.log(response.data);
        user.fromDB(response.data);
        console.log(user);
        this.setToken(token);
        localStorage.setItem('auth_token', this.token);
        this.user = user;
        this.configService.refreshConfig(this.getHttpRequestOptions());
      }
  
      console.log('verify token');
    } catch (error) {
      // Manejar error
      console.error('Error al verificar el token', error);
    }
    console.log('verify token2');
  }  
  public getHttpRequestOptionsForm(): any {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const headers = new HttpHeaders({ 'authorization': `Bearer ${this.token}` });
    return { headers, withCredentials: true, responseType: 'json' };
  }

  public loginCheck(email: string, password: string): Observable<User> {
    return this.http.get(this.apiUrl + '/ba-login/' + email + '/' + password, { withCredentials: true }).pipe(
      map((response: any) => {
        let user: User = null;
        if (response.result === 0) {
          user = new User();
          console.log(response.data)
          user.fromDB(response.data);
          console.log(response.data.token);
          this.setToken(response.data.token)
          console.log('local storage set2:',this.token);
          localStorage.setItem('auth_token', this.token);
          this.user = user;
          this.configService.refreshConfig(this.getHttpRequestOptions());
        }
        return user;
      }),
      catchError((error: any) => { return of(null) }));
  }

  public loggedIn() {
    return this.user !== null;
  }

  public logout() {
    localStorage.removeItem('auth_token');
    this.user=null;
    this.token=null;
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.router.navigateByUrl('/login');
  }

  handleError(error: any) {
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg);
    return throwError(() => errMsg);
  }

}
