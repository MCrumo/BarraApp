import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Familia } from 'src/app/classes/familia';
import { FamiliaService } from 'src/app/services/familia.service';
import { ToastService } from 'src/app/services/toast.service';
import { ImagesService } from 'src/app/services/images.service';

@Component({
  selector: 'ba-admin-family-editor',
  templateUrl: './admin-family-editor.component.html',
  styleUrls: ['./admin-family-editor.component.scss']
})
export class AdminFamilyEditorComponent implements OnInit, OnChanges {
  @Input() family: Familia = null;
  @Output() familyUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();
  public editFamily: Familia = null;

  public image: File;
  public preview: string;
  public imageChanged: boolean = false;

  constructor(
    public authenticationService: AuthenticationService,
    private familiaService: FamiliaService,
    private imagesService: ImagesService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const family: SimpleChange = changes['family'];
    if (family) {
      if (family.currentValue) {
        this.editFamily = new Familia();
        this.editFamily.id = family.currentValue.id;
        this.editFamily.nombre = family.currentValue.nombre;
        this.editFamily.agelimit = family.currentValue.agelimit;
        this.editFamily.desc = family.currentValue.desc;
        this.editFamily.disabled = family.currentValue.disabled;
        this.imagesService.loadImage(family.currentValue.fotoUrl, (loadedFile) => {
          this.preview = URL.createObjectURL(loadedFile);
          this.image = loadedFile;
          this.imageChanged = false;
        });
      }
    }
  }

  onSubmit(data: any) {
    if (this.family.id) {
      this.updateFamily();
    } else {
      this.addFamily();
    }
  }

  updateFamily() {
    this.familiaService.updateFamily(this.editFamily, this.image).subscribe(result => {
      if (result) {
        this.family.nombre = this.editFamily.nombre;
        this.family.agelimit = this.editFamily.agelimit;
        this.family.desc = this.editFamily.desc;
        this.closeDialog(true);
      } else {
        this.toastService.show('Error al guardar la familia de productos', 'bg-danger text-light', 5000);
      }
    })
  }

  addFamily() {
    this.familiaService.newFamily(this.editFamily, this.image).subscribe(result => {
      if (result) {
        this.family.nombre = this.editFamily.nombre;
        this.family.agelimit = this.editFamily.agelimit;
        this.family.desc = this.editFamily.desc;
        this.closeDialog(true);
      } else {
        this.toastService.show('Error al guardar la familia de productos', 'bg-danger text-light', 5000);
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

  public closeDialog(familyUpdated: boolean = false) {
    this.familyUpdated.emit(familyUpdated);
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

