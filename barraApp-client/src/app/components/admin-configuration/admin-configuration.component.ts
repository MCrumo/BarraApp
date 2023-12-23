import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService } from 'src/app/services/toast.service';
import { ImagesService } from 'src/app/services/images.service';
import { ConfigService } from 'src/app/services/config.service';
import { Config } from 'src/app/classes/config';
import { config } from 'rxjs';

@Component({
  selector: 'ba-admin-configuration',
  templateUrl: './admin-configuration.component.html',
  styleUrls: ['./admin-configuration.component.scss']
})
export class AdminConfigurationComponent implements OnInit {
  public editConfig: Config = new Config();
  public initDate: string;
  public endDate: string;

  public image: File;
  public preview: string;
  public imageChanged: boolean = false;

  constructor(
    public authenticationService: AuthenticationService,
    private imagesService: ImagesService,
    private toastService: ToastService,
    public configService:ConfigService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    Object.assign(this.editConfig,this.configService.config);
    console.log(this.configService,config)
    console.log(this.editConfig)
    this.initDate = this.editConfig.initDate.toISOString().split('T')[0];
    this.endDate = this.editConfig.endDate.toISOString().split('T')[0];
  }

  public updateConfig() {
    this.configService.updateConfig(this.editConfig,this.authenticationService.getHttpRequestOptions()).subscribe(result => {
      if (result) {
        this.toastService.show('Configuración guardada correctamente', 'bg-success text-light', 5000);
      } else {
        this.toastService.show('Error al guardar la nueva configuración', 'bg-danger text-light', 5000);
      }
    })
  }

  public onChangeInitDate(event:any){
    this.editConfig.initDate=new Date(this.initDate);
  }

  public onChangeEndDate(event:any){
    this.editConfig.endDate=new Date(this.endDate);
  }

  upload(event: any) {
    const image = <File>event.target.files[0]
    this.extraerBase64(image).then((img: any) => {
      this.preview = img.base;
    })
    this.image = image
    this.imageChanged = true;
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

