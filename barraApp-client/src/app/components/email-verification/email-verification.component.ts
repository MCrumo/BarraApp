import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'ba-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {
  email: string;
  pass: string;

  constructor(
    public authenticationService: AuthenticationService,
    private router: Router,
    private ac: ActivatedRoute,
    private http: HttpClient,
    private toastService: ToastService
  ) {

  }
  ngOnInit(): void {
    this.ac.paramMap.subscribe((res) => {
      this.email = res.get('_email-verification');
      this.pass = res.get('key_')
      this.http.get(environment.apiBaseUrl + '/email-verification/' + this.email + '/' + this.pass, this.authenticationService.getHttpRequestOptions())
        .subscribe((result: any) => {
          if (result.result === 0) {
            this.toastService.show('Email verificado correctamente. Ya puedes iniciar sesión', 'bg-success text-light', 5000);
          } else {
            this.toastService.show(result.data.message, 'bg-danger text-light', 5000);
          }
          this.router.navigateByUrl('/login');
        })
    })
  }
}