import { Component } from '@angular/core';
import { Router } from '@angular/router';
// import { MatDialog } from '@angular/material/dialog';
import { BarcodeFormat } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';
// import { FormatsDialogComponent } from './formats-dialog/formats-dialog.component';
// import { AppInfoDialogComponent } from './app-info-dialog/app-info-dialog.component';

@Component({
  selector: 'ba-bartender-scan',
  templateUrl: './bartender-scan.component.html',
  styleUrls: ['./bartender-scan.component.scss']
})
export class BartenderScanComponent {

  availableDevices: MediaDeviceInfo[]=[];
  deviceCurrent: MediaDeviceInfo;
  deviceSelected: any;

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.QR_CODE,
  ];

  hasDevices: boolean;
  hasPermission: boolean;

  qrResultString: string;

  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;

  // constructor(private readonly _dialog: MatDialog) { }
  constructor(
    private router: Router
  ) { }

  clearResult(): void {
    this.qrResultString = null;
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    console.log(devices)
    this.hasDevices = Boolean(devices && devices.length);
  }

  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
    console.log(resultString);
    this.router.navigateByUrl(`/bartender/order/${resultString}`)
  }

  onDeviceSelectChange(selected: any) {
    if (this.deviceCurrent.deviceId === selected) { return; }
    const device = this.availableDevices.find(x => {
      return x.deviceId === selected
    });
    this.deviceCurrent = device;
  }

  onDeviceChange(device: MediaDeviceInfo) {
    const selectedStr = device?.deviceId || '';
    if (this.deviceSelected === selectedStr) { return; }
    this.deviceSelected = selectedStr;
    this.deviceCurrent = device || undefined;
  }

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  public onScanError(event:any){
    console.error(event)
  }
}
