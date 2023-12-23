import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'ba-customer-home',
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.scss']
})
export class CustomerHomeComponent {

  constructor(
    public authenticationService: AuthenticationService
  ) { }

}
