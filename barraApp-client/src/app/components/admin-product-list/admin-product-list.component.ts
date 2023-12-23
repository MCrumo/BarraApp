import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Familia } from 'src/app/classes/familia';
import { Producto } from 'src/app/classes/producto';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FamiliaService } from 'src/app/services/familia.service';
import { ModalService } from 'src/app/services/modal.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'ba-admin-product-list',
  templateUrl: './admin-product-list.component.html',
  styleUrls: ['./admin-product-list.component.scss']
})
export class AdminProductListComponent implements OnInit {

  public family: Familia;
  public productos: Producto[] = []
  public includeDisabled: boolean = false;
  public productSelected: Producto = null;

  constructor(
    public authenticationService: AuthenticationService,
    private familiaService: FamiliaService,
    private productoService: ProductoService,
    private ac: ActivatedRoute,
    private modalService: ModalService,
    private toastService: ToastService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.ac.params.subscribe(res => {
      const familyId = parseInt(res['id']);
      // this.productoService.obtenerProducto(0).subscribe((result: Producto[]) => {
      //   this.productos = result.filter(p => p.idPF === familyId);
      // });
      this.familiaService.getFamily(familyId).subscribe((result: Familia) => {
        this.family = result;
        this.getProductList(this.family.id,this.includeDisabled);
      });
    })
  }

  getProductList(familyId: number, includeDisabled:boolean) {
    this.productoService.obtenerPorCategoria(familyId, includeDisabled).subscribe((result: Producto[]) => {
      // this.productos = result.filter(p => p.idPF === familyId);
      this.productos = result;
    });
  }

  public editProduct(product: Producto) {
    this.productSelected = product;
  }

  public newProduct() {
    this.productSelected = new Producto();
    this.productSelected.idPF = this.family.id;
  }

  public includeDisabledChanged(event: any) {
    this.getProductList(this.family.id,this.includeDisabled);
  }

  public onProductUpdated(event: boolean) {
    if (event) {
      this.getProductList(this.family.id,this.includeDisabled);
    }
    this.productSelected = null;
  }

  public deshabilitarProducto(productoId: number) {
    this.modalService.confirm('Desabilitar producto', '¿Estás seguro de que quieres deshabilitar este producto?')
      .subscribe((confirmed) => {
        if (confirmed) {
          this.productoService.deshabilitarProducto(productoId).subscribe((result: boolean) => {
            if (result) {
              this.getProductList(this.family.id,this.includeDisabled);
            } else {
              this.toastService.show('Error al deshabilitar producto', 'bg-danger text-light', 5000);
            }
          });
        }
      });
  }

  public habilitarProducto(productoId: number) {
    this.modalService.confirm('Habilitar prodcuto', '¿Estás seguro de que quieres habilitar este producto?')
      .subscribe((confirmed) => {
        if (confirmed) {
          this.productoService.habilitarProducto(productoId).subscribe((result: boolean) => {
            if (result) {
              this.getProductList(this.family.id,this.includeDisabled);
            } else {
              this.toastService.show('Error al habilitar producto', 'bg-danger text-light', 5000);
            }
          });
        }
      });
  }

  public backToFamilies(){
    this.router.navigateByUrl('/admin/families');
  }

}
