import { Component, OnInit } from '@angular/core';
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
export class OfferLetterComponent implements OnInit {
  personalDetails: any = {}
  tenant: any = {}
  notyf: Notyf;
  minDate: any
  currency: any
  obj: any = {}
  isDownload: boolean = false
  letterheadImage: string = '/assets/img/Letterhead-2.png'

  constructor(
    public payrollService: PayrollService,
    private router: Router,
    public statusService: StatusService,
    public dataService: DataService
  ) {
    this.tenant = JSON.parse(localStorage.getItem('tenant') || '{}');
    this.notyf = new Notyf();
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.personalDetails = JSON.parse(localStorage.getItem('employeeId') || '{}');
    this.currency = JSON.parse(localStorage.getItem('currency') || '{}');
  }

  ngOnInit() {
    // Load default letterhead as base64 so it renders correctly in PDF & print
    this.getBase64ImageFromUrl('/assets/img/Letterhead-2.png')
      .then(base64 => { this.letterheadImage = base64; })
      .catch(() => { /* fallback to path */ });
  }

  onLetterheadUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.letterheadImage = e.target?.result as string;
    };
    reader.readAsDataURL(input.files[0]);
  }

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
  getBase64FromSrc(src: string): Promise<string> {
    return fetch(src)
      .then(r => r.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));
  }
printDoc() {
  this.isDownload = true;

  this.getBase64FromSrc('/assets/img/Letterhead-2.png')
    .then((bgImage) => {

      const element = document.getElementById('offer-doc');
      if (!element) {
        this.isDownload = false;
        return;
      }

      const content = element.outerHTML;

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) {
        this.isDownload = false;
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Offer Letter</title>
            <style>

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }

            body {
              margin: 0;
              font-family: "Times New Roman", serif;
            }

            /* 🔥 APPLY BACKGROUND DIRECTLY TO YOUR DIV */
            #offer-doc {
              width: 21cm;
              min-height: 29.7cm;
              padding: 100px 60px;
              position: relative;

              background-image: url('${bgImage}');
              background-repeat: no-repeat;
              background-size: 100% 100%;
            }

            input {
              border: none;
              outline: none;
              background: transparent;
              font-family: inherit;
              font-size: inherit;
            }

            @media print {
              body { margin: 0; }
              @page { margin: 0; size: A4; }
            }

            </style>
          </head>

          <body>
            ${content}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        this.isDownload = false;
      }, 500);

    })
    .catch(err => {
      console.error(err);
      this.isDownload = false;
    });
}

  async downloadPDF() {
    this.isDownload = true;
    // Wait for Angular to update DOM (hide inputs, show value spans)
    await new Promise(resolve => setTimeout(resolve, 200));

    const element = document.getElementById('offer-doc');
    if (!element) { this.isDownload = false; return; }

    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = (html2pdfModule as any).default || html2pdfModule;

    const opt = {
      margin: 0,
      filename: `OfferLetter_${this.personalDetails.firstName || 'Employee'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      this.isDownload = false;
    });
  }
}
