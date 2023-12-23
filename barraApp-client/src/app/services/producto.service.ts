import { Injectable } from '@angular/core';
import { Producto } from '../classes/producto';
import { Familia } from '../classes/familia';
import { AuthenticationService } from './authentication.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, catchError, map, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(
    private authenticationService: AuthenticationService,
    private httpClient: HttpClient
  ) { }

  private apiUrl: string = environment.apiBaseUrl;

  public obtenerPorCategoria(familyId: Number, includeDisabled: boolean): Observable<Producto[]> {
    return this.httpClient.get(`${this.apiUrl}/admin/list-products/${includeDisabled ? '1' : '0'}/${familyId}`, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        console.log(response)
        const productList: Producto[] = [];
        console.log(response);
        if (response.result === 0) {
          for (const producto of response.data) {
            productList.push(new Producto(producto));
          }
        }
        return productList
      }),
      catchError((error: any) => { return of([]) }));
  }

  obtenerProducto(id: number) {
    return this.httpClient.get(this.apiUrl + `/admin/list-products/:includeDisabled/:familyId`, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        const productList: Producto[] = [];
        if (response.result === 0) {
          for (const producto of response.data) {
            //if(family.PF === 0){
            productList.push(new Producto(producto));
            //}
          }
          // user = new User();
          // console.log(response.data)
          // user.fromDB(response.data);
          // this.token = response.data.token;
          // this.headers = new HttpHeaders({ 'Content-Type': 'application/json', 'authorization': `Bearer ${this.token}` });
          // this.user = user;
        }
        return productList;
      }),
      catchError((error: any) => { return of([]) }));
  }

  deshabilitarProducto(productId: number): Observable<boolean> {
    return this.httpClient.post(this.apiUrl + '/admin/disable-product/' + productId, {}, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        return response.result === 0
      }),
      catchError((error: any) => { return of(false) }));
  }

  habilitarProducto(productId: number): Observable<boolean> {
    return this.httpClient.post(this.apiUrl + '/admin/enable-product/' + productId, {}, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        return response.result === 0
      }),
      catchError((error: any) => { return of(false) }));
  }

  updateProduct(product: Producto, image: File): Observable<boolean> {
    let formParams = new FormData();
    formParams.append('id', product.id.toString());
    formParams.append('name', product.nombre);
    formParams.append('disabled', product.disabled ? '1' : '0');
    // TODO: acabar la implementació
    formParams.append('description', product.desc);
    formParams.append('idProductFamily', product.idPF.toString());
    formParams.append('price', product.price.toString());
    formParams.append('iva', product.iva.toString());

    formParams.append('image', image);
    console.log(formParams);



    return this.httpClient.post(environment.apiBaseUrl + '/admin/update-product', formParams, this.authenticationService.getHttpRequestOptionsForm()).pipe(
      map((response: any) => {
        console.log(response);
        return response.result === 0
      }),
      catchError((error: any) => { return of(false) }));
  }

  newProduct(product: Producto, image: File): Observable<boolean> {
    let formParams = new FormData();
    formParams.append('name', product.nombre);
    formParams.append('description', product.desc);
    formParams.append('idProductFamily', product.idPF.toString());
    formParams.append('price', product.price.toString());
    formParams.append('iva', product.iva.toString());
    formParams.append('image', image);
    console.log(formParams);
    return this.httpClient.post(environment.apiBaseUrl + '/admin/add-product', formParams, this.authenticationService.getHttpRequestOptionsForm()).pipe(
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
