import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/classes/user';
import { AdminService } from 'src/app/services/admin.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ModalService } from 'src/app/services/modal.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'ba-admin-user-list',
  templateUrl: './admin-user-list.component.html',
  styleUrls: ['./admin-user-list.component.scss']
})
export class AdminUserListComponent implements OnInit {

  public userSelected: User = null;
  public users: User[];

  constructor(
    public authenticationService: AuthenticationService,
    private adminService: AdminService,
    private modalService: ModalService,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    this.getUserList();
  }

  private getUserList() {
    this.adminService.getUserList().subscribe(result => {
      console.log(result);
      this.users = result
    });
  }

  public editUser(user: User) {
    this.userSelected = user;
  }

  public newFamily() {
    this.userSelected = new User();
  }

  // public includeDisabledChanged(event: any) {
  //   this.getFamilyList(this.includeDisabled);
  // }

  public onUserUpdated(event: boolean) {
    if (event) {
      this.getUserList();
    }
    this.userSelected = null;
  }

  // public deshabilitarFamilia(familiaId: number) {
  //   this.modalService.confirm('Desabilitar familia', '¿Estás seguro de que quieres deshabilitar esta familia?')
  //     .subscribe((confirmed) => {
  //       if (confirmed) {
  //         this.adminService.deshabilitarFamilia(familiaId).subscribe((result: boolean) => {
  //           if (result) {
  //             this.getFamilyList(this.includeDisabled);
  //           } else {
  //             this.toastService.show('Error al deshabilitar familia', 'bg-danger text-light', 5000);
  //           }
  //         });
  //       }
  //     });
  // }

  // public habilitarFamilia(familiaId: number) {
  //   this.modalService.confirm('Habilitar familia', '¿Estás seguro de que quieres habilitar esta familia?')
  //     .subscribe((confirmed) => {
  //       if (confirmed) {
  //         this.adminService.habilitarFamilia(familiaId).subscribe((result: boolean) => {
  //           if (result) {
  //             this.getFamilyList(this.includeDisabled);
  //           } else {
  //             this.toastService.show('Error al habilitar familia', 'bg-danger text-light', 5000);
  //           }
  //         });
  //       }
  //     });
  // }

}
