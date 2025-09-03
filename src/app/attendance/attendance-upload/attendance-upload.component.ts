import { Component } from '@angular/core';
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

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
        }
        else if (res['status'] == 'expired') {
          this.router.navigate(['login']);
        }
        else {
          if (this.notyf) {
            this.notyf.error(res['message']);
          }
        }

      },
      error: () => {
        this.message = "Upload failed!";
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
