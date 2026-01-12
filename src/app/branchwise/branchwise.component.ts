import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { MasterService } from '../services/master.service';
import { Notyf } from 'notyf';
import { ChartOptions } from '../dashboard/dashboard.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-branchwise',
  imports: [CommonModule],
  templateUrl: './branchwise.component.html',
  styleUrl: './branchwise.component.css'
})
export class BranchwiseComponent {

    notyf: Notyf = new Notyf();
    public chartOptions!: Partial<ChartOptions>;
    branchList: any
    obj: any = {};
    stats:any = []
    User:any={}
  constructor(private dashboardService: DashboardService, private router: Router, public masterService: MasterService) {
     this.getBranchDD()
     this.User = JSON.parse(localStorage.getItem('tenant') || '{}');
  }
  DummyBranchData=[
  {
    "id": "4abc445c-01e7-40dd-9439-6a5ce8b2a8f6",
    "name": "XYZ",
    "description": "Central administration and monitoring access."
  }
]
  getBranchDD(){
    this.branchList=[]
    this.masterService.BranchDD().subscribe((res) => {
      if (res.status == true) {
        this.notyf.success(res.message || 'Dashboard data loaded successfully')
        this.stats = res.data.stats;
        if(res.data.length==0){
          this.branchList=this.DummyBranchData
        }else{
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



}
