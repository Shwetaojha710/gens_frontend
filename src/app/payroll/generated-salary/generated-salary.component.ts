import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { INotyfNotificationOptions, Notyf } from 'notyf';
import { firstValueFrom } from 'rxjs';
import { MasterService } from '../../services/master.service';
import { PayrollService } from '../../services/payroll.service';
import { StatusService } from '../../services/status.service';
declare let bootstrap: any;
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { SearchPaginationComponent } from '../../master/search-pagination/search-pagination.component';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
// Tell TS/ESBuild that pdfMake is dynamic
const pdfMakeX: any = pdfMake;
pdfMakeX.vfs = (pdfFonts as any).vfs;
@Component({
  selector: 'app-generated-salary',
  imports: [NgSelectModule,
    FormsModule, CommonModule, SearchPaginationComponent],
  templateUrl: './generated-salary.component.html',
  styleUrl: './generated-salary.component.css'
})
export class GeneratedSalaryComponent {
  monthList = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  monthObj: any = {
    '1': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June',
    '07': 'July', '08': 'August', '09': 'September', '10': 'October', '11': 'November', '12': 'December'
  }
  yearList: any = [];
  notyf: Notyf;
  obj: any = {}
  constructor(private master: MasterService, private router: Router, private payroll: PayrollService, private statusService: StatusService) {
    this.notyf = new Notyf();
  }
  currency: any
  async ngOnInit() {
    await this.empList()
    await this.getYear();
    this.currency = JSON.parse(localStorage.getItem('currency') || '{}');
  }
  pageSize = 10;
  currentPage = 1;
  searchTerm: any;;
  itemsPerPage = 10;
  onSearch(term: string) {
    if (!term) {
      this.onSubmit();
    } else {
      this.searchTerm = term.toLowerCase();
      this.currentPage = 1;
      this.applyFilters();
    }

  }


