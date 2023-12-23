import { Injectable } from '@angular/core';
import { Familia } from '../classes/familia';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from './authentication.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FamiliaService {

  private apiUrl: string = environment.apiBaseUrl;
  imagenUrl: string;

  constructor(
    private authenticationService: AuthenticationService,
    private httpClient: HttpClient
  ) { }

  getFamiliesList(includeDisabled: boolean = false): Observable<Familia[]> {
    return this.httpClient.get(`${this.apiUrl}/admin/list-product-families/${includeDisabled ? 1 : 0}`, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        console.log(response)
        const familyList: Familia[] = [];
        if (response.result === 0) {
          for (const family of response.data[0].jsonPF) {
            //if(family.PF === 0){
            familyList.push(new Familia(family));
            //}
          }
        }
        return familyList;
      }),
      catchError((error: any) => { return of([]) }));
  }

  getFamily(familyId: number): Observable<Familia> {
    return this.httpClient.get(`${this.apiUrl}/admin/list-product-families/1`, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        let family: Familia = null;
        if (response.result === 0) {
          console.log(response)
          for (const familyDb of response.data[0].jsonPF) {
            if (familyDb.PF_IdFamily===familyId){
              family=new Familia(familyDb);
            }
          }
        }
        return family;
      }),
      catchError((error: any) => { return of(null) }));
  }

  deshabilitarFamilia(familiaId: number): Observable<boolean> {
    return this.httpClient.post(this.apiUrl + '/admin/disable-product-family/' + familiaId, {}, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        return response.result === 0
      }),
      catchError((error: any) => { return of(false) }));
  }

  habilitarFamilia(familiaId: number): Observable<boolean> {
    return this.httpClient.post(this.apiUrl + '/admin/enable-product-family/' + familiaId, {}, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        return response.result === 0
      }),
      catchError((error: any) => { return of(false) }));
  }

  updateFamily(family: Familia, image: File): Observable<boolean> {
    let formParams = new FormData();
    formParams.append('id', family.id.toString());
    formParams.append('name', family.nombre);
    formParams.append('ageLimit', family.agelimit.toString());
    formParams.append('disabled', family.disabled ? '1' : '0');
    formParams.append('description', family.desc);
    formParams.append('image', image);
    console.log(formParams);
    return this.httpClient.post(environment.apiBaseUrl + '/admin/update-product-family', formParams, this.authenticationService.getHttpRequestOptionsForm()).pipe(
      map((response: any) => {
        console.log(response);
        return response.result === 0
      }),
      catchError((error: any) => { return of(false) }));
  }

  newFamily(family: Familia, image: File): Observable<boolean> {
    let formParams = new FormData();
    formParams.append('name', family.nombre);
    formParams.append('ageLimit', family.agelimit.toString());
    formParams.append('description', family.desc);
    formParams.append('image', image);
    console.log(formParams);
    return this.httpClient.post(environment.apiBaseUrl + '/admin/add-product-family', formParams, this.authenticationService.getHttpRequestOptionsForm()).pipe(
      map((response: any) => {
        console.log(response);
        return response.result === 0
      }),
      catchError((error: any) => { return of(false) }));
  }

  public getFamilyList(): Observable<Familia[]> {
    return this.httpClient.get(`${this.apiUrl}/customer/list-product-families`, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        const familyList: Familia[] = [];
        console.log(response);
        if (response.result === 0) {
          for (const family of response.data) {
            familyList.push(new Familia(family));
          }
        }
        return familyList;
      }),
      catchError((error: any) => { return of([]) }));
  }

  handleError(error: any) {
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg);
    return throwError(() => errMsg);
  }

}
