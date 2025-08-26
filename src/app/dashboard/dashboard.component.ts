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
        height: 300
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
          "UI/UX Designer",
          "React Developer",
          "Dot Net Developer",
          "AI/ML Developer",
          "Application Tester",
          "Sales",
          "HR Management",
          "BDE",
          "Frontend Developer",
          "Trainee"
        ]
      },
      colors: [
        "#FF5733", "#33FF57", "#3357FF", "#F39C12", "#8E44AD",
        "#2ECC71", "#E74C3C", "#3498DB", "#9B59B6", "#34495E"
      ]
    };
  }
}
