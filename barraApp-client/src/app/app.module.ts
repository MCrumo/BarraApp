import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CustomerHomeComponent } from './components/customer-home/customer-home.component';
import { CustomerCartComponent } from './components/customer-cart/customer-cart.component';
import { QRCodeModule } from 'angularx-qrcode';
import { CustomerPaymentOkComponent } from './components/customer-payment-ok/customer-payment-ok.component';
import { CustomerPaymentKoComponent } from './components/customer-payment-ko/customer-payment-ko.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { BartenderHomeComponent } from './components/bartender-home/bartender-home.component';
import { BartenderScanComponent } from './components/bartender-scan/bartender-scan.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BartenderOrderComponent } from './components/bartender-order/bartender-order.component';
import { CustomerProductPickerComponent } from './components/customer-product-picker/customer-product-picker.component';
import { AdminFamilyListComponent } from './components/admin-family-list/admin-family-list.component';
import { AdminProductListComponent } from './components/admin-product-list/admin-product-list.component';
import { AdminFamilyEditorComponent } from './components/admin-family-editor/admin-family-editor.component';
import { AdminProductEditorComponent } from './components/admin-product-editor/admin-product-editor.component';
import { CrearUsuarioComponent } from './components/crear-usuario/crear-usuario.component';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';
import { AdminUserListComponent } from './components/admin-user-list/admin-user-list.component';
import { AdminUserEditorComponent } from './components/admin-user-editor/admin-user-editor.component';
import { AdminConfigurationComponent } from './components/admin-configuration/admin-configuration.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminHomeComponent,
    CustomerHomeComponent,
    CustomerCartComponent,
    CustomerPaymentOkComponent,
    CustomerPaymentKoComponent,
    AppHeaderComponent,
    BartenderHomeComponent,
    BartenderScanComponent,
    BartenderOrderComponent,
    CustomerProductPickerComponent,
    AdminFamilyListComponent,
    AdminProductListComponent,
    AdminFamilyEditorComponent,
    AdminProductEditorComponent,
    CrearUsuarioComponent,
    EmailVerificationComponent,
    AdminUserListComponent,
    AdminUserEditorComponent,
    AdminConfigurationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgbModule,
    HttpClientModule,
    QRCodeModule,
    ZXingScannerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
