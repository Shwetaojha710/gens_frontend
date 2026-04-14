import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { MasterService } from '../services/master.service';
import { LocationsService } from '../services/locations.service';
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
  allBranchList: any = []
  modalSearchText: string = ''
  modalFilteredBranches: any = []
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

  // Add branch modal state
  newBranch: any = {};
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  addBranchLoading = false;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    public masterService: MasterService,
    private locationService: LocationsService
  ) {
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
          this.allBranchList = [...res.data, ...this.branchDt];
          this.branchList = this.allBranchList.slice(0, 3);
        } else {
          this.allBranchList = res.data;
          this.branchList = res.data;
        }
        this.modalFilteredBranches = [...this.allBranchList];
      } else if (res.status == 'expired') {
        this.router.navigate(['login'])
      } else {
        this.notyf.error(res.message || 'Something went wrong')
      }
    });
  }

  searchModalBranches() {
    const text = this.modalSearchText.trim().toLowerCase();
    if (!text) {
      this.modalFilteredBranches = [...this.allBranchList];
    } else {
      this.modalFilteredBranches = this.allBranchList.filter((b: any) =>
        b.name?.toLowerCase().includes(text) || b.description?.toLowerCase().includes(text)
      );
    }
  }

  clearModalSearch() {
    this.modalSearchText = '';
    this.modalFilteredBranches = [...this.allBranchList];
  }

  openAddBranchModal() {
    this.newBranch = {};
    this.selectedImage = null;
    this.imagePreview = null;
    this.addBranchLoading = false;
  }

  fetchLocation() {
    this.locationService.getCurrentLocation()
      .then((res) => {
        this.newBranch['latitude'] = res.latitude;
        this.newBranch['longitude'] = res.longitude;
      })
      .catch(() => {
        this.notyf.error('Could not fetch location. Please enter manually.');
      });
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  submitNewBranch() {
    if (!this.newBranch['name']?.trim()) {
      this.notyf.error('Branch name is required.');
      return;
    }
    this.addBranchLoading = true;
    const formData = new FormData();
    formData.append('name', this.newBranch['name']);
    if (this.newBranch['description']) formData.append('description', this.newBranch['description']);
    if (this.newBranch['latitude']) formData.append('latitude', this.newBranch['latitude']);
    if (this.newBranch['longitude']) formData.append('longitude', this.newBranch['longitude']);
    if (this.selectedImage) formData.append('image', this.selectedImage);

    this.masterService.addBranchWithImage(formData).subscribe({
      next: (res: any) => {
        this.addBranchLoading = false;
        if (res.status === true) {
          this.notyf.success(res.message || 'Branch added successfully');
          this.getBranchDD();
          // close modal programmatically
          const btn = document.getElementById('closeAddBranchModal');
          if (btn) btn.click();
        } else if (res.status === 'expired') {
          this.router.navigate(['login']);
        } else {
          this.notyf.error(res.message || 'Something went wrong');
        }
      },
      error: (err: any) => {
        this.addBranchLoading = false;
        this.notyf.error(err?.error?.message || err?.message || 'Something went wrong');
      }
    });
  }

  goToDashboard(branch: any) {
    // store branch id (important for future APIs)
    localStorage.setItem('branchId', branch.id);
    console.log("reacheedd");

    // redirect to dashboard
    // this.router.navigate(['/layout/dashboard']);
    this.router.navigate(['landing-home']);
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
