import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService } from 'src/app/services/toast.service';
import { Producto } from 'src/app/classes/producto';
import { ProductoService } from 'src/app/services/producto.service';
import { ImagesService } from 'src/app/services/images.service';
import { Familia } from 'src/app/classes/familia';

@Component({
  selector: 'ba-admin-product-editor',
  templateUrl: './admin-product-editor.component.html',
  styleUrls: ['./admin-product-editor.component.scss']
})
export class AdminProductEditorComponent implements OnInit, OnChanges {
  @Input() product: Producto = null;
  @Input() family: Familia = null;
  @Output() productUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();
  public editProduct: Producto = null;

  public image: File;
  public preview: string;
  public imageChanged: boolean = false;

  constructor(
    public authenticationService: AuthenticationService,
    private imagesService: ImagesService,
    private productoService: ProductoService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const product: SimpleChange = changes['product'];
    if (product) {
      if (product.currentValue) {
        this.editProduct = new Producto();
        this.editProduct.id = product.currentValue.id;
        this.editProduct.nombre = product.currentValue.nombre;
        this.editProduct.desc = product.currentValue.desc;
        this.editProduct.disabled = product.currentValue.disabled;
        this.editProduct.price = product.currentValue.price;
        this.editProduct.iva = product.currentValue.iva;
        this.editProduct.idPF = product.currentValue.idPF;
        this.imagesService.loadImage(product.currentValue.fotoUrl, (loadedFile) => {
          this.preview = URL.createObjectURL(loadedFile);
          this.image = loadedFile;
          this.imageChanged = false;
        });
      }
    }
  }

  onSubmit(data: any) {
    if (this.product.id) {
      this.updateProduct();
    } else {
      this.addProduct();
    }
  }

  updateProduct() {
    this.productoService.updateProduct(this.editProduct, this.image).subscribe(result => {
      if (result) {
        this.product.nombre = this.editProduct.nombre;
        this.product.desc = this.editProduct.desc;
        this.product.price = this.editProduct.price;
        this.product.iva = this.editProduct.iva;
        this.closeDialog(true);
      } else {
        this.toastService.show('Error al guardar el producto', 'bg-danger text-light', 5000);
      }
    })
  }

  addProduct() {
    this.productoService.newProduct(this.editProduct, this.image).subscribe(result => {
      if (result) {
        this.product.nombre = this.editProduct.nombre;
        this.product.desc = this.editProduct.desc;
        this.product.price = this.editProduct.price;
        this.product.iva = this.editProduct.iva;
        this.product.idPF = this.family.id;
        this.product.disabled = false;
        this.closeDialog(true);
      } else {
        this.toastService.show('Error al guardar el producto', 'bg-danger text-light', 5000);
      }
    })
  }

  upload(event: any) {
    const image = <File>event.target.files[0]
    this.extraerBase64(image).then((img: any) => {
      this.preview = img.base;
    })
    this.image = image
    this.imageChanged = true;
  }

  public closeDialog(productUpdated: boolean = false) {
    this.productUpdated.emit(productUpdated);
  }

  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeImg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader = new FileReader();
      reader.readAsDataURL($event)
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        });
      };
    } catch (e) {
      return null;
    }
  })
}

