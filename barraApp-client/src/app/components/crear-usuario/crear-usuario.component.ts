import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'ba-crear-usuario',
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.scss']
})
export class CrearUsuarioComponent {
  constructor(
    private authenticationService:AuthenticationService,
    private http:HttpClient,
    private router:Router,
    private toastService: ToastService
  ){}
onSubmit(data:any) {
  let formParams = new FormData()

  formParams.append('user', data.user)
  formParams.append('pass', data.pass)
  formParams.append('name', data.name)
  formParams.append('surname1', data.surname)
  formParams.append('surname2', "")
  formParams.append('birth', data.birth)

  this.http.post(environment.apiBaseUrl + '/user-enrollment',formParams, this.authenticationService.getHttpRequestOptionsForm())
    .subscribe((result: any)=> {
        if (result.result == 0) {
          this.toastService.show('Usuario creado, checkea tu correo', 'bg-success text-light', 2500); 
          this.router.navigateByUrl(`/login`);
        } else {
          if (result.result == -30) {
           this.toastService.show( result.data[0], 'bg-danger text-light', 2500); 
          }
          else if (result.result == -10) {
            this.toastService.show(result.data[0], 'bg-danger text-light', 2500); 
          }
          else if (result.result == -11) {
            this.toastService.show(result.data[0], 'bg-danger text-light', 2500); 
          }
          else if (result.result == -12) {
            this.toastService.show(result.data[0], 'bg-danger text-light', 2500); 
          }
          else if (result.result == -20) {
            this.toastService.show(result.data[0], 'bg-danger text-light', 2500); 
          }
          else if (result.result == -21) {
            this.toastService.show(result.data[0], 'bg-danger text-light', 2500); 
          }
        }
    })
    
}
}
