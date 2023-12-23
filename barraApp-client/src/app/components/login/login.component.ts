import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'ba-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string = null;
  public password: string = null;

  constructor(
    public authenticationService: AuthenticationService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    setTimeout(()=>this.checkForValidToken(),500);
  }

  private checkForValidToken() {
    if (this.authenticationService.haveToken()) {
      this.router.navigateByUrl(`/${this.authenticationService.user.role}`);
    }
  }


  public login() {
    this.authenticationService.loginCheck(this.email, this.password).subscribe({
      next: (user) => {
        if (user) {
          this.toastService.show('Login correcto', 'bg-success text-light', 0);        
          this.router.navigateByUrl(`/${this.authenticationService.user.role}`);
        } else {
          this.toastService.show('Credenciales erróneas', 'bg-danger text-light', 5000);
        }
      },
      error: (error) => {
        this.toastService.show('Credenciales erróneas', 'bg-danger text-light', 5000);
      }
    })
  }

}