  onPageChange(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }


  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.applyFilters();
  }
  filteredSalary: any = []
  searchText: any = ''

  export(): void {
    const exportData: any[] = [];

    this.SalaryArr.forEach((employee: any) => {
      const row: any = {};
      row['Employee'] = employee.employeeName;
      row['empCode'] = employee?.empCode;
      // row['email'] = employee?.email;
      // row['phone'] = employee?.phone;
      // row['department'] = employee?.department;
      // row['designation'] = employee?.designation;
      row['Account Number'] = employee?.bankAccount;
      row['IFSC Code'] = employee?.ifscCode;
      row['Net Amount'] = Math.round(employee?.net_amount).toFixed(0);

      exportData.push(row);
    });


    const worksheet: XLSX.WorkSheet = {};


    // const monthYear = `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`;
    const monthYear = `${this.monthObj[this.obj['month']]}-${this.obj['year']}`;
    XLSX.utils.sheet_add_aoa(worksheet, [[`Salary Sheet - ${monthYear}`]], { origin: "A1" });


    XLSX.utils.sheet_add_json(worksheet, exportData, { origin: "A2", skipHeader: false });


    const totalCols = Object.keys(exportData[0]).length;
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }
    ];


    worksheet['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Salary': worksheet },
      SheetNames: ['Salary']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(blob, `Salary_${monthYear}.xlsx`);
  }



  applyFilters() {



    const value = this.searchTerm || '';
    this.searchText = value.trim();

    if (this.searchText === '') {
      this.SalaryArr = [...this.originalList];
    } else {
      this.SalaryArr = this.originalList.filter((item: any) =>
        JSON.stringify(item).toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    let data = [...this.SalaryArr];
    // pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredSalary = data.slice(start, end);
  }
  checkUncheckAll() {
    this.SalaryArr.forEach((item: any) => item.isSelected = this.masterSelected);
  }
  masterSelected: boolean = false;

  isAllSelected() {
    this.masterSelected = this.SalaryArr.every((item: any) => item.isSelected);
    // this.SalaryArr=  this.SalaryArr.map({

    // })
  }
  async getYear() {
    this.yearList = []
    this.master.getAttendanceYear().subscribe((data: { [x: string]: any; data: any; }) => {
      console.log(data)
      if (data['status'] == true) {
        // this.notyf.success(data['message']);
        this.yearList = data.data;
        console.log(this.EmpList, "attendance master list");

      }
      else if (data['status'] == 'expired') {
        this.router.navigate(['login'])
      }
      else {
        // this.notyf.error(data['message']);
      }
    });

  }




  EmpList: any = []
  async empList() {
    this.EmpList = []
    this.master.getemployeeList().subscribe((data: { [x: string]: any; data: any; }) => {
      console.log(data)
      if (data['status'] == true) {
        // this.notyf.success(data['message']);
        this.EmpList = data.data;
        console.log(this.EmpList, "attendance master list");

      }
      else if (data['status'] == 'expired') {
        this.router.navigate(['login'])
      }
      else {
        // this.notyf.error(data['message']);
      }
    });

  }

  back() {

  }
  SalaryArr: any = []
  isLoading: boolean = false;
  originalList: any = []
  onSubmit() {
    this.isLoading = true;
    this.SalaryArr = []
    this.originalList = []
    let newObj = Object.assign({}, this.obj)
    if (newObj['employeeId'] === 'All') {
      newObj['employeeId'] = this.EmpList
        .map((item: any) => item.value)
        .filter((val: any) => val != 'All');
    } else {
      newObj['employeeId'] = [newObj['employeeId']]
    }

    this.payroll.getGeneratedSalaryList(newObj).subscribe({
      next: (response: any) => {
        console.log('response', response);
        this.isLoading = false;
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);

        if (status == true) {

          this.notyf.success(message)
          this.SalaryArr = response.data
          this.originalList = response.data
          console.log(this.SalaryArr, "salary Array");
          // pagination
          const start = (this.currentPage - 1) * this.pageSize;
          const end = start + this.pageSize;
          this.filteredSalary = this.SalaryArr.slice(start, end);
        }
        else if (status == "expired") {
          this.router.navigate(["login"]);
        }

        else {
          this.notyf.error(message)
        }

      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error:', err);
        this.notyf.error(err.error?.message)
      }
    });



  }
  SalaryBreakup: any = []
  modal: any;
  PayArr: any = []
  DedArr: any = []
  personalDetails:any;
    EmployerDedArr: any = []
   getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
  view(item: any) {
    const obj = Object.assign({}, item)
    this.personalDetails=obj

    this.personalDetails['totalWorkingDays']= this.getDaysInMonth(this.personalDetails.year, this.personalDetails.month)
 console.log(this.personalDetails,"personal detailss");
    this.SalaryBreakup = []
    this.payroll.getBillDetails(obj).subscribe({
      next: (response: any) => {
        console.log('response', response);

        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);

        if (status == true) {


          this.notyf.success(message)
          this.SalaryBreakup = response.data

          this.PayArr = []
          this.DedArr = []
          const EmployerDedArr = [];
          this.EmployerDedArr=[]
             // Initialize totals
          let totalEarning = 0;
          let totalDeduction = 0;
          let totalEmployerDeduction = 0;

          // Process data in a single loop
          for (const item of this.SalaryBreakup) {
            const amount = Number(item.finalAmount || 0);

            if (item.pay_code == 'PAY') {
              this.PayArr.push(item);
              totalEarning += amount;
            } else if (item.pay_code == 'DED') {
              if (item.name.toLowerCase().includes('employer')) {
                EmployerDedArr.push(item);
                totalEmployerDeduction += amount;
              } else {
                this.DedArr.push(item);
                totalDeduction += amount;
              }
            }
          }



          // Add as new keys
          this.PayArr = [...this.PayArr, { isSummary: true, name: 'Total Earnings', finalAmount: totalEarning.toFixed(0) }];
          this.DedArr = [...this.DedArr, { isSummary: true, name: 'Total Deductions', finalAmount: totalDeduction.toFixed(0) }];
          this.EmployerDedArr = [...EmployerDedArr, { isSummary: true, name: 'Total Employer Deductions', finalAmount: (totalEmployerDeduction).toFixed(0) }];


          const modalEl = document.getElementById('SalaryModal');
          if (modalEl) {
            this.modal = new bootstrap.Modal(modalEl);
            this.modal.show();
          } else {
            console.error('SalaryModal element not found');
          }
        }
        else if (status == "expired") {
          this.router.navigate(["login"]);
        }

        else {
          this.notyf.error(message)
        }

      },
      error: (err) => {
        console.error('Error:', err);
        this.notyf.error(err.error?.message)
      }
    });
  }
  revert(item: any) {
    let obj: any = {}
    obj['id'] = item?.id
    obj['bill_id'] = item?.bill_id
    obj["employeeId"] = item?.employeeId
    obj["month"] = item?.month
    obj["year"] = item?.year
    this.payroll.revertSalary(obj).subscribe({
      next: (response: any) => {
        console.log('response', response);

        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);

        if (status == true) {
          this.notyf.success(message)
          this.onSubmit()
        }
        else if (status == "expired") {
          this.router.navigate(["login"]);
        }

        else {
          this.notyf.error(message)
        }

      },
      error: (err: { error: { message: string | Partial<INotyfNotificationOptions>; }; }) => {
        console.error('Error:', err);
        this.notyf.error(err.error?.message)
      }
    });
  }
  closeModal() {

    this.modal.hide();
  }

  getPaySlip(item: any) {
    const obj = Object.assign({}, item)
    this.SalaryBreakup = []
    this.payroll.getBillDetails(obj).subscribe({
      next: (response: any) => {
        console.log('response', response);

        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);

        if (status == true) {


          // this.notyf.success(message)
          this.SalaryBreakup = response.data
          this.generatePayslip(this.SalaryBreakup, item);


        }
        else if (status == "expired") {
          this.router.navigate(["login"]);
        }

        else {
          this.notyf.error(message)
        }

      },
      error: (err) => {
        console.error('Error:', err);
        this.notyf.error(err.error?.message)
      }
    });

    // pdfMake.createPdf(docDefinition).download(`salary_slip_${employee.employeeId}_${salaryData[0].month}_${salaryData[0].year}.pdf`); // direct download
  }

  async getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = error => reject(error);
      img.src = url;
    });
  }


  async generatePayslip(data: any[], employee: any) {
    const earnings = data.filter((d: any) => d.pay_code == 'PAY');
    const deductions = data.filter((d: any) => d.pay_code == 'DED');
    const currentDate = new Date().toLocaleDateString('en-GB');
    let MonthName = this.monthList.filter((item: any) => item.value == employee.month)[0]
    const grossSalary = earnings.reduce((sum: any, e: any) => sum + parseFloat(e.finalAmount), 0);
    const totalDeductions = deductions.reduce((sum: any, d: any) => sum + parseFloat(d.finalAmount), 0);
    const netSalary = grossSalary - totalDeductions;
    const logoBase64 = await this.getBase64ImageFromURL('assets/img/logo/logo-quaere.png');
    // Employee Details block

    const employeeHeadingTable: any = {
      style: 'tableExample',
      table: {
        widths: ['50%', '50%'],
        body: [
          [
            { text: 'Employee Details', fontSize: 10, padding: 15 },
            {
              columns: [
                { text: 'Net Pay', fontSize: 10, padding: 15 },
                { text: `${this.currency?.name} ${netSalary.toFixed(2)}`, fontSize: 10, alignment: 'right', color: '#005495', padding: 15, bold: true }
              ]
            },

            // { text: `Net Pay: $${netSalary.toFixed(2)}`, alignment: 'right' }
          ],

        ]
      },
      layout: {
        hLineWidth: function (i: number, node: any) {
          return 1; // horizontal line thickness
        },
        vLineWidth: function (i: number, node: any) {
          return 1; // vertical line thickness
        },
        hLineColor: function (i: number, node: any) {
          return '#000'; // black horizontal lines
        },
        vLineColor: function (i: number, node: any) {
          return '#000'; // black vertical lines
        },
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      margin: [0, 0, 0, 10]

    };

    // Employee Details block
    const employeeDetailsTable: any = {
      style: 'tableExample',
      table: {
        widths: ['50%', '50%'],
        body: [
          [
            { text: `Month : ${MonthName?.label || 'NA'}` },
            { text: `Year : ${employee?.year}` }
          ],
          [
            { text: `Employee Name : ${employee?.employeeName || 'NA'}` },
            { text: `Department : ${employee?.department || 'NA'}` }
          ],

          [
            { text: `Employee Code : ${employee?.empCode || 'NA'}` },
            { text: `E-mail ID : ${employee?.email || 'NA'}` }
          ],
          // [
          //   { text: `IFSC Code : ${employee?.ifscCode || 'NA'}` },
          //   { text: `Bank Account No. : ${employee?.bankAccount || 'NA'}` }
          // ],

          [
            { text: `Contact No : ${employee?.phone || 'NA'}` },
            { text: `Pay Period : ${currentDate}` }
          ],
          [
            { text: `UAN No.: ${employee?.uan_no || 'NA'}` },
            { text: `ESIC No. : ${employee?.esic_no || 'NA'}` }
          ],
          [
            { text: `Designation : ${employee?.designation || 'NA'}` },
            { text: '' }
          ],

        ]
      },
      layout: {
        hLineWidth: function (i: number, node: any) {
          return 1; // horizontal line thickness
        },
        vLineWidth: function (i: number, node: any) {
          return 1; // vertical line thickness
        },
        hLineColor: function (i: number, node: any) {
          return '#000'; // black horizontal lines
        },
        vLineColor: function (i: number, node: any) {
          return '#000'; // black vertical lines
        },
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      margin: [0, 0, 0, 5]

    };


    const maxRows = Math.max(earnings.length, deductions.length);
    const tableBody: any[] = [
      [
        { text: 'Earnings', style: 'tableHeader' },
        { text: 'Amount', style: 'tableAmountHeader' },
        { text: 'Deductions', style: 'tableHeader' },
        { text: 'Amount', style: 'tableAmountHeader' }
      ]
    ];

    for (let i = 0; i < maxRows; i++) {
      const earning = earnings[i];
      const deduction = deductions[i];
      tableBody.push([
        earning ? { text: earning.name } : '',
        earning ? { text: earning.finalAmount, alignment: 'right' } : '',
        deduction ? { text: deduction.name } : '',
        deduction ? { text: deduction.finalAmount, alignment: 'right' } : ''
      ]);
    }

    tableBody.push([
      { text: 'Gross Salary', bold: true },
      { text: `${this.currency.name} ${grossSalary.toFixed(2)}`, bold: true, alignment: 'right' },
      { text: 'Total Deductions', bold: true },
      { text: `${this.currency.name} ${totalDeductions.toFixed(2)}`, bold: true, alignment: 'right' }
    ]);

    tableBody.push([
      { text: ``, colSpan: 2, italics: true, alignment: 'left', fillColor: '#f0f0f0' },
      {},
      { text: 'NET Salary', bold: true, fillColor: '#f0f0f0' },
      { text: `${this.currency.name} ${netSalary.toFixed(2)}`, bold: true, alignment: 'right', fillColor: '#f0f0f0' }
    ]);
    tableBody.push([
      {
        colSpan: 4,
        alignment: 'left',
        italics: true
        , fillColor: '#f0f0f0',

        stack: [
          {
            columns: [
              { text: 'NET Salary (In Words):', bold: true, alignment: 'left', italics: true },
              { text: this.convertNumberToWords(netSalary).toUpperCase(), alignment: 'right', bold: true, italics: true }
            ]
          }
        ]
      }, {}, {}, {}
    ]);


    const docDefinition: any = {
      content: [
        {
          image: logoBase64,
          width: 140,

          alignment: 'left',
        },
        {
          columns: [
            { text: 'Quaere eTechnologies Pvt. Ltd.', style: 'header' },
            { text: 'PAY SLIP', bold: true, alignment: 'right', fontWeight: 600, color: '#005495' }
          ]
        },
        // { text: 'Quaere eTechnologies Pvt. Ltd.', style: 'header' },
        { text: 'www.quaeretech.com | +91-522 406 7760', alignment: 'left', fontSize: 10, noWrap: true },
        { text: '7th Floor, Cyber Tower, Pickup Road, Vibhuti Khand, Gomti Nagar, Lucknow-226010', alignment: 'left', fontSize: 10, margin: [0, 0, 0, 10] },
        // { text: `Payslip for the month of ${MonthName?.label} , ${employee?.year}`, alignment: 'center', bold: true, fontSize: 14, margin: [0, 0, 0, 10] },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
          ],
          margin: [0, 0, 0, 10]
        },
        // { text: 'SALARY SLIP', style: 'title' },
        employeeHeadingTable,

        employeeDetailsTable,

        {
          style: 'tableExample',
          table: {
            widths: ['*', 'auto', '*', 'auto'],
            body: tableBody
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#f2f2f2' : null,
            hLineColor: () => '#000',
            vLineColor: () => '#000',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
          }
        },

        // {
        //   columns: [
        //     { text: 'Employee Signature', alignment: 'left', margin: [40, 60, 0, 0] },
        //     { text: 'Employer Signature', alignment: 'right', margin: [0, 60, 40, 0] }
        //   ]
        // }
      ],
      styles: {
        header: { fontSize: 10, fontWeight: 500, alignment: 'left', margin: [0, 0, 0, 0] },
        title: { fontSize: 12, fontWeight: 400, alignment: 'right', margin: [0, 0, 0, 15], decoration: 'underline' },
        tableExample: { margin: [0, 5, 0, 15], fontSize: 10, padding: 15 },
        tableHeader: { fontSize: 12, fontWeight: 400, fillColor: '#f0f0f0', padding: 15 },
        tableAmountHeader: { fontSize: 12, fontWeight: 400, alignment: 'right', fillColor: '#f0f0f0', padding: 15 },

      }
    };
    // pdfMake.createPdf(docDefinition).download(`salary_slip_${employee.employeeId}_${salaryData[0].month}_${salaryData[0].year}.pdf`); // direct download

    pdfMake.createPdf(docDefinition).download(`pay_slip_${employee.empCode}_${employee.employeeName}_${MonthName.label}_${employee.year}.pdf`);
  }








  convertNumberToWords(amount: number): string {
    if (amount === 0) return 'zero';
    const a = [
      '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const numToWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    };
    return numToWords(Math.floor(amount));
  }

}
