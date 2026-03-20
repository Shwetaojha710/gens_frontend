import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import SignaturePad from 'signature_pad';
import html2pdf from 'html2pdf.js';
import { Notyf } from 'notyf';
import { FormsModule } from "@angular/forms";
import { CommonModule, DatePipe } from '@angular/common';
@Component({
  selector: 'app-nda',
  imports: [FormsModule,CommonModule],
  templateUrl: './nda.component.html',
  styleUrl: './nda.component.css'
})
export class NdaComponent {
  @ViewChild('signatureCanvas') canvas!: ElementRef;
  signaturePad!: SignaturePad;
  personalDetails:any={}
  tenant:any={}
   notyf: Notyf;
 constructor(

  ) {

    this.personalDetails = JSON.parse(localStorage.getItem('employeeId') || '{}');
    this.tenant = JSON.parse(localStorage.getItem('tenant') || '{}');
    this.notyf = new Notyf();
  }
  isEdit = false;

  documentName = "NDA Agreement";

  data = {
    name: 'Bharti Verma',
    fatherName: 'Ashok Kumar',
    address: 'Barabanki, UP',
    companyName: 'Quaere Etechnologies Pvt Ltd',
    companyAddress: 'Lucknow',
    date: '04 Aug 2024',
    place: 'Lucknow'
  };

  toggleEdit() {
    this.isEdit = !this.isEdit;
  }

  downloadPDF() {
    const element:any = document.getElementById('nda-doc');
    html2pdf().from(element).save(this.documentName + '.pdf');
  }
downloadDoc() {
  const element = document.getElementById('nda-doc');

  if (!element) return;

  // Clone so we can modify before download
  const cloned = element.cloneNode(true) as HTMLElement;

  // 🔥 Replace input fields with values
  const inputs = cloned.querySelectorAll('input');

  inputs.forEach((input: any) => {
    const value = input.value || '';
    const span = document.createElement('span');
    span.innerText = value;
    input.parentNode.replaceChild(span, input);
  });

  // Create Word-compatible HTML
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head>
      <meta charset='utf-8'>
      <title>NDA</title>
      <style>
        body { font-family: 'Times New Roman'; line-height: 1.6; }
        h3 { text-align: center; text-decoration: underline; }
        ol { padding-left: 20px; }
      </style>
    </head>
    <body>
      ${cloned.innerHTML}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'NDA.doc';
  a.click();

  URL.revokeObjectURL(url);
}
}
