import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SearchPaginationComponent } from '../../../master/search-pagination/search-pagination.component';
import { Router } from '@angular/router';
import { Notyf } from 'notyf';
import { JobService } from '../../../services/job.service';
import { MessagingService } from '../../../services/messaging.service';
import { StatusService } from '../../../services/status.service';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

declare let bootstrap: any;
@Component({
  selector: 'app-posting-sourcing',
  imports: [NgSelectModule,
    FormsModule, CommonModule, SearchPaginationComponent, RouterModule],
  templateUrl: './posting-sourcing.component.html',
  styleUrl: './posting-sourcing.component.css'
})
export class PostingSourcingComponent {
  notyf: Notyf;
  EmployeeForm!: FormGroup;
  EmployeeList = [];
  editingId: number | null = null;
  minDate: any
  constructor(
    public jobService: JobService,
    private router: Router,
    public messagingService: MessagingService,
    public statusService: StatusService,
    private jobSvc: JobService,

  ) {

    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // today
    this.notyf = new Notyf();
  }
  channels = [
    { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
    { id: 'naukri', label: 'Naukri', color: '#FF7555' },
    { id: 'referral', label: 'Referral email', color: '#22c55e' },
    { id: 'campus', label: 'Campus drive', color: '#8b5cf6' },
    { id: 'job_board', label: 'Job board', color: '#f59e0b' },
    { id: 'direct', label: 'Careers page', color: '#6b7280' },
  ];


  expireDays = [
    { value: '14', label: '14 days' },
    { value: '21', label: '21 days' },
    { value: '30', label: '30 days' },
    { value: '0', label: 'No expiry' },
  ];

  job: any | null = null;
  generating = false;
  generatedUrl = '';
  token = '';
  expiresAt: Date | null = null;
  copied: Record<string, boolean> = {};

  pageSize = 10;
  currentPage = 1;
  searchTerm = '';
  itemsPerPage = 10;
  modal: any
  // view(item: any) {


  //   if (!this.modal) {
  //     const modalEl = document.getElementById('SalaryModal');
  //     this.modal = new bootstrap.Modal(modalEl);
  //   }
  //   this.modal.show();
  // }

  publish(data: any,status:any) {
    let Enable;


    Swal.fire({
      title: "Are you sure?",
      text: `Do you Want to Publish this`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes,  ${status == 'open' ? 'Publish' : 'Close'}  it!`,
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.OpenJob(data,status);
      } else if (result.dismiss === Swal.DismissReason.cancel) {

      }
    });



  }
  OpenJob(data: any,status:any) {


    let obj = Object.assign({}, data)

    const payload={
      id:obj.id,
      status:status
    }
    this.jobService.PublishJob(payload).subscribe(
      (response) => {
        console.log('Employee deleted successfully:', response);
        if (response && response.status === true) {
          this.getJobRequirementList();
          this.notyf.success(response.message || 'Employee deleted successfully');
        }
        else if (response && response.status == false) {
          this.notyf.error(response.message || 'Failed to delete employee');
        }
        else {
          this.notyf.error('Failed to delete employee');
        }

      },
      (error) => {
        console.error('Error deleting employee:', error);
        this.notyf.error('Failed to delete employee');
      }
    )
  }
  onSearch(term: string) {
    if (!term) {
      this.searchText = ''
      this.getJobRequirementList()
    } else {
      this.searchTerm = term.toLowerCase();
      this.currentPage = 1;
      // this.applyFilters();
    }

    // this.loadEmployees()
  }


  onPageChange(page: number) {
    this.currentPage = page;
    // this.applyFilters();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    // this.applyFilters();
  }
  filteredDesignation: any = []
  searchText: any = ''

  async ngOnInit() {
    await this.getJobRequirementList()

  }

  JobRequirementsList: any = []
  originalList: any = []
  jobs: any = []
  obj: any = {}
  // filteredDesignation:any = []
  async getJobRequirementList() {
    this.JobRequirementsList = []
    this.originalList = []
    this.jobs = []
    this.filteredDesignation = []
    this.jobService.getJobRequirements().subscribe({
      next: (response: any) => {
        console.log('response', response);

        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);

        if (status == true) {


          // this.notyf.success(message)
          this.JobRequirementsList = response.data
          this.jobs = response.data
          this.originalList = response.data
          // pagination
          const start = (this.currentPage - 1) * this.pageSize;
          const end = start + this.pageSize;
          this.filteredDesignation = this.JobRequirementsList.slice(start, end);
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

  buildChannelUrl(channel: string): string {
    return this.generatedUrl + `&utm_source=${channel}`;
  }

  // setOpen() {
  //   if (!this.job) return;
  //   this.jobSvc.update(this.job.id, { ...this.job, status: 'open' })
  //     .subscribe(j => this.job = j);
  // }

  copy(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => { });
    this.copied[key] = true;
    setTimeout(() => this.copied[key] = false, 2000);
  }

  generate() {
    if (!this.job) return;
    this.generating = true;
    // Call backend endpoint POST /api/v1/jobs/:id/generate-link
    // For demo we construct locally; replace with HTTP call in production
    const token = btoa(this.job.id + ':' + Date.now()).replace(/=/g, '').substring(0, 24);
    const slug = this.obj.slug || this.job.title.toLowerCase().replace(/\s+/g, '-');
    this.token = token;
    this.generatedUrl = `${this.obj.baseUrl.replace(/\/+$/, '')}/${slug}?job_id=${this.job.id}&token=${token}`;
    if (this.obj.expiresDays) {
      this.expiresAt = new Date(Date.now() + Number(this.obj.expiresDays) * 86400000);
    }
    this.generating = false;

    /* Production version — uncomment and remove the lines above:
    this.jobSvc.generateLink(this.job.id, this.config.baseUrl, this.config.expiresDays)
      .subscribe(res => {
        this.generatedUrl = res.url;
        this.token        = res.token;
        this.expiresAt    = res.expires ? new Date(res.expires) : null;
        this.generating   = false;
      });
    */
  }
}
