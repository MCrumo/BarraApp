import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { OrderService } from 'src/app/services/order.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'ba-customer-payment-ko',
  templateUrl: './customer-payment-ko.component.html',
  styleUrls: ['./customer-payment-ko.component.scss']
})
export class CustomerPaymentKoComponent implements OnInit{

  public validating = true;
  public waitCounter = 0;

  constructor(
    private authenticationService: AuthenticationService,
    private orderService: OrderService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    this.checkForValidToken();
  }

  private checkForValidToken() {
    if (this.authenticationService.haveToken()) {
      this.checkPayment();
    } else {
      console.log('waiting token')
      this.waitCounter++;
      if (this.waitCounter < 20) {
        setTimeout(() => { this.checkForValidToken() }, 500);
      } else {
        this.goToCustomer();
      }
    }
  }

  private checkPayment() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.orderService.registerPaymentError(params, this.activatedRoute.snapshot.paramMap.get('platform')).subscribe(result => {
        this.goToCustomer();
        this.validating = false;
      })
    });
  }

  public goToCustomer() {
    this.toastService.show('Error en el pago', 'bg-danger text-light', 10000);
    this.router.navigateByUrl(`/customer`);
  }


}
