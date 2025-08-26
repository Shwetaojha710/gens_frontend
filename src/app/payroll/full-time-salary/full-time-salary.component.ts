import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Notyf } from 'notyf';
import { MasterService } from '../../services/master.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PayrollService } from '../../services/payroll.service';
import { StatusService } from '../../services/status.service';
declare let bootstrap: any;
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-full-time-salary',
  imports: [NgSelectModule,
    FormsModule, CommonModule],
  templateUrl: './full-time-salary.component.html',
  styleUrl: './full-time-salary.component.css'
})


export class FullTimeSalaryComponent {
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
  yearList: any = [];
  notyf: Notyf;
  obj: any = {}
  constructor(private master: MasterService, private router: Router, private payroll: PayrollService, private statusService: StatusService) {
    this.notyf = new Notyf();
  }
  async ngOnInit() {
    await this.empList()
    await this.getYear();
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
  employeeSalaryData: any[] = [];

  async generate_Salary() {

    this.employeeSalaryData = [];

    const selectedEmployees = this.SalaryArr.filter((item: any) => item.isSelected);

    this.employeeSalaryData = await Promise.all(
      selectedEmployees.map(async (item: any) => {
        const components = await this.getSalaryComponent(item);
        return { ...item, components };
      })
    );
    this.isLoading = true
    try {
      const response: any = await firstValueFrom(
        this.payroll.generateSalary(this.employeeSalaryData)
      );
   this.isLoading = false
      if (this.statusService.handleResponseStatus(response.status, response.message || "Success")) {

        this.notyf.success(response.message);
      } else {
        this.isLoading = false
        this.notyf.error(response.message);
      }
    } catch (error: any) {
      this.isLoading = false
      console.error("API Error:", error);

      if (error.error?.message) {
        this.notyf.error(error.error.message);
      } else {
        this.notyf.error("Something went wrong!");
      }
    }
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
  onSubmit() {
    this.isLoading = true; // ✅ Show loader before API call
    this.SalaryArr = []
    let newObj = Object.assign({}, this.obj)
    if (newObj['employeeId'] === 'All') {
      newObj['employeeId'] = this.EmpList
        .map((item: any) => item.value)
        .filter((val: any) => val != 'All');
    } else {
      newObj['employeeId'] = [newObj['employeeId']]
    }

    this.payroll.calculateAttendance(newObj).subscribe({
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
          console.log(this.SalaryArr, "salary Array");

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
  view(item: any) {
    const obj = Object.assign({}, item)
    this.SalaryBreakup = []
    this.payroll.calculateSalaryComponent(obj).subscribe({
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
          this.PayArr = this.SalaryBreakup.filter((item: any) => item.pay_code == 'PAY')
          this.DedArr = this.SalaryBreakup.filter((item: any) => item.pay_code == 'DED')
          // Calculate totals
          const totalEarning = this.PayArr.reduce((sum: number, item: any) => sum + Number(item.pay_amount || 0), 0);
          const totalDeduction = this.DedArr.reduce((sum: number, item: any) => sum + Number(item.pay_amount || 0), 0);
          const netPay = totalEarning - totalDeduction;

          // Add as new keys
          this.PayArr = [...this.PayArr, { isSummary: true, name: 'Total Earnings',pay_amount: totalEarning }];
          this.DedArr = [...this.DedArr, { isSummary: true, name: 'Total Deductions',pay_amount: totalDeduction }];


          const modalEl = document.getElementById('SalaryModal');
          this.modal = new bootstrap.Modal(modalEl);
          this.modal.show();
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
  async getSalaryComponent(item: any) {
    const obj = { ...item };
    const response: any = await this.payroll.calculateSalaryComponent(obj).toPromise();

    if (this.statusService.handleResponseStatus(response.status, response.message || "Success")) {

      return response.data;
    } else {
      // throw new Error(response.message);
    }
  }

  delete(item: any) {

  }
  closeModal() {

    this.modal.hide();
  }
}
