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
  tenant: any = {};
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
    this.tenant = JSON.parse(localStorage.getItem('tenant') || '{}');
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
  selectedJob: any | null = null;

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

  getNormalizedStatus(status: string): string {
    const normalizedStatus = (status || '').toLowerCase();
    return normalizedStatus === 'closed' ? 'close' : normalizedStatus;
  }

  getStatusLabel(status: string): string {
    const normalizedStatus = this.getNormalizedStatus(status);

    switch (normalizedStatus) {
      case 'open':
        return 'Open';
      case 'close':
        return 'Closed';
      case 'draft':
        return 'Draft';
      default:
        return status || '-';
    }
  }

  getStatusBadgeClass(status: string): string {
    const normalizedStatus = this.getNormalizedStatus(status);

    switch (normalizedStatus) {
      case 'open':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'close':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'draft':
      default:
        return 'bg-warning-subtle text-warning border border-warning-subtle';
    }
  }

  getCardBorderClass(status: string): string {
    const normalizedStatus = this.getNormalizedStatus(status);

    switch (normalizedStatus) {
      case 'open':
        return 'border-success';
      case 'close':
        return 'border-danger';
      case 'draft':
      default:
        return 'border-warning';
    }
  }

  canPublish(item: any): boolean {
    return this.getNormalizedStatus(item?.status) !== 'open';
  }

  canClose(item: any): boolean {
    return this.getNormalizedStatus(item?.status) === 'open';
  }

  getSkillsList(skills: any): string[] {
    if (Array.isArray(skills)) {
      return skills.filter(Boolean);
    }

    if (typeof skills === 'string' && skills.trim()) {
      return skills
        .split(',')
        .map((skill: string) => skill.trim())
        .filter(Boolean);
    }

    return [];
  }

  viewDetails(item: any): void {
    this.selectedJob = item;
  }

  getPostedAgoLabel(value: any): string {
    if (!value) return 'Recently posted';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Recently posted';

    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays <= 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  }

  getUpdatedAgoLabel(value: any): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  getApplicantCount(item: any): number {
    return Number(
      item?.applicantsCount ??
      item?.applicantCount ??
      item?.applicants ??
      item?.application_count ??
      item?.applicationsCount ??
      0
    ) || 0;
  }

  getSalaryLabel(item: any): string {
    const min = item?.min_salary ?? item?.salary_from ?? item?.salaryFrom;
    const max = item?.max_salary ?? item?.salary_to ?? item?.salaryTo;
    const fixed = item?.offered_salary ?? item?.offer_salary ?? item?.salary;

    if (min && max) return `${min} - ${max}`;
    if (fixed) return `${fixed}`;
    return item?.employment_type || '-';
  }

  getWorkLevelLabel(item: any): string {
    return item?.work_level || item?.seniority || item?.experience_level || '-';
  }

  getExperienceLabel(item: any): string {
    return item?.experience || item?.experience_required || item?.minimum_experience || '-';
  }

  getEmploymentTypeLabel(item: any): string {
    return item?.employment_type || item?.employee_type || item?.job_type || '-';
  }

  publish(data: any, status: any) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you Want to ${status == 'open' ? 'Publish' : 'Close'} this`,
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
  OpenJob(data: any, status: any) {
    let obj = Object.assign({}, data)

    const payload = {
      id: obj.id,
      status: status
    }
    this.jobService.PublishJob(payload).subscribe(
      (response) => {
        console.log('Employee deleted successfully:', response);
        if (response && response.status === true) {
          this.getJobRequirementList();
          this.notyf.success(response.message || `Job ${status === 'open' ? 'published' : 'closed'} successfully`);
        }
        else if (response && response.status == false) {
          this.notyf.error(response.message || `Failed to ${status === 'open' ? 'publish' : 'close'} job`);
        }
        else {
          this.notyf.error(`Failed to ${status === 'open' ? 'publish' : 'close'} job`);
        }

      },
      (error) => {
        console.error('Error deleting employee:', error);
        this.notyf.error(`Failed to ${status === 'open' ? 'publish' : 'close'} job`);
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
          this.selectedJob = this.jobs[0] || null;
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

  normalizeUrl(url: string): string {
    if (!url) return url;
    return url.replace(/([^:]\/)\/+/g, '$1');
  }

  copy(text: string, key: string) {
    text = this.normalizeUrl(text);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => this.fallbackCopy(text));
    } else {
      this.fallbackCopy(text);
    }
    this.copied[key] = true;
    setTimeout(() => this.copied[key] = false, 2000);
  }

  private fallbackCopy(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
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
