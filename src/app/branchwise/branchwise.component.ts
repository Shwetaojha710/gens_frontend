import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { MasterService } from '../services/master.service';
import { Notyf } from 'notyf';
import { ChartOptions } from '../dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-branchwise',
  imports: [FormsModule,NgSelectModule, CommonModule ],
  templateUrl: './branchwise.component.html',
  styleUrl: './branchwise.component.css'
})
export class BranchwiseComponent {

  notyf: Notyf = new Notyf();
  public chartOptions!: Partial<ChartOptions>;
  branchList: any
  obj: any = {};
  stats: any = []
  tenantDetails: any = {}
  updateFlag:any=false
  branchDt = [
    {
      "id": "98874c19-03c5-439c-8280-61a615b4983b",
      "name": "X-Y-Z",
      "description": "Central administration and monitoring access."
    },
    {
      "id": "98874c19-03c5-439c-8280-61a615b4983b",
      "name": "A-B-C",
      "description": "Central administration and monitoring access."
    },
    {
      "id": "98874c19-03c5-439c-8280-61a615b4983b",
      "name": "D-E-F",
      "description": "Central administration and monitoring access."
    }
  ]
  baseurl: any;
  constructor(private dashboardService: DashboardService, private router: Router, public masterService: MasterService) {
    this.baseurl = this.masterService.getBaseUrl();
    this.getBranchDD()
    this.tenantDetails = JSON.parse(localStorage.getItem('tenant') || '{}');
    this.tenantDetails.image = `${this.baseurl}${this.tenantDetails['image']}`

  }

  employeeList: any = []
  getEmployeeList() {
    this.branchList = []
    this.employeeList = []
    this.masterService.AppEmpList().subscribe((res) => {
      if (res.status == true) {
        this.notyf.success(res.message || 'Dashboard data loaded successfully')
        this.stats = res.data.stats;
        this.employeeList = res.data
      } else if (res.status == 'expired') {
        this.router.navigate(['login'])
      } else {
        this.notyf.error(res.message || 'Something went wrong')
      }
    });
  }

  cardData: any = {}

createFlag = false;
  create() {
    this.createFlag = true;
  }

  getBranchDD() {
    this.branchList = []
    this.masterService.BranchDD().subscribe((res) => {
      if (res.status == true) {
        this.notyf.success(res.message || 'Dashboard data loaded successfully')
        this.stats = res.data.stats;
        if (res.data.length <= 2) {
          this.branchList = [...res.data, ...this.branchDt].slice(0, 3);
        } else {
          this.branchList = res.data
        }
      } else if (res.status == 'expired') {
        this.router.navigate(['login'])
      } else {
        this.notyf.error(res.message || 'Something went wrong')
      }
    });
  }

  goToDashboard(branch: any) {
    // store branch id (important for future APIs)
    localStorage.setItem('branchId', branch.id);

    // redirect to dashboard
    this.router.navigate(['/layout/dashboard']);
  }

  getStatusClass(status: any): string {
    switch (status) {
      case true: return 'badge-outline-success';
      case false: return 'badge-outline-danger';
      case 'completed': return 'bg-light-success';
      default: return 'bg-light-secondary';
    }
  }


  filteredDesignation: any = []
  searchText: any = ''
  originalList: any = []
    getUserStatusClass(status: any): string {
    switch (status) {
      case 'active': return 'badge-outline-success';
      case 'inactive': return 'badge-outline-danger';
      case 'completed': return 'bg-light-success';
      default: return 'bg-light-secondary';
    }
  }

  gotoList(){
    this.router.navigate(['pending-emp-list']);
  }

  gotoback(){
    this.router.navigate(['landing-home']);
  }

}
