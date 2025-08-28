import { Component, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HeaderComponent } from '../include/header/header.component';
import { RouterModule } from '@angular/router';
import { EmployeeComponent } from '../employee/employee.component';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  colors?: string[]; // ✅ Added optional colors property
};

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent, HeaderComponent, RouterModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  @ViewChild("chart") chart: ChartComponent | undefined;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "basic",
          data: [2, 5, 4, 3, 1, 2, 3, 11, 12, 10]
        }
      ],
      chart: {
        type: "bar",
        height: 320
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true  // ✅ Each bar gets its own color
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: [
          "UI/UX",
          "Development",
          "Management",
          "HR",
          "Testing",
          "Marketing",
         
        ]
      },
      colors: [
        "#154D71", "#005890", "#3357FF", "#1c6ea4",
        "#33a1e0","#3498DB",
      ]
    };
  }
}
