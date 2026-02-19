import { Component, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HeaderComponent } from '../include/header/header.component';
import { Router, RouterModule } from '@angular/router';
import { EmployeeComponent } from '../employee/employee.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions
} from "ng-apexcharts";
import { DashboardService } from '../services/dashboard.service';
import { Notyf } from 'notyf';
import { MasterService } from '../services/master.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  colors?: string[];
};

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, NgApexchartsModule, CommonModule, NgSelectModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
[x: string]: any;
  @ViewChild("chart") chart: ChartComponent | undefined;
  notyf: Notyf = new Notyf();
  public chartOptions!: Partial<ChartOptions>;
  branchList: any
  obj: any = {};

  constructor(private dashboardService: DashboardService, private router: Router, public masterService: MasterService) {
    this.getBranchDD()
  }
  stats: any = []
  employeeList: any = []
  holidayList: any = []
  leaveList: any = []
  baseurl: any;
  Event: any = []
  onImageError(event: Event,data:any, imageType: string) {
    console.log(event.target);

    if (imageType == 'holidayImage') {
      const img = event.target as HTMLImageElement;
      img.src = 'assets/img/avatars/calendar.png';
      return;
    }
    else {
      const img = event.target as HTMLImageElement;
      img.src =data?.gender == "Male"?'assets/img/avatars/5.png': 'assets/img/avatars/4.png';
      return;
    }
    // if (imageType === 'profileImage') {

    // }
    // const img = event.target as HTMLImageElement;
    // img.src = 'assets/img/avatars/calendar.png';
  }


  leaveTypes: any = []

  ngOnInit(): void {

    // this.baseurl = localStorage.getItem('base_url')?.replace(/["\\,]/g, '') || '';
    this.baseurl = this.masterService.getBaseUrl();

    this.stats = []
    this.Event = []
    this.employeeList = []
    this.chartOptions = {}
    this.holidayList = []
    this.leaveList = []
    this.leaveTypes = []
    this.dashboardService.getDashboardData().subscribe((res) => {
      if (res.status == true) {
        this.notyf.success(res.message || 'Dashboard data loaded successfully')
        this.stats = res.data.stats;
        this.chartOptions = res.data.chartOptions
        this.employeeList = res.data.employees
        this.leaveList = res.data.leaves
        this.leaveTypes = res.data.leaveMasterList
        this.holidayList = res.data.holidays
        this.holidayList = this.holidayList.map((item: any) => {
          return {
            ...item,
            image: `${this.baseurl}/${item['image']}`
          }
        })
        this.Event = res.data
      } else if (res.status == 'expired') {
        this.router.navigate(['login'])
      } else {
        this.notyf.error(res.message || 'Something went wrong')
        this.stats = []
        this.Event = []
        this.employeeList = []
        this.chartOptions = {}
        this.holidayList = []
        this.leaveList = []

      }
    });

  }

  // branch(){
  //  localStorage.setItem('branchId', JSON.stringify(this.obj['branchId']));
  // }
  onBranchChange(branchId: any) {
    console.log('Selected Branch ID:', branchId);
    localStorage.setItem('branchId', branchId)
  }

  getBranchDD() {
    this.branchList = []
    this.masterService.BranchDD().subscribe((res) => {
      if (res.status == true) {
        this.notyf.success(res.message || 'Dashboard data loaded successfully')
        this.stats = res.data.stats;
        this.branchList = res.data
      } else if (res.status == 'expired') {
        this.router.navigate(['login'])
      } else {
        this.notyf.error(res.message || 'Something went wrong')
      }
    });
  }
}
