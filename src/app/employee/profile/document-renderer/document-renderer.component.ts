import { Component, Input, OnInit } from '@angular/core';
import { DocumentService } from '../../../services/document.service';


@Component({
  selector: 'app-document-renderer',
  template: `
    <div id="doc" [innerHTML]="html"></div>

    <button (click)="print()">Print</button>
    <button (click)="downloadPDF()">Download PDF</button>
  `
})
export class DocumentRendererComponent implements OnInit {

  @Input() type!: string;
  @Input() data!: any;

  html: string = '';

  constructor(private docService: DocumentService) {}

  ngOnInit() {
    const template = this.docService.getTemplate(this.type);
    this.html = this.docService.parseTemplate(template, this.data);
  }

  print() {
    window.print();
  }

  downloadPDF() {
    import('html2pdf.js').then(html2pdf => {
      const element:any = document.getElementById('doc');
      html2pdf.default().from(element).save(`${this.type}.pdf`);
    });
  }
}
