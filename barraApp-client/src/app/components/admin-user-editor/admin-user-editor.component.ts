import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastService } from 'src/app/services/toast.service';
import { User } from 'src/app/classes/user';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'ba-admin-user-editor',
  templateUrl: './admin-user-editor.component.html',
  styleUrls: ['./admin-user-editor.component.scss']
})
export class AdminUserEditorComponent implements OnInit, OnChanges {
  @Input() user: User = null;
  @Output() userUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();
  public editUser: User = null;
  public birthDate: string;

  constructor(
    public authenticationService: AuthenticationService,
    private adminService: AdminService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const user: SimpleChange = changes['user'];
    if (user) {
      if (user.currentValue) {
        this.editUser = new User();
        this.editUser.id = user.currentValue.id;
        this.editUser.email = user.currentValue.email;
        this.editUser.role = user.currentValue.role;
        this.editUser.name = user.currentValue.name;
        this.editUser.surname1 = user.currentValue.surname1;
        this.editUser.surname2 = user.currentValue.surname2;
        this.editUser.birthDate = user.currentValue.birthDate;
        this.editUser.verified = user.currentValue.verified;
        this.editUser.balance = user.currentValue.balance;
        console.log(this.editUser)
        this.birthDate = this.editUser.birthDate.toISOString().split('T')[0];
      }
    }
  }

  onSubmit(data: any) {
      this.updateUser();
  }

  updateUser() {
    this.adminService.updateUser(this.editUser).subscribe(result => {
      if (result) {
        this.user.id = this.editUser.id;
        this.user.email = this.editUser.email;
        this.user.role = this.editUser.role;
        this.user.name = this.editUser.name;
        this.user.surname1 = this.editUser.surname1;
        this.user.surname2 = this.editUser.surname2;
        this.user.birthDate = this.editUser.birthDate;
        this.user.verified = this.editUser.verified;
        this.user.balance = this.editUser.balance;
        this.closeDialog(true);
      } else {
        this.toastService.show('Error al guardar los datos de usuario', 'bg-danger text-light', 5000);
      }
    })
  }

  public onChangeDate(event:any){
    console.log(event);
    this.editUser.birthDate=new Date(this.birthDate);
    console.log(this.editUser)
  }

  public closeDialog(userUpdated: boolean = false) {
    this.userUpdated.emit(userUpdated);
  }

}

