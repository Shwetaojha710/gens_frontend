import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { Notyf } from 'notyf';
import Swal from 'sweetalert2';
import { AttendanceService } from '../../services/attendance.service';
import { MasterService } from '../../services/master.service';
import { StatusService } from '../../services/status.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-tracking-report',
  imports: [NgSelectModule,
    FormsModule, CommonModule],
  templateUrl: './tracking-report.component.html',
  styleUrl: './tracking-report.component.css'
})
// export class TrackingReportComponent {

// }


export class TrackingReportComponent {
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
  reportType: any = [{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }]
  quarterList: any = [{ value: '1', label: 'Q1' }, { value: '2', label: 'Q2' }, { value: '3', label: 'Q3' }, { value: '4', label: 'Q4' },]

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
    private locationService: LocationService,
  ) {


    this.notyf = new Notyf();
    this.obj['emp_id'] = 'All'
    this.obj['report_type'] = 'monthly'
    this.obj['year'] = new Date().getFullYear().toString()
    this.obj['month'] = new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1).toString()

    this.VisitPlaceDD()
    this.loadReport()

  }

  PlaceDD: any = []

  VisitPlaceDD() {
    this.PlaceDD = []


    this.locationService.VisitPlaceDD().subscribe((response: any) => {
      if (response && response.data && response.status == true) {

        this.notyf.success(response.message || 'Employees loaded successfully');

        this.PlaceDD = response.data
      } else if (response.status == false) {
        this.notyf.error(response.message)
      }
      else if (response.status == 'expired') {
        this.reportData = [];
        this.router.navigate(['login'])
      }
    },
      (error: any) => {
        this.AttendanceMasterList = [];
        console.error('Error loading employees:', error);
        this.notyf.error(error?.error?.message)
        // alert('Failed to load employees. Please try again.');
      }
    );

  }
  yearList: any = [];
  EmpList: any = []
  AttendanceList: any = []
  searchText: any
  originalList: any = []
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  baseurl: any;
  updateDisplayedList() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.reportData = this.originalList.slice(start, end);
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
      this.reportData = [...this.originalList];
    } else {
      this.reportData = this.originalList.filter((item: any) =>
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
    this.baseurl = this.master.getBaseUrl();
  }

  reportData: any = []
  async viewAddress(item: any) {

    const lat = item.latitude
    const lng = item.longitude

    item.address = await this.getAddressFromAPI(lat, lng)

  }
  async getAddressFromAPI(lat: number, lng: number): Promise<string | null> {
    try {
      // const response: any = await firstValueFrom(await this.locationService.getAddressFromGlobalVTS(lat, lng));
      const response: any = await this.locationService.getAddressFromGlobalVTS(lat, lng);
      console.log(response);


      if (response && response.address && typeof response.address == 'string' && response.address.trim() !== '') {
        return response.address;
      }

      return null;
    } catch (error) {
      console.error('Error fetching address from API:', error);
      return null;
    }
  }
  loadReport() {

    const payload = {

      employeeId: this.obj['emp_id'],
      report_type: this.obj['report_type'],
      year: this.obj['year'],
      month: this.obj['month'],
      quarter: this.obj['quarter'],

    }
    this.reportData = []

    this.locationService.getVisitReport(payload).subscribe((response: any) => {
      if (response && response.data && response.status === true) {

        this.notyf.success(response.message || 'Employees loaded successfully');

        this.reportData = response.data

        this.originalList = this.reportData
        this.updateDisplayedList();
      } else if (response.status === false) {
        this.notyf.error(response.message)
      }
      else if (response.status == 'expired') {
        this.reportData = [];
        this.router.navigate(['login'])
      }
    },
      (error: any) => {
        this.AttendanceMasterList = [];
        console.error('Error loading employees:', error);
        this.notyf.error(error?.error?.message)
        // alert('Failed to load employees. Please try again.');
      }
    );

  }

  export(): void {
    const exportData: any[] = [];

    this.originalList.forEach((employee: any) => {
      const row: any = {};
      row['Employee Name'] = employee?.employeeName;
      row['Employee Code'] = employee?.empCode;
      row['Date'] = employee?.date
      row['check In'] = employee?.checkIn
      row['Late By Minutes'] = employee?.lateByMinutes
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

    FileSaver.saveAs(blob, 'Late_Attendance.xlsx');
  }

  // allow(item:any){

  //   let id = item?.id

  //   this.attendanceService.updateEmpAttendance()



  // }

  allow(item: any) {

    Swal.fire({
      title: "Are you sure?",
      text: "Do you Want to Approve this",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.leaveApproval(item)
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

  leaveApproval(item: any) {
    let id = item?.id
    let obj: any = {}
    obj['id'] = id
    obj['late_by_minutes'] = item?.lateByMinutes
    obj['checkIn'] = item?.checkIn
    obj['allowedTill'] = item?.allowedTill
    obj['date'] = item?.date

    this.attendanceService.updateEmpAttendance(obj).subscribe((data: {
      [x: string]: any;
    }) => {
      if (data['status'] == true) {
        this.notyf.success(data['message']);
        this.loadReport();
      } else if (data['status'] == 'expired') {
        this.router.navigate(['login'])
      }
      else {
        this.notyf.error(data['message']);
      }
    },
      (error: any) => {
        let message = error?.message
        this.notyf.error('Failed to update attendance. Please try again.');
      }
    );
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
    this.locationService.getActiveTrackingUsers().subscribe({
      next: (response: any) => {
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        if (status === true) {

          const employees = response.data.map((item: any, index: number) => {
            return {
              ...item,
              si_no: index + 1,
              label: `${item.firstName} ${item.lastName} - ${item.empCode}`,
              value: item.id,
              profileImage: item.profileImage
                ? `${this.baseurl}${item.profileImage}`
                : item.gender === 'Female'
                  ? '../../assets/img/avatars/2.png'
                  : '../../assets/img/avatars/1.png'
            };
          });

          this.originalList = [...employees];

          this.EmpList = [
            { label: 'All', value: 'All' },
            ...employees
          ];

          console.log(this.EmpList);
        }
        else if (status === "expired") {
          this.router.navigate(["login"]);
        }
        else {
        }
      },
      error: (err) => {
        console.error('Error:', err);
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
