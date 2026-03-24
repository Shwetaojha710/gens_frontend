import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Notyf } from 'notyf';
import { DataService } from '../../../services/data.service';
import { PayrollService } from '../../../services/payroll.service';
import { StatusService } from '../../../services/status.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-offer-letter',
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './offer-letter.component.html',
  styleUrl: './offer-letter.component.css'
})
export class OfferLetterComponent {
  personalDetails: any = {}
  tenant: any = {}
  notyf: Notyf;
  minDate: any
  currency: any
  newObj: any
  obj: any = {}
  isDownload: any = false
  constructor(
    public payrollService: PayrollService, private router: Router, public statusService: StatusService, public dataService: DataService
  ) {

    this.tenant = JSON.parse(localStorage.getItem('tenant') || '{}');

    this.notyf = new Notyf();
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // today
    this.notyf = new Notyf();
    this.personalDetails = JSON.parse(localStorage.getItem('employeeId') || '{}');
    this.currency = JSON.parse(localStorage.getItem('currency') || '{}');

  }

//   async downloadDoc() {
//     this.isDownload = true;

//     const element = document.getElementById('offer-doc');
//     if (!element) return;

//     const cloned = element.cloneNode(true) as HTMLElement;

//     // Replace inputs
//     const inputs = cloned.querySelectorAll('input');
//     inputs.forEach((input: any) => {
//       const span = document.createElement('span');
//       span.innerText = input.value || '';
//       input.parentNode.replaceChild(span, input);
//     });

//     // ✅ Convert images to base64
//     const logoBase64 = await this.getBase64ImageFromUrl('assets/img/logo/logo-quaere.png');
//     const soc2 = await this.getBase64ImageFromUrl('assets/img/logo/Picture1.jpg');
//     const updesco = await this.getBase64ImageFromUrl('assets/img/logo/Picture2.png');

//     const html = `
//   <html xmlns:o='urn:schemas-microsoft-com:office:office'
//         xmlns:w='urn:schemas-microsoft-com:office:word'>
//   <head>
//     <meta charset='utf-8'>
//     <style>
//       body { font-family: 'Times New Roman'; line-height:1.6; }

//       .footer {
//         margin-top:40px;
//         font-size:10px;
//         border-top:1px solid #ccc;
//         padding-top:10px;
//         display:flex;
//         justify-content:space-between;
//         align-items:center;
//       }


//     </style>
//   </head>

//   <body>

//     <!-- ✅ HEADER -->
//     <div class="header">
//       <div>
// <img src="${logoBase64}" style="height:10px!important; width:10px!important;">
//       </div>


//     </div>

//     ${cloned.innerHTML}

//     <!-- ✅ FOOTER -->
//     <div class="footer">
//       <div>
//         <b>Quaere Etechnologies Private Limited</b><br>
//         7th Floor, Cyber Tower, Vibhuti Khand,<br>
//         Gomti Nagar, Lucknow, U.P.-226010<br>
//         Web: www.quaeretech.com <br>
//         Email: info&#64;quaeretech.com <br>
//         <b>GSTN- 09AAACQ1581F1ZI</b>
//       </div>

//       <div class="logos">
//         <img src="${soc2}" style="height:40px;">
//         <img src="${updesco}" style="height:40px;">
//       </div>
//     </div>

//   </body>
//   </html>
//   `;

//     const blob = new Blob(['\ufeff', html], { type: 'application/msword' });

//     const url = URL.createObjectURL(blob);

//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `offer_letter_${this.personalDetails.firstName}.doc`;
//     a.click();

//     URL.revokeObjectURL(url);

//     this.isDownload = false;
//   }

  getBase64ImageFromUrl(url: string): Promise<string> {
    return fetch(url)
      .then(res => res.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));
  }

 printDoc() {
  const content = document.getElementById('offer-doc')?.innerHTML;

  const printWindow = window.open('', '', 'width=900,height=650');

  printWindow?.document.write(`
    <html>
      <head>
        <title>Offer Letter</title>
        <style>
          body {
            font-family: "Times New Roman", serif;
            padding: 20px;
          }

          .page {
            width: 100%;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);

  printWindow?.document.close();
  printWindow?.focus();

  setTimeout(() => {
    printWindow?.print();
    printWindow?.close();
  }, 500);
}

downloadDoc() {
  this.isDownload=true
  const element = document.getElementById('offer-doc');

  if (!element) return;

    // const element = document.getElementById('offer-doc');
    // if (!element) return;

    const cloned = element.cloneNode(true) as HTMLElement;

    // Replace inputs
    const inputs = cloned.querySelectorAll('input');
    inputs.forEach((input: any) => {
      const span = document.createElement('span');
      span.innerText = input.value || '';
      input.parentNode.replaceChild(span, input);
    });
  const images = element.getElementsByTagName('img');
  const promises: Promise<void>[] = [];

  // Convert all images to base64
  for (let img of images) {
    const promise = this.convertImageToBase64(img);
    promises.push(promise);
  }

  Promise.all(promises).then(() => {
    const content = element.innerHTML;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Offer Letter</title>
          <style>
            body {
              font-family: "Calibri (Body)", serif;
              margin: 2px!important;
              font-size: 11px;

            }
            img {
              max-width: 150px;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'OfferLetter.doc';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  // this.isDownload=false
}

convertImageToBase64(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = img.src;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context?.drawImage(image, 0, 0);

      const dataURL = canvas.toDataURL('image/png');

      img.src = dataURL; // replace src with base64

      resolve();
    };

    image.onerror = () => resolve();
  });
}
}
