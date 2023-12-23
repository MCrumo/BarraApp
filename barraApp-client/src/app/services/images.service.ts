import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor(
    private httpClient: HttpClient
  ) { }

  loadImage(imagePath: string, callback: (file: File) => void) {
    this.httpClient.get(imagePath, { responseType: 'blob' })
      .subscribe({
        next: (imageBlob) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageBlob);
          reader.onloadend = () => {
            const fileName = imagePath.split('/').pop();
            const file = new File([imageBlob], fileName, { type: imageBlob.type });
            callback(file);
          };
        },
        error: (error) => {
          console.error('Error al cargar la imagen:', error);
        }
      });
  }

}
