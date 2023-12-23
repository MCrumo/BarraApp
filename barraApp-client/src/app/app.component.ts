import { Component, TemplateRef } from '@angular/core';
import { ToastService } from './services/toast.service';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'ba-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'barra-app';

  constructor(
    public toastService: ToastService,
    private authenticationService: AuthenticationService
  ) {

  }

  public isTemplateToast(toast: any) {
    return toast.textOrTpl instanceof TemplateRef;
  }

}
