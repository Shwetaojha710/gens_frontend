import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MasterService } from '../../services/master.service';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { CommonModule } from '@angular/common';
import { StatusService } from '../../services/status.service';
import { Router } from '@angular/router';
import { ValidationUtil } from '../../shared/utils/validation.util';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-department',
  imports: [NgSelectModule,
    FormsModule, CommonModule],
  templateUrl: './department.component.html',
  styleUrl: './department.component.css'
})
export class DepartmentComponent {
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
  departmentForm!: FormGroup;
  departmentList = [];
  editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private departmentService: MasterService,
    public statusService: StatusService,
    private router: Router,
  ) {
    this.departmentForm = this.fb.group({
      name: ['', Validators.required],
      status: ['', [Validators.required]]
    });

    this.notyf = new Notyf();
  }

  async ngOnInit() {
    this.departmentForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    await this.fetchDepartments();
  }
  getStatusClass(status: any): string {
    switch (status) {
      case 'pending': return 'bg-light-warning';
      case 'cancelled': return 'bg-light-danger';
      case 'completed': return 'bg-light-success';
      default: return 'bg-light-secondary';
    }
  }

  async fetchDepartments() {
    this.departmentList = []
    this.departmentService.getDepartments().subscribe(data => {
      if (data['status'] == true) {
        this.notyf.success(data['message']);
        this.departmentList = data.data;
      } else {
        this.notyf.error(data['message']);
      }
    });


  }

  onSubmit() {
    if (!ValidationUtil.showRequiredError('Department name', this.obj.name, this.notyf)) {
      return;
    }


    this.departmentService.addDepartment(this.obj).subscribe({
      next: (response: any) => {
        console.log('response', response);

        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);

        if (status === true) {

          this.notyf.success(message)
          this.fetchDepartments();
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
    this.departmentService.updateDepartment(this.editingId, this.obj).subscribe({
      next: (response: any) => {
        console.log('response', response);
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);
        if (status === true) {
          this.notyf.success(message)
          this.fetchDepartments();
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
        this.deletedepartment(data)
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
  deletedepartment(data:any){
       this.departmentService.deleteDepartment(data).subscribe({
      next: (response: any) => {
        console.log('response', response);
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);
        if (status === true) {
          this.notyf.success(message)
          this.fetchDepartments();
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
    const control = this.departmentForm.get(field);
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
