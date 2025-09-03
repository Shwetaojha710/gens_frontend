import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Notyf } from 'notyf';
import Swal from 'sweetalert2';
import { MasterService } from '../../services/master.service';
import { StatusService } from '../../services/status.service';
import { AttendanceService } from '../../services/attendance.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
@Component({
  selector: 'app-logs',
  imports: [FormsModule, CommonModule, NgSelectModule,],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css'
})

export class LogsComponent {
  obj: any = {}
  notyf: Notyf;
  monthList = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
  onItemsPerPageChange(event: any) {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1; // Reset to first page
    this.updateDisplayedList();
  }
  dayList: string[] = [];

  generateDayList(month: number, year: number) {
    const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based
    this.dayList = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const day = i.toString().padStart(2, '0');
      const date = new Date(year, month - 1, i); // month-1 because Date expects 0-based month
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon", "Tue"
      this.dayList.push(`${day} ${weekday}`);
    }

    console.log(this.dayList);
  }
  status: any = [{ value: 'active', label: 'ACTIVE' }, { value: 'inactive', label: 'INACTIVE' }]

  // onSubmit() {
  //    console.log(this.obj)
  // }
  AttendanceMasterList: any = [];
  editingId: number | null = null;

  constructor(
    private master: MasterService,
    private attendanceService: AttendanceService,
    public statusService: StatusService,
    private router: Router,
  ) {


    this.notyf = new Notyf();
  }
  yearList: any = [];
  EmpList: any = []
  AttendanceList: any = []
  searchText: any
  originalList: any = []
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  updateDisplayedList() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.AttendanceMasterList = this.originalList.slice(start, end);
    this.totalPages = Math.ceil(this.originalList.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedList();
  }
  applyFilter(event: any) {
  const value = event?.target?.value || '';
  this.searchText = value.trim();

  if (this.searchText === '') {
    this.AttendanceMasterList = [...this.originalList];
  } else {
    this.AttendanceMasterList = this.originalList.filter((item: any) =>
      JSON.stringify(item).toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // this.updateDisplayedList();
}

  // applyFilter(event: any) {
  //   this.searchText = event?.target.value;

  //   if (!this.searchText || this.searchText.trim() === '') {
  //     this.AttendanceMasterList = [...this.originalList];
  //       this.updateDisplayedList();
  //     return;
  //   }

  //   const search = this.searchText.toLowerCase();

  //   this.AttendanceMasterList = this.originalList.filter((item: any) => {
  //     return (
  //       item.employee_name.toLowerCase().includes(search) ||
  //       item.data.some((d: any) =>
  //         d.date?.toLowerCase().includes(search) ||
  //         d.status?.toLowerCase().includes(search)
  //       )
  //     );
  //   });
  //   this.currentPage = 1;
  // }
  async ngOnInit() {

    await this.empList();
    await this.getYear();
    this.updateDisplayedList();
  }

  fetchAttendance() {
    this.AttendanceList = []
    this.originalList=[]
    console.log(this.AttendanceMasterList, "attendace master list 111")
    this.attendanceService.getattendancelist(this.obj).subscribe((response: any) => {
      if (response && response.data && response.status === true) {
        this.notyf.success(response.message || 'Employees loaded successfully');
        this.AttendanceMasterList = [];
        this.AttendanceMasterList = response.data || [];
        const statusMap: Record<string, string> = {
          'Week Off': 'WO',
          'Present': 'P',
          'Absent': 'A'
        };

        this.AttendanceMasterList = this.AttendanceMasterList.map((item: any) => ({
          ...item,
          data: item.data.map((item1: any) => ({
            ...item1,
            status: statusMap[item1.status] || item1.status
          }))
        }));
        this.originalList=this.AttendanceMasterList
        this.generateDayList(this.obj['month'], this.obj['year']);
        this.updateDisplayedList();
      } else if (response.status === false) {
        this.notyf.error(response.message)
      }
      else if (response.status == 'expired') {
        this.AttendanceMasterList = [];
        this.router.navigate(['login'])
      }
    },
      (error: any) => {
        this.AttendanceMasterList = [];
        console.error('Error loading employees:', error);
        this.notyf.error(error)
        // alert('Failed to load employees. Please try again.');
      }
    );

  }

  export(): void {
    const exportData: any[] = [];

    this.AttendanceMasterList.forEach((employee: any) => {
      const row: any = {};
      row['Employee'] = employee.employee_name;

      this.dayList.forEach(day => {
        const dayNum = day.slice(0, 2); // "01", "02", ...
        const match = employee.data.find((entry: any) =>
          entry.date.endsWith(`-${dayNum}`)
        );

        row[day] = this.mapStatus(match?.status || '');
      });

      exportData.push(row);
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Attendance': worksheet },
      SheetNames: ['Attendance']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(blob, 'Monthly_Attendance.xlsx');
  }

  mapStatus(status: string): string {
    const map: any = {
      'Present': 'P',
      'Absent': 'A',
      'Leave': 'L',
      'Holiday': 'H',
      'Off Day': 'O',
      'Week Off': 'WO'
    };
    return map[status] || status;
  }

  // Optional: map full status to short code
  getShortStatus(status: string): string {
    const map: any = {
      'Present': 'P',
      'Absent': 'A',
      'Leave': 'L',
      'Holiday': 'H',
      'Off Day': 'O',
      'Week Off': 'WO'
    };
    return map[status] || status;
  }



  async empList() {
    this.EmpList = []
    this.master.getemployeeList().subscribe((data: { [x: string]: any; data: any; }) => {
      console.log(data)
      if (data['status'] == true) {
        // this.notyf.success(data['message']);
        this.EmpList = data.data;
        // console.log(this.EmpList, "attendance master list");

      }
      else if (data['status'] == 'expired') {
        this.router.navigate(['login'])
      }
      else {
        this.notyf.error(data['message']);
      }
    });

  }
  async getYear() {
    this.yearList = []
    this.master.getAttendanceYear().subscribe((data: { [x: string]: any; data: any; }) => {
      console.log(data)
      if (data['status'] == true) {
        // this.notyf.success(data['message']);
        this.yearList = data.data;
        console.log(this.EmpList, "attendance master list");

      }
      else if (data['status'] == 'expired') {
        this.router.navigate(['login'])
      }
      else {
        this.notyf.error(data['message']);
      }
    });

  }
  getStatusClass(status: any): string {
    switch (status) {
      case 'pending': return 'bg-light-warning';
      case 'cancelled': return 'bg-light-danger';
      case 'completed': return 'bg-light-success';
      default: return 'bg-light-secondary';
    }
  }


  validateField(value: any, fieldName: string): boolean {
    if (!value || value.toString().trim() === '') {
      this.notyf.error(`Please enter a valid ${fieldName}`);
      return false;
    }
    return true;
  }





}

