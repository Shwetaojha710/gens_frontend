import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { Notyf } from 'notyf';
import Swal from 'sweetalert2';
import { MasterService } from '../../services/master.service';
import { StatusService } from '../../services/status.service';
import { ValidationUtil } from '../../shared/utils/validation.util';

@Component({
  selector: 'app-branch',
  imports: [NgSelectModule,
    FormsModule, CommonModule],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.css'
})

export class BranchComponent {
  obj: any = {}
  notyf: Notyf;

  back() {
    this.obj = {}
    this.createFlag = false

  }
  status: any = [{ value: 'active', label: 'ACTIVE' }, { value: 'inactive', label: 'INACTIVE' }]

  // onSubmit() {
  //    console.log(this.obj)
  // }
  BranchForm!: FormGroup;
  BranchList: any[] = [];
  editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private BranchService: MasterService,
    public statusService: StatusService,
    private router: Router,
  ) {
    this.BranchForm = this.fb.group({
      name: ['', Validators.required],
      status: ['', [Validators.required]]
    });

    this.notyf = new Notyf();
  }
  searchText: any = '';
  async ngOnInit() {
    this.BranchForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    await this.fetchBranchs();
  }
  applyFilter(event: any) {
    const value = event?.target?.value || '';
    this.searchText = value.trim();

    if (this.searchText === '') {
      this.BranchList = [...this.originalList];
    } else {
      this.BranchList = this.originalList.filter((item: any) =>
        JSON.stringify(item).toLowerCase().includes(this.searchText.toLowerCase())
      );
    }


  }
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
  onItemsPerPageChange(event: any) {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1; // Reset to first page
    this.fetchBranchs();
  }
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchBranchs();
  }
  getStatusClass(status: any): string {
    switch (status) {
      case 'active': return 'badge-outline-success';
      case 'inactive': return 'badge-outline-danger';
      case 'completed': return 'bg-light-success';
      default: return 'bg-light-secondary';
    }
  }
  originalList: any[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  async fetchBranchs() {
    this.BranchList = []
    this.originalList = []
    this.BranchService.getBranchs().subscribe(data => {
      if (data['status'] == true) {
        // this.notyf.success(data['message']);
        this.BranchList = data.data;
        this.originalList = this.BranchList
      } else {
        this.notyf.error(data['message']);
      }
    });


  }

  onSubmit() {
    if (!ValidationUtil.showRequiredError('Branch name', this.obj.name, this.notyf)) {
      return;
    }


    this.BranchService.addBranch(this.obj).subscribe({
      next: (response: any) => {
        console.log('response', response);

        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);

        if (status === true) {

          this.notyf.success(message)
          this.fetchBranchs();
          this.resetForm();
        }
        else if (status === "expired") {
            this.router.navigate(["login"]);
        }

        else {
          this.notyf.error(message)
        }

      },
      error: (err) => {
        console.error('Error:', err);
        this.notyf.error(err)
      }
    });

  }

  update(dept: any) {
    this.obj = Object.assign({}, dept)
    this.editingId = this.obj.id;
    this.createFlag = true
    this.updateFlag = true
  }
  updatedata() {
    this.BranchService.updateBranch(this.editingId, this.obj).subscribe({
      next: (response: any) => {
        console.log('response', response);
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);
        if (status === true) {
          this.notyf.success(message)
          this.fetchBranchs();
          this.resetForm();
        }
        else if (status === "expired") {
            this.router.navigate(["login"]);
        }
        else {
          this.notyf.error(message)
        }
      },
      error: (err) => {
        console.error('Error:', err);
        let ErrorMessage= err?.error?.message?err?.error?.message:err?.message
        this.notyf.error(ErrorMessage)
      }



    })

  }

  delete(data: number) {

    Swal.fire({
      title: "Are you sure?",
      text: "Do you Want to Delete this",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteBranch(data)
        // Swal.fire({
        //   title: "Deleted!",
        //   text: "Your file has been deleted.",
        //   icon: "success"
        // });
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        // Swal.fire({
        //   title: "Cancelled",
        //   text: "Your imaginary file is safe :)",
        //   icon: "error"
        // });
      }
    });



  }
  deleteBranch(data: any) {
    this.BranchService.deleteBranch(data).subscribe({
      next: (response: any) => {
        console.log('response', response);
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);
        if (status === true) {
          this.notyf.success(message)
          this.fetchBranchs();
        }
        else if (status === "expired") {
            this.router.navigate(["login"]);
        }
        else {
          this.notyf.error(message)
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.notyf.error(err.message)
      }

    })
  }

  resetForm() {
    this.createFlag = false
    this.obj = {}
    this.editingId = null;
  }
  isInvalid(field: string): boolean {
    const control = this.BranchForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  createFlag: any = false
  listflag: any = true
  updateFlag: any = false
  opencreate() {
    this.obj = {}
    this.createFlag = true
    this.listflag = false
    this.updateFlag = false
  }



}
