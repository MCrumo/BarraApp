import { Injectable } from '@angular/core';
import { throwError, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Config } from '../classes/config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private apiUrl: string = environment.apiBaseUrl;
  public config: Config;

  constructor(
    private httpClient: HttpClient
  ) { }

  public refreshConfig(httpRequestOptions: any) {
    this.getConfig(httpRequestOptions).subscribe(config => {
      console.log(config)
      this.config = config;
    });
  }

  private getConfig(httpRequestOptions: any): Observable<Config> {
    return this.httpClient.get(`${this.apiUrl}/admin/config`, httpRequestOptions).pipe(
      map((response: any) => {
        if (response.result === 0) {
          return new Config(response.data);
        } else {
          return null;
        }
      }),
      catchError((error: any) => { return of(null) }));
  }

  public updateConfig(config: Config, httpRequestOptions: any): Observable<boolean> {
    return this.httpClient.post(environment.apiBaseUrl + '/admin/config', config.toDB(), httpRequestOptions).pipe(
      map((response: any) => {
        this.refreshConfig(httpRequestOptions);
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
