import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Notyf } from 'notyf';
import Swal from 'sweetalert2';
import { MasterService } from '../../services/master.service';
import { StatusService } from '../../services/status.service';
import { ValidationUtil } from '../../shared/utils/validation.util';
import { AttendanceService } from '../../services/attendance.service';
import * as bootstrap from 'bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-holiday',
  imports: [NgSelectModule,
    FormsModule, CommonModule],
  templateUrl: './holiday.component.html',
  styleUrl: './holiday.component.css'
})

export class HolidayComponent {
  obj: any = {}
  notyf: Notyf;

  back() {
    this.obj = {}
    this.createFlag = false

  }
  status: any = [{ value: 'active', label: 'ACTIVE' }, { value: 'inactive', label: 'INACTIVE' }]
HolidayList: any = [];

  editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    public attendanceService: AttendanceService,
    public statusService: StatusService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {

    this.notyf = new Notyf();
  }
  baseurl: any;
  async ngOnInit() {
     this.baseurl = localStorage.getItem('base_url')?.replace(/["\\,]/g, '') || '';
    await this.fetchHoliday();
  }
  getStatusClass(status: any): string {
    switch (status) {
      case 'pending': return 'bg-light-warning';
      case 'cancelled': return 'bg-light-danger';
      case 'completed': return 'bg-light-success';
      default: return 'bg-light-secondary';
    }
  }

  async fetchHoliday() {
    this.HolidayList = []
    this.attendanceService.getHolidayList().subscribe(data => {
      if (data['status'] == true) {
        this.notyf.success(data['message']);

        this.HolidayList = data.data;
           for (let i = 0; i < this.HolidayList.length; i++) {
          this.HolidayList[i]['image'] = `${this.baseurl}/${this.HolidayList[i]['image']}`
        }
      } else {
        this.notyf.error(data['message']);
      }
    });


  }
    isFileInvalid: boolean = false;
  selectedFile: File | null = null;

sanitizedImage: any;


onFileChange(event: any) {
  const file = event.target.files[0];
  if (!file) {
    this.isFileInvalid = true;
    return;
  }else {
     this.isFileInvalid = false;
    this.selectedFile =event.target.files[0];
  }


  const reader = new FileReader();
  reader.onload = () => {
    const imageUrl = reader.result as string;
    this.sanitizedImage = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  };
  reader.readAsDataURL(file);
}
close(){
  this.sanitizedImage = null;
  this.selectedFile = null;
  this.isFileInvalid = false;
}

// onFileChange(event: Event): void {
//   const input = event.target as HTMLInputElement;

//   if (!input.files || input.files.length === 0) {
//     this.isFileInvalid = true;
//     this.selectedFile = null;
//     return;
//   }

//   this.selectedFile = input.files[0];
//   this.isFileInvalid = false;

//   const reader = new FileReader();
//   reader.readAsDataURL(this.selectedFile);

//   reader.onload = () => {
//     this.obj['image'] = reader.result as string;
//   };
// }

  onSubmit() {
    if (!ValidationUtil.showRequiredError('Holiday Type', this.obj.holiday_type, this.notyf)) {
      return;
    }
    if (!ValidationUtil.showRequiredError('Holiday Name', this.obj.holiday_name, this.notyf)) {
      return;
    }
    if (!ValidationUtil.showRequiredError('Holiday Date', this.obj.date, this.notyf)) {
      return;
    }

    const formData=new FormData();
    formData.append('holiday_type', this.obj.holiday_type);
    formData.append('holiday_name', this.obj.holiday_name);
    formData.append('date', this.obj.date);
  if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    } else {
      Swal.fire({
        toast: true,
        position: "top",
        showConfirmButton: false,
        icon: "warning",
        timer: 5000,
        title: "Select a file to upload",
      });
      return;
    }

    this.attendanceService.addHoliday(formData).subscribe({
      next: (response: any) => {
        console.log('response', response);

        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);

        if (status === true) {

          this.notyf.success(message)
          this.fetchHoliday();
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
    this.sanitizedImage=this.obj['image']
    // ? this.sanitizer.bypassSecurityTrustUrl(`${this.baseurl}/${this.obj['doc_image']}`) : null;
  }
  updatedata() {
      const updateData = new FormData();
    updateData.append('holiday_type', this.obj.holiday_type);
    updateData.append('holiday_name', this.obj.holiday_name);
    updateData.append('date', this.obj.date);
    updateData.append('description', this.obj.description);
    updateData.append('status', this.obj.status);
    updateData.append('id', this.obj.id);
    if (this.selectedFile) {
      updateData.append('image', this.selectedFile, this.selectedFile.name);
    } else {
      // Swal.fire({
      //   toast: true,
      //   position: "top",
      //   showConfirmButton: false,
      //   icon: "warning",
      //   timer: 5000,
      //   title: "Select a file to upload",
      // });
      // return;
    }


    this.attendanceService.updateHoliday(updateData).subscribe({
      next: (response: any) => {
        console.log('response', response);
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);
        if (status === true) {
          this.notyf.success(message)
          this.fetchHoliday();
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
        this.deleteAttendance(data)
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
  deleteAttendance(data:any){
       this.attendanceService.deleteHoliday(data).subscribe({
      next: (response: any) => {
        console.log('response', response);
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);
        if (status === true) {
          this.notyf.success(message)
          this.fetchHoliday();
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


  createFlag: any = false
  listflag: any = true
  updateFlag: any = false
  opencreate() {
    this.obj = {}
    this.createFlag = true
    this.listflag = false
    this.updateFlag = false
    this.sanitizedImage=null
  }

imageUrls:any;
openModal1(imageUrl: any) {
  this.imageUrls = imageUrl;
  setTimeout(() => {
    const modalElement = document.getElementById('imageModal1');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }, 0);
}


}
