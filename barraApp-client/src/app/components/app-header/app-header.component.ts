import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'ba-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {

  public showMenu = false;

  constructor(
    public authenticationService: AuthenticationService,
    private router: Router
  ) { }

  public menuOption(option: string) {
    this.router.navigateByUrl(option);
    this.showMenu = false;
  }

}
