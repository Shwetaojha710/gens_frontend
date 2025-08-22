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
  selector: 'app-holiday-type',
  imports: [NgSelectModule,
    FormsModule, CommonModule],
  templateUrl: './holiday-type.component.html',
  styleUrl: './holiday-type.component.css'
})

export class HolidayTypeComponent {
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
  HolidayTypeForm!: FormGroup;
  HolidayTypeList = [];
  editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private master: MasterService,
    public statusService: StatusService,
    private router: Router,
  ) {
    this.HolidayTypeForm = this.fb.group({
      name: ['', Validators.required],
      status: ['', [Validators.required]]
    });

    this.notyf = new Notyf();
  }

  async ngOnInit() {
    this.HolidayTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    await this.fetchHolidayType();
  }
  getStatusClass(status: any): string {
    switch (status) {
      case 'pending': return 'bg-light-warning';
      case 'cancelled': return 'bg-light-danger';
      case 'completed': return 'bg-light-success';
      default: return 'bg-light-secondary';
    }
  }

  async fetchHolidayType() {
    this.HolidayTypeList = []
    this.master.getHolidayType().subscribe(data => {
      if (data['status'] == true) {
        this.notyf.success(data['message']);
        this.HolidayTypeList = data.data;
      } else {
        this.notyf.error(data['message']);
      }
    });


  }

  onSubmit() {
    if (!ValidationUtil.showRequiredError('Employment Type', this.obj.name, this.notyf)) {
      return;
    }


    this.master.addHolidayType(this.obj).subscribe({
      next: (response: any) => {
        console.log('response', response);

        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);

        if (status === true) {

          this.notyf.success(message)
          this.fetchHolidayType();
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
        this.notyf.error(err.error?.message)
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
    this.master.updateHolidayType(this.editingId, this.obj).subscribe({
      next: (response: any) => {
        console.log('response', response);
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);
        if (status === true) {
          this.notyf.success(message)
          this.fetchHolidayType();
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
        this.notyf.error(err.error.message)
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
        this.deleteHolidayType(data)
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
  deleteHolidayType(data:any){
       this.master.deleteHolidayType(data).subscribe({
      next: (response: any) => {
        console.log('response', response);
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);
        if (status === true) {
          this.notyf.success(message)
          this.fetchHolidayType();
        }
        else if (status === "expired") {
          this.router.navigate(["login"]);
        }
        else {
          this.notyf.error(message)
        }
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.notyf.error(err.error.message)
      }

    })
  }

  resetForm() {
    this.createFlag = false
    this.obj = {}
    this.editingId = null;
  }
  isInvalid(field: string): boolean {
    const control = this.HolidayTypeForm.get(field);
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
