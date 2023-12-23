import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Familia } from 'src/app/classes/familia';
import { AdminService } from 'src/app/services/admin.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FamiliaService } from 'src/app/services/familia.service';
import { ModalService } from 'src/app/services/modal.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'ba-admin-family-list',
  templateUrl: './admin-family-list.component.html',
  styleUrls: ['./admin-family-list.component.scss']
})
export class AdminFamilyListComponent implements OnInit {

  public includeDisabled: boolean = false;
  public familySelected: Familia = null;
  public familias: Familia[];

  constructor(
    public authenticationService: AuthenticationService,
    private adminService: AdminService,
    private familiaService: FamiliaService,
    private modalService: ModalService,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    this.getFamilyList(this.includeDisabled);
  }

  private getFamilyList(includeDisabled: boolean) {
    this.familiaService.getFamiliesList(includeDisabled).subscribe(result => {
      this.familias = result
    });
  }

  public editFamily(family: Familia) {
    this.familySelected = family;
  }

  public newFamily() {
    this.familySelected = new Familia();
  }

  public includeDisabledChanged(event: any) {
    this.getFamilyList(this.includeDisabled);
  }

  public onFamilyUpdated(event: boolean) {
    if (event) {
      this.getFamilyList(this.includeDisabled);
    }
    this.familySelected = null;
  }

  public deshabilitarFamilia(familiaId: number) {
    this.modalService.confirm('Desabilitar familia', '¿Estás seguro de que quieres deshabilitar esta familia?')
      .subscribe((confirmed) => {
        if (confirmed) {
          this.familiaService.deshabilitarFamilia(familiaId).subscribe((result: boolean) => {
            if (result) {
              this.getFamilyList(this.includeDisabled);
            } else {
              this.toastService.show('Error al deshabilitar familia', 'bg-danger text-light', 5000);
            }
          });
        }
      });
  }

  public habilitarFamilia(familiaId: number) {
    this.modalService.confirm('Habilitar familia', '¿Estás seguro de que quieres habilitar esta familia?')
      .subscribe((confirmed) => {
        if (confirmed) {
          this.familiaService.habilitarFamilia(familiaId).subscribe((result: boolean) => {
            if (result) {
              this.getFamilyList(this.includeDisabled);
            } else {
              this.toastService.show('Error al habilitar familia', 'bg-danger text-light', 5000);
            }
          });
        }
      });
  }

  public imageError(event: any, familia: any) {
    const defaultImage = '/assets/images/no-image.png';
    event.target.src = defaultImage;
  }
}
