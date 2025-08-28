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
  imports: [RouterModule, NgApexchartsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  @ViewChild("chart") chart: ChartComponent | undefined;
  notyf: Notyf = new Notyf();
  public chartOptions!: Partial<ChartOptions>;

  constructor(private dashboardService: DashboardService, private router: Router,public masterService:MasterService) {
    // this.chartOptions = {
    //   series: [
    //     {
    //       name: "basic",
    //       data: [2, 5, 4, 3, 1, 2, 3, 11, 12, 10]
    //     }
    //   ],
    //   chart: {
    //     type: "bar",
    //     height: 300
    //   },
    //   plotOptions: {
    //     bar: {
    //       horizontal: true,
    //       distributed: true  // ✅ Each bar gets its own color
    //     }
    //   },
    //   dataLabels: {
    //     enabled: false
    //   },
    //   xaxis: {
    //     categories: [
    //       "UI/UX Designer",
    //       "React Developer",
    //       "Dot Net Developer",
    //       "AI/ML Developer",
    //       "Application Tester",
    //       "Sales",
    //       "HR Management",
    //       "BDE",
    //       "Frontend Developer",
    //       "Trainee"
    //     ]
    //   },
    //   colors: [
    //     "#FF5733", "#33FF57", "#3357FF", "#F39C12", "#8E44AD",
    //     "#2ECC71", "#E74C3C", "#3498DB", "#9B59B6", "#34495E"
    //   ]
    // };
  }
  stats: any = []
  employeeList: any = []
  holidayList: any = []
  leaveList: any = []
  baseurl: any;
  Event: any = []

//   constructor() {
//     this.chartOptions = {
//       series: [
//         {
//           name: "basic",
//           data: [2, 5, 4, 3, 1, 2, 3, 11, 12, 10]
//         }
//       ],
//       chart: {
//         type: "bar",
//         height: 320
//       },
//       plotOptions: {
//         bar: {
//           horizontal: true,
//           distributed: true  // ✅ Each bar gets its own color
//         }
//       },
//       dataLabels: {
//         enabled: false
//       },
//       xaxis: {
//         categories: [
//           "UI/UX",
//           "Development",
//           "Management",
//           "HR",
//           "Testing",
//           "Marketing",
         
//         ]
//       },
//       colors: [
//         "#154D71", "#005890", "#3357FF", "#1c6ea4",
//         "#33a1e0","#3498DB",
//       ]
//     };


  ngOnInit(): void {
    // this.baseurl = localStorage.getItem('base_url')?.replace(/["\\,]/g, '') || '';
    this.baseurl = this.masterService.getBaseUrl();

    this.stats = []
    this.Event = []
    this.employeeList = []
    this.chartOptions = {}
    this.holidayList = []
    this.leaveList = []
    this.dashboardService.getDashboardData().subscribe((res) => {
      if (res.status == true) {
        this.notyf.success(res.message || 'Dashboard data loaded successfully')
        this.stats = res.data.stats;
        this.chartOptions = res.data.chartOptions
        this.employeeList = res.data.employees
        this.leaveList = res.data.leaves
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

}
