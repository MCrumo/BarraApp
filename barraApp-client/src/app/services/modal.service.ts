import { Component, Injectable, Input, TemplateRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, catchError, from, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalService: NgbModal) { }

  confirm(title:string, message: string): Observable<boolean> {
    const modalRef = this.modalService.open(ModalContent);
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.title = title;

    return from(modalRef.result).pipe(
      map((result) => result === 'confirm'),
      catchError(() => of(false)) 
    );
  }
}

@Component({
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ title }}</h4>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="modal.dismiss('cancel')">Cancelar</button>
      <button type="button" class="btn btn-danger" (click)="modal.close('confirm')">Confirmar</button>
    </div>
  `
})
class ModalContent {
  @Input() message: string;
  @Input() title: string;
  constructor(public modal: NgbActiveModal) { }
}
