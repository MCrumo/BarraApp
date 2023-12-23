import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { roleActivateGuard } from './guards/role-activate.guard';
import { CustomerHomeComponent } from './components/customer-home/customer-home.component';
import { CustomerCartComponent } from './components/customer-cart/customer-cart.component';
import { CustomerPaymentOkComponent } from './components/customer-payment-ok/customer-payment-ok.component';
import { CustomerPaymentKoComponent } from './components/customer-payment-ko/customer-payment-ko.component';
import { BartenderHomeComponent } from './components/bartender-home/bartender-home.component';
import { BartenderScanComponent } from './components/bartender-scan/bartender-scan.component';
import { BartenderOrderComponent } from './components/bartender-order/bartender-order.component';
import { AdminFamilyListComponent } from './components/admin-family-list/admin-family-list.component';
import { AdminProductListComponent } from './components/admin-product-list/admin-product-list.component';
import { CrearUsuarioComponent } from './components/crear-usuario/crear-usuario.component';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';
import { AdminUserListComponent } from './components/admin-user-list/admin-user-list.component';
import { AdminConfigurationComponent } from './components/admin-configuration/admin-configuration.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'crearUsuario', component: CrearUsuarioComponent },
  { path: 'email-verification/:_email-verification/:key_', component: EmailVerificationComponent },
  { path: 'payment-ok/:platform', component: CustomerPaymentOkComponent },
  { path: 'payment-ko/:platform', component: CustomerPaymentKoComponent },
  {
    path: 'admin',
    component: AdminHomeComponent,
    canActivate: [roleActivateGuard],
    // canActivateChild: [RouteGuard],
    children: [
      { path: '', redirectTo: 'families', pathMatch: 'full' },
      {
        path: 'families',
        component: AdminFamilyListComponent,
        // canActivate: [RouteGuard]
      },
      {
        path: 'families/:id',
        component: AdminProductListComponent,
        // canActivate: [RouteGuard]
      },
      {
        path: 'users',
        component: AdminUserListComponent,
        // canActivate: [RouteGuard]
      },
      {
        path: 'config',
        component: AdminConfigurationComponent,
        // canActivate: [RouteGuard]
      },
    ]
  },
  {
    path: 'customer',
    component: CustomerHomeComponent,
    canActivate: [roleActivateGuard],
    // canActivateChild: [RouteGuard],
    children: [
      { path: '', redirectTo: 'cart', pathMatch: 'full' },
      {
        path: 'cart',
        component: CustomerCartComponent,
        // canActivate: [RouteGuard]
      }
    ]
  },
  {
    path: 'bartender',
    component: BartenderHomeComponent,
    canActivate: [roleActivateGuard],
    // canActivateChild: [RouteGuard],
    children: [
      { path: '', redirectTo: 'scan', pathMatch: 'full' },
      {
        path: 'scan',
        component: BartenderScanComponent,
        // canActivate: [RouteGuard]
      },
      {
        path: 'order/:uuid/:usrId/:orderId',
        component: BartenderOrderComponent,
        // canActivate: [RouteGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
