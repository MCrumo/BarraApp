import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FamiliaService } from 'src/app/services/familia.service';
import { Familia } from 'src/app/classes/familia';
import { Producto } from 'src/app/classes/producto';
import { ProductoService } from 'src/app/services/producto.service';

@Component({
  selector: 'ba-customer-product-picker',
  templateUrl: './customer-product-picker.component.html',
  styleUrls: ['./customer-product-picker.component.scss']
})
export class CustomerProductPickerComponent implements OnInit {

  @Output() productSelected: EventEmitter<Producto> = new EventEmitter<Producto>();
  public family: Familia = null;
  public familyList: Familia[];
  public productList: Producto[];

  constructor(
    private familiaService: FamiliaService,
    private productoService: ProductoService
  ) { }

  ngOnInit() {
    this.familiaService.getFamilyList().subscribe(result => {
      this.familyList = result
      console.log(this.familyList)
    });
  }

  public imageError(event: any, familia: any) {
    const defaultImage = '/assets/images/no-image.png';
    event.target.src = defaultImage;
  }

  viewProducts(family: Familia) {
    this.productoService.obtenerPorCategoria(family.id, false).subscribe(result => {
      console.log(result);
      this.family = family;
      // this.productList = result.filter(p => p.idPF === family.id);
      this.productList = result;
    })
  }

  public selectProduct(product: Producto) {
    this.productSelected.emit(product);
  }

}
