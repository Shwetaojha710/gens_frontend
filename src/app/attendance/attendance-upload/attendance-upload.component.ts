import { Component, ElementRef, ViewChild } from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Notyf } from 'notyf';
import { Router } from '@angular/router';
@Component({
  selector: 'app-attendance-upload',
  imports: [FormsModule, CommonModule, NgSelectModule,],
  templateUrl: './attendance-upload.component.html',
  styleUrl: './attendance-upload.component.css'
})
export class AttendanceUploadComponent {
  selectedFile?: any;
  rows: any[] = [];
  message = "";
  createFlag = true;

  notyf: Notyf | undefined;
  constructor(private attendanceService: AttendanceService, private router: Router) {
    this.notyf = new Notyf();
  }

async onFileSelected(event: any) {
  const file = event.target.files[0];

  if (file) {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      this.notyf?.error('Only Excel files (.xls, .xlsx) are allowed!');
      this.selectedFile = null;
      event.target.value = ''; // clear input
      return;
    }

    this.selectedFile = file;
    console.log('Excel file selected:', this.selectedFile);
  }
}

  @ViewChild('fileInput') fileInput!: ElementRef;

  onUpload() {
    if (!this.selectedFile) {
      this.message = "Please select an Excel file!";
      if (this.notyf) {
        this.notyf.error(this.message);
      }
      return;
    }

    this.attendanceService.uploadFile(this.selectedFile).subscribe({
      next: (res) => {
        this.message = "Excel uploaded successfully!";
        console.log(res);

        if (res['status'] == true) {
          if (this.notyf) {
            this.notyf.success(res['message']);
          }
          this.selectedFile = undefined;
          this.selectedFile = null;
          this.rows = res.rows; // parsed excel rows
          // reset the actual file input
          this.fileInput.nativeElement.value = '';
        }
        else if (res['status'] == 'expired') {
          localStorage.clear()
          this.router.navigate(['login']);
          // reset the actual file input
          this.fileInput.nativeElement.value = '';
        }
        else {
          if (this.notyf) {
            this.notyf.error(res['message']);
            // reset the actual file input
            this.fileInput.nativeElement.value = '';
          }
        }

      },
      error: (err) => {
        this.message = "Upload failed!";
        let errorMessage = err?.error?.message ? err?.error?.message : err?.message
        if (this.notyf) {
            this.fileInput.nativeElement.value = '';
          this.notyf.error(errorMessage);
        }
      }
    });
  }
  download() {

    const headers = [
      [
        "employeeId",
        "date",
        "check_in_time",
        "check_out_time",
        "is_present",
      ]
    ];

    // Create worksheet with headers only
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(headers);

    // Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AttendanceTemplate");

    // Export
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'attendance_template.xlsx');
  }

}
