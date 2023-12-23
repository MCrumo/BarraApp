import { Component } from '@angular/core';
import { Order, OrderLine } from 'src/app/classes/order';
import { Producto } from 'src/app/classes/producto';
import { ConfigService } from 'src/app/services/config.service';
import { OrderService } from 'src/app/services/order.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'ba-customer-cart',
  templateUrl: './customer-cart.component.html',
  styleUrls: ['./customer-cart.component.scss']
})
export class CustomerCartComponent {
  public currentOrder: Order = null;
  public QrCode: string = null;
  public displayPayButtons = false;
  public waiting = 0;
  public displayProductPicker = false;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
    public configService: ConfigService
  ) { }

  ngOnInit() {
    this.updateCurrentOrder();
  }

  public increaseQuantity(line: OrderLine): void {
    this.updateQuantity(line, line.quantity + 1);
  }

  public decreaseQuantity(line: OrderLine): void {
    this.updateQuantity(line, line.quantity - 1);
  }

  public formatCurrency(value: number): string {
    const formattedValue = value.toFixed(2);
    return `${formattedValue} €`;
  }

  public closeQR() {
    this.QrCode = null;
    this.updateCurrentOrder();
  }

  public addProductClick() {
    this.displayProductPicker = true;
  }

  public showPayButtons() {
    this.displayPayButtons = true;
  }

  public pay(platform: string) {
    this.waiting++;
    this.orderService.pay(this.currentOrder, platform).subscribe(result => {
      console.log(result);
      if (result.result === 0) {
        if (result.data.method === 'GET') {
          console.log(result.data.link)
          window.location.href = result.data.link;
        }
        if (result.data.method === 'POST') {
          // Crear un formulario
          const form = document.createElement('form');
          form.setAttribute('method', 'post');
          form.setAttribute('action', result.data.link);

          // Agregar los datos del formulario como inputs ocultos
          const formData = result.data.formData;
          for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
              const hiddenField = document.createElement('input');
              hiddenField.setAttribute('type', 'hidden');
              hiddenField.setAttribute('name', key);
              hiddenField.setAttribute('value', formData[key]);

              form.appendChild(hiddenField);
            }
          }

          // Agregar el formulario al body y enviarlo
          document.body.appendChild(form);
          form.submit();
        }
      } else {
        this.toastService.show('Error al conectar con la plataforma de pago', 'bg-danger text-light', 5000);
        this.waiting--;
      }
    })
  }

  private updateQuantity(line: OrderLine, newQuantity: number): void {
    const quantityBackup = line.quantity;
    line.quantity = newQuantity;
    this.orderService.updateOrderLine(this.currentOrder, line).subscribe(result => {
      if (result) {
        this.currentOrder = result;
      } else {
        line.quantity = quantityBackup;
        this.toastService.show('Error al actualizar cantidad', 'bg-danger text-light', 5000);
      }
    });
  }

  private updateCurrentOrder() {
    this.orderService.getCurrentOrder().subscribe(result => {
      this.currentOrder = result;
    });
  }

  public productSelected(product: Producto) {
    console.log('product selected: ', product)
    if (product) {
      this.orderService.newOrderLine(product, 1).subscribe((result: any) => {
        this.currentOrder = result;
        // this.currentOrder = null;
      })
    }
    this.displayProductPicker = false;
  }

}
