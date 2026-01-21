import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SearchPaginationComponent } from '../master/search-pagination/search-pagination.component';
import { Router } from '@angular/router';
import { Notyf } from 'notyf';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-company-reg',
  imports: [FormsModule, CommonModule, NgSelectModule, SearchPaginationComponent, ReactiveFormsModule],
  templateUrl: './company-reg.component.html',
  styleUrl: './company-reg.component.css'
})
export class CompanyRegComponent {
  form: FormGroup;
  notyf: Notyf;
  passwordVisible: boolean = false;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      tenantId: ['', Validators.required],
      tenantName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      // image: ['', Validators.required]
    });

    this.notyf = new Notyf();
  }
  personalDetails: any = {}

  preventMoreThanTenDigits(event: KeyboardEvent, value: string): void {
    const isDigit = /^[0-9]$/.test(event.key);
    if (!isDigit || (value && value.length >= 10)) {
      event.preventDefault();
    }
  }
  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notyf.error('Please fill in all required fields.');
      return;
    }

    if (!this.selectedFile) {
      Swal.fire({
        toast: true,
        position: "top",
        showConfirmButton: false,
        icon: "warning",
        timer: 3000,
        title: "Please select a company logo",
      });
      return;
    }

    const uploadData = new FormData();

    uploadData.append('tenantId', this.form.value.tenantId);
    uploadData.append('tenantName', this.form.value.tenantName);
    uploadData.append('email', this.form.value.email);
    uploadData.append('password', this.form.value.password);
    uploadData.append('image', this.selectedFile);

    this.auth.CompanyRegister(uploadData).subscribe({
      next: (res: any) => {
           const data = JSON.parse(res)
        if (data.status == true) {
          this.notyf.success(data.message);
          this.router.navigate(['login']);
        } else {
          this.notyf.error(res.message);
        }
      },
      error: (err) => {
        console.error('REGISTRATION error:', err?.error);
        const error=JSON.parse(err?.error)
        this.notyf.error(error?.message || 'Server error. Please try again.');
      }
    });
  }


  gotoLogin() {
    this.router.navigate(['login']);
  }
  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
  isFileInvalid: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  onFileChange(event: any): void {
    const file: File = event.target.files[0];

    if (!file) {
      this.selectedFile = null;
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Only JPG, JPEG, and PNG formats are allowed.',
      });
      event.target.value = ''; // Clear the file input
      this.selectedFile = null;
      return;
    }

    if (file.size > maxSize) {
      // Swal.fire({
      //   icon: 'error',
      //   title: 'File Too Large',
      //   text: 'Maximum allowed file size is 2MB.',
      // });
      this.notyf.error('Maximum allowed file size is 2MB.');
      event.target.value = ''; // Clear the file input
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  @ViewChild('fileInput') fileInput!: ElementRef;
  // addPhoto() {
  //   console.log("apii callled")
  //   const uploadData = new FormData();
  //   uploadData.append('id', this.personalDetails.id)
  //   uploadData.append('employeeId', this.personalDetails.id)
  //   uploadData.append('name', this.personalDetails.firstName)

  //   if (this.selectedFile) {
  //     uploadData.append('profileImage', this.selectedFile, this.selectedFile.name);
  //     // uploadData.append('image', this.selectedFile, this.selectedFile.name);
  //     // uploadData.append('file', this.selectedFile, this.selectedFile.name);
  //   } else {
  //     Swal.fire({
  //       toast: true,
  //       position: "top",
  //       showConfirmButton: false,
  //       icon: "warning",
  //       timer: 5000,
  //       title: "Select a file to upload",
  //     });
  //     return;
  //   }

  //   this.employeeService.uploadImage(uploadData).subscribe({
  //     next: (response: any) => {
  //       console.log('response', response);

  //       let message = response.message ? response.message : 'Data found Successfully';
  //       let status = this.statusService.handleResponseStatus(response.status, message);
  //       console.log(status)
  //       console.log("response", response);

  //       if (status === true) {
  //         this.notyf.success(message)
  //         this.selectedFile = null;
  //         this.fileInput.nativeElement.value = '';
  //         this.fetchDocument();
  //         // this.resetForm();
  //       }
  //       else if (status === "expired") {
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

  //   // this.employeeService.pythonregister(uploadData).subscribe({
  //   //   next: (response: any) => {
  //   //     console.log('response', response);

  //   //     let message = response.message ? response.message : 'Data found Successfully';
  //   //     let status = this.statusService.handleResponseStatus(response.status, message);
  //   //     console.log(status)
  //   //     console.log("response", response);

  //   //     if (status === true) {

  //   //       this.notyf.success(message)
  //   //       this.fetchDocument();
  //   //       // this.resetForm();
  //   //     }
  //   //     else if (status === "expired") {
  //   //         this.router.navigate(["login"]);
  //   //     }

  //   //     else {
  //   //       this.notyf.error(message)
  //   //     }

  //   //   },
  //   //   error: (err) => {
  //   //     console.error('Error:', err);
  //   //     this.notyf.error(err)
  //   //   }
  //   // });

  // }
}
