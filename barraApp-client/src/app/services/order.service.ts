import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from './authentication.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Order, OrderLine } from '../classes/order';
import { Producto } from '../classes/producto';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl: string = environment.apiBaseUrl;

  constructor(
    private authenticationService: AuthenticationService,
    private httpClient: HttpClient
  ) { }

  public getCurrentOrder(): Observable<Order> {
    return this.httpClient.get(`${this.apiUrl}/customer/current-order`, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        let order: Order = null;
        if (response.result === 0) {
          order = new Order(response.data.order, response.data.lines);
        }
        return order;
      }),
      catchError((error: any) => { return of(null) }));
  }

  public getOrderBartender(uuid: string, usrId: number, comId: number): Observable<Order> {
    const body = {
      uuid,
      usrId,
      comId
    }
    return this.httpClient.post(`${this.apiUrl}/bartender/get-order-bartender`, body, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        let order: Order = null;
        if (response.result === 0) {
          order = new Order(response.data.order, response.data.lines);
        }
        return order;
      }),
      catchError((error: any) => { return of(null) }));
  }

  public updateOrderLine(order:Order, line: OrderLine): Observable<Order> {
    const body = {
      orderId: order.id,
      lineId: line.id,
      amount: line.quantity
    }
    return this.httpClient.post(`${this.apiUrl}/customer/update-line`, body, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        let order: Order = null;
        if (response.result === 0) {
          order = new Order(response.data.order, response.data.lines);
        }
        return order;
      }),
      catchError((error: any) => { return of(null) }));
  }

  public newOrderLine(product: Producto, quantity: number): Observable<Order> {
    const body = {
      idProduct: product.id,
      amount: quantity
    }
    return this.httpClient.post(`${this.apiUrl}/customer/add-new-line`, body, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        let order: Order = null;
        if (response.result === 0) {
          order = new Order(response.data.order, response.data.lines);
        }
        return order;
      }),
      catchError((error: any) => { return of(null) }));
  }

  public updateOrderDelivered(uuid: string, usrId: number, comId: number): Observable<any> {
    const body = {
      uuid,
      usrId,
      comId
    }
    return this.httpClient.post(`${this.apiUrl}/bartender/order-delivery-confirmation`, body, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: any) => { return of(null) }));
  }

  public pay(order: Order, platform: string): Observable<any> {
    const body = {
      orderId: order.id,
      platform
    }
    return this.httpClient.post(`${this.apiUrl}/customer/pay`, body, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        console.log(response)
        return response;
      }),
      catchError((error: any) => { return of(null) }));
  }

  public confirmPayment(data: any, platform: string): Observable<any> {
    const body = {
      data,
      platform
    }
    return this.httpClient.post(`${this.apiUrl}/customer/payment-check`, body, this.authenticationService.getHttpRequestOptions()).pipe(
      map((response: any) => {
        console.log(response);
        return response;
      }),
      catchError((error: any) => { return of({ result: -100 }) }));
  }

  public registerPaymentError(data: any, platform: string): Observable<any> {
    const body = {
      data,
      platform
    }
    return of({ result: -100 });
  }

  handleError(error: any) {
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg);
    return throwError(() => errMsg);
  }

}

