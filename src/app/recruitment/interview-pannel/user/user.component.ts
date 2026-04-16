import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Notyf } from 'notyf';
import Swal from 'sweetalert2';
import { InterviewService } from '../../../services/interview.service';
import { MasterService } from '../../../services/master.service';
import { StatusService } from '../../../services/status.service';
import { SearchPaginationComponent } from '../../../master/search-pagination/search-pagination.component';
import { InterviewPanelUser } from '../../recruitment.models';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, SearchPaginationComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  notyf = new Notyf();

  obj: Partial<InterviewPanelUser> = {};

  createFlag = false;
  updateFlag = false;

  userList: InterviewPanelUser[] = [];
  originalList: InterviewPanelUser[] = [];

  departments: any[] = [];
  designations: any[] = [];

  statusOptions = [
    { value: 'active', label: 'ACTIVE' },
    { value: 'inactive', label: 'INACTIVE' }
  ];

  genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  constructor(
    private interviewService: InterviewService,
    private masterService: MasterService,
    public statusService: StatusService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    // this.loadDesignations();
    this.fetchUsers();
  }

  loadDepartments(): void {
    this.masterService.Departmentsdd({}).subscribe({
      next: (res: any) => {
        if (res.status === true) this.departments = res.data;
      }
    });
  }

  loadDesignations(departmentId: any): void {
    this.obj['designation']=undefined
     let NewObj: any = {}
    NewObj['department'] = departmentId?.value || departmentId
    this.masterService.designationDD(NewObj).subscribe({
      next: (res: any) => {
        if (res.status === true) this.designations = res.data;
      }
    });
  }

  //   designationDD: any = []
  // getDesignation(departmentId: any) {
  //   this.designationDD = []
  //   let obj: any = {}
  //   obj['department'] = departmentId?.value || departmentId
  //   this.master.designationDD(obj).subscribe({
  //     next: (response: any) => {
  //       console.log('response', response);

  //       let message = response.message ? response.message : 'Data found Successfully';

  //       if (response.status === true) {
  //         this.designationDD = response.data;

  //       }
  //       else if (response.status == "expired") {
  //         this.router.navigate(["login"]);
  //       }

  //       else {
  //         this.notyf.error(message)
  //       }

  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       this.notyf.error(err)
  //     }
  //   });
  // }

  fetchUsers(): void {
    this.interviewService.listInterviewPanelUsers().subscribe({
      next: (res) => {
        if (res.status === true) {
          this.userList = res.data;
          this.originalList = [...res.data];
        } else {
          this.notyf.error('Failed to load panel users');
        }
      },
      error: (err) => this.notyf.error(err?.error?.message || 'Error loading users')
    });
  }

  opencreate(): void {
    this.obj = {};
    this.createFlag = true;
    this.updateFlag = false;
  }

  back(): void {
    this.obj = {};
    this.createFlag = false;
    this.updateFlag = false;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.interviewService.createInterviewPanelUser(this.obj as InterviewPanelUser).subscribe({
      next: (res: any) => {
        const message = res.message || 'User added successfully';
        const status = this.statusService.handleResponseStatus(res.status, message);
        if (status == true) {
          this.notyf.success(message);
          this.fetchUsers();
          this.back();
        } else if (status == 'expired') {
          this.router.navigate(['login']);
        } else {
          this.notyf.error(message);
        }
      },
      error: (err) => this.notyf.error(err?.error?.message || 'Error saving user')
    });
  }

  edit(item: InterviewPanelUser): void {
    this.obj = { ...item };
    this.createFlag = true;
    this.updateFlag = true;
  }

  updateData(): void {
    if (!this.isFormValid()) return;

    this.interviewService.updateInterviewPanelUser(this.obj as InterviewPanelUser).subscribe({
      next: (res: any) => {
        const message = res.message || 'User updated successfully';
        const status = this.statusService.handleResponseStatus(res.status, message);
        if (status === true) {
          this.notyf.success(message);
          this.fetchUsers();
          this.back();
        } else if (status === 'expired') {
          this.router.navigate(['login']);
        } else {
          this.notyf.error(message);
        }
      },
      error: (err) => this.notyf.error(err?.error?.message || 'Error updating user')
    });
  }

  delete(item: InterviewPanelUser): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this panel user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.interviewService.deleteInterviewPanelUser({ id: item.id! }).subscribe({
          next: (res: any) => {
            const message = res.message || 'User deleted';
            const status = this.statusService.handleResponseStatus(res.status, message);
            if (status === true) {
              this.notyf.success(message);
              this.fetchUsers();
            } else if (status === 'expired') {
              this.router.navigate(['login']);
            } else {
              this.notyf.error(message);
            }
          },
          error: (err) => this.notyf.error(err?.error?.message || 'Error deleting user')
        });
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase().trim();
    this.currentPage = 1;
    if (this.searchTerm === '') {
      this.userList = [...this.originalList];
    } else {
      this.userList = this.originalList.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(this.searchTerm)
      );
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  getStatusClass(status: string): string {
    return status === 'active' ? 'badge-outline-success' : 'badge-outline-danger';
  }

  private isFormValid(): boolean {
    if (!this.obj.first_name?.trim()) {
      this.notyf.error('First name is required');
      return false;
    }
    if (!this.obj.last_name?.trim()) {
      this.notyf.error('Last name is required');
      return false;
    }
    if (!this.obj.email?.trim()) {
      this.notyf.error('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.obj.email.trim())) {
      this.notyf.error('Please enter a valid email address');
      return false;
    }
    if (!this.obj.mobile_no?.trim()) {
      this.notyf.error('Mobile number is required');
      return false;
    }
    const mobileRegex = /^[6-9][0-9]{9}$/;
    if (!mobileRegex.test(this.obj.mobile_no.trim())) {
      this.notyf.error('Mobile number must be 10 digits and start with 6, 7, 8, or 9');
      return false;
    }
    if (!this.obj.department) {
      this.notyf.error('Department is required');
      return false;
    }
    if (!this.obj.designation) {
      this.notyf.error('Designation is required');
      return false;
    }
    return true;
  }
}
