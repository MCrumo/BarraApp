import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'ba-customer-payment-ok',
  templateUrl: './customer-payment-ok.component.html',
  styleUrls: ['./customer-payment-ok.component.scss']
})
export class CustomerPaymentOkComponent implements OnInit {

  public validating = true;
  public waitCounter = 0;

  constructor(
    private authenticationService: AuthenticationService,
    private orderService: OrderService,
    private router: Router,
    private activatedRoute: ActivatedRoute
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
      this.orderService.confirmPayment(params, this.activatedRoute.snapshot.paramMap.get('platform')).subscribe(result => {
        if (result.result === 0) {
          this.goToCustomer();
        }
        this.validating = false;
      })
    });
  }

  public goToCustomer() {
    this.router.navigateByUrl(`/customer`);
  }

}
