import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Order, OrderLine } from 'src/app/classes/order';
import { OrderService } from 'src/app/services/order.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'ba-bartender-order',
  templateUrl: './bartender-order.component.html',
  styleUrls: ['./bartender-order.component.scss']
})
export class BartenderOrderComponent implements OnInit {

  public currentOrder: Order = null;
  public uuid: string = null;
  public usrId: number = null;
  public orderId: number = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService,
    private router: Router,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    this.retrieveOrder();
  }

  private retrieveOrder() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.uuid = params.get('uuid');
      this.usrId = parseInt(params.get('usrId'));
      this.orderId = parseInt(params.get('orderId'));
      this.orderService.getOrderBartender(this.uuid, this.usrId, this.orderId).subscribe(order => {
        if (order) {
          if (order.status === 'pagada') {
            this.currentOrder = order;
          } else {
            this.toastService.show('Pedido ya entregado', 'bg-danger text-light', 5000);
            this.router.navigateByUrl('/bartender/scan');
          }
        } else {
          this.toastService.show('Pedido no encontrado', 'bg-danger text-light', 5000);
          this.router.navigateByUrl('/bartender/scan');
        }
      })
    });
  }

  public formatCurrency(value: number): string {
    const formattedValue = value.toFixed(2);
    return `${formattedValue} €`;
  }

  public backToScan(){

  }
  
  public orderDelivered() {
    this.orderService.updateOrderDelivered(this.uuid, this.usrId, this.orderId).subscribe(result => {
      if (result.result===0) {
        this.toastService.show('Pedido entregado', 'bg-success text-light', 5000);
        this.router.navigateByUrl('/bartender/scan');
      } else {
        this.toastService.show('Error al registrar entrega', 'bg-danger text-light', 5000);
      }
    })
  }

  public selectFile(line: OrderLine) {
    line.selected = !line.selected;
  }

}
