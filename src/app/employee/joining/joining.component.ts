import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { MasterService } from '../../services/master.service';
import { StatusService } from '../../services/status.service';
import { Notyf } from 'notyf';
import { Router } from '@angular/router';
import { ValidationUtil } from '../../shared/utils/validation.util';
import { DataService } from '../../services/data.service';
import { SearchPaginationComponent } from '../../master/search-pagination/search-pagination.component';

@Component({
  selector: 'app-joining',
  imports: [FormsModule, CommonModule, NgSelectModule, SearchPaginationComponent],
  templateUrl: './joining.component.html',
  styleUrl: './joining.component.css'
})
export class JoiningComponent {
  notyf: Notyf
  maxDate: any
  constructor(public dataService: DataService, private employeeService: EmployeeService, private master: MasterService, public statusService: StatusService, private router: Router,) {
    this.notyf = new Notyf();
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.maxDate = `${year}-${month}-${day}`;
  }
  maritalStatusList = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' },
    { value: 'Separated', label: 'Separated ' }
  ];
  genderList = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ]
  createFlag: boolean = false;
  async ngOnInit() {
    await this.countrydd();
    await this.loadEmployees();
    await this.getEmploymentTypes();
    await this.DepartmentDD()

  }

  pageSize = 5;
  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';
  onSearch(term: string) {
    this.searchTerm = term.toLowerCase();
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.applyFilters();
  }
  filteredDesignation: any = []
  searchText: any = ''
  originalList: any = []
  applyFilters() {
    let data = [...this.employees];
    const value = this.searchTerm || '';
    this.searchText = value.trim();
    if (this.searchText === '') {
      this.employees = [...this.originalList];
    } else {
      this.employees = this.originalList.filter((item: any) =>
        JSON.stringify(item).toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
    // pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredDesignation = data.slice(start, end);
  }

  async getEmploymentTypes() {
    this.employmentTypes = [];
    this.master.getEmploymentTypes().subscribe(data => {
      this.employmentTypes = data.data || [];
    });
  }
  calculateAge(dob: string) {
    if (!dob) return;


    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.personalDetails.age = age;
  }
  listflag: boolean = true;
  updateFlag: boolean = false;
  opencreate() {
    this.personalDetails = {}
    this.createFlag = true
    this.listflag = false
    this.updateFlag = false
  }
  countryList: any = [];
  employmentTypes: any[] = [];
  async countrydd() {
    this.countryList = [];
    this.employeeService.getCountry().subscribe((data: any) => {
      if (Array.isArray(data)) {
        this.countryList = data;
        console.log(this.countryList);
      } else if (data && data.status === false) {
        alert(data.message);
        return;
      } else if (data && data.data) {
        this.countryList = data.data;
        console.log(this.countryList);
      }
    });
  }
  // async getEmploymentTypes() {
  //   this.employmentTypes = [];
  //   this.master.getEmploymentTypes().subscribe(data => {
  //     this.employmentTypes = data;
  //     console.log(this.employmentTypes);
  //   }
  //   );
  // }
  states: any[] = [];
  async getstates(countryId: any) {
    this.states = []
    let obj: any = {}
    obj['id'] = countryId.value || countryId;

    this.employeeService.getStates(obj).subscribe(data => {
      this.states = data.data || [];
      console.log(this.states);
    }

    );
  }
  cities: any = []
  async getcity(stateId: any) {
    this.cities = [];
    let obj: any = {}
    obj['id'] = stateId.value || stateId;
    if (obj) {
      // Implement the logic to fetch cities based on the selected state
      this.employeeService.getCities(obj).subscribe(data => {
        this.cities = data.data || [];
        console.log(this.cities);
      });
    }
  }



  preventMoreThanTenDigits(event: KeyboardEvent, value: string): void {
    const isDigit = /^[0-9]$/.test(event.key);
    if (!isDigit || (value && value.length >= 10)) {
      event.preventDefault();
    }
  }
  adhaarvalidaiton(event: KeyboardEvent, value: string): void {
    const isDigit = /^[0-9]$/.test(event.key);
    if (!isDigit || (value && value.length >= 12)) {
      event.preventDefault();
    }
  }
  validateField(value: any, fieldName: string): boolean {
    if (!value || value.toString().trim() === '') {
      this.notyf.error(`Please enter a valid ${fieldName}`);
      return false;
    }
    return true;
  }
  personalDetails: any = {}
  submitForm() {
    if (
      !this.validateField(this.personalDetails.firstName, 'First Name') ||
      !this.validateField(this.personalDetails.lastName, 'Last Name') ||
      !this.validateField(this.personalDetails.email, 'Email') ||
      !this.validateField(this.personalDetails.mobile, 'Mobile Number') ||
      !this.validateField(this.personalDetails.adhaarNo, 'Aadhaar Number') ||
      !this.validateField(this.personalDetails.dateOfBirth, 'Date of Birth') ||
      !this.validateField(this.personalDetails.currentAddress, 'Current Address') ||
      !this.validateField(this.personalDetails.permanentAddress, 'Permanent Address') ||
      !this.validateField(this.personalDetails.city, 'City') ||
      !this.validateField(this.personalDetails.gender, 'Gender') ||
      !this.validateField(this.personalDetails.martialStatus, 'Marital Status')
    ) {
      return;
    }

    if (this.personalDetails.mobile.length !== 10) {
      this.notyf.error('Please enter a valid 10 digit mobile number');
      return;
    }

    const aadhaarRaw = this.personalDetails.adhaarNo.replace(/\D/g, '');
    if (aadhaarRaw.length !== 12) {
      this.notyf.error('Please enter a valid 12 digit Aadhaar number');
      return;
    }
    const dob = new Date(this.personalDetails.dateOfBirth);
    const formattedDob = `${dob.getDate().toString().padStart(2, '0')}/${(dob.getMonth() + 1).toString().padStart(2, '0')}/${dob.getFullYear()}`;;
    let obj: any = {}
    obj = Object.assign({}, this.personalDetails);
    obj.dateOfBirth = formattedDob;
    obj.adhaarNo = aadhaarRaw
    this.employeeService.createEmp(obj).subscribe(
      (response) => {

        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);
        if (status === true) {
          obj = {}
          this.notyf.success(message)
          this.reset();
          this.loadEmployees()
        } else if (status === "expired") {
          obj = {}
          this.notyf.error(message);
          this.router.navigate(["login"]);
        }
        else {
          this.notyf.error(message);
        }


      },
      (error) => {
        console.error('Error adding employee:', error);
        this.notyf.error(error?.error?.message);
        // alert('Failed to add employee. Please try again.');
      }

    )



  }
  departmentDD: any = []
  async DepartmentDD() {
    this.departmentDD = []


    this.master.Departmentsdd().subscribe({
      next: (response: any) => {
        console.log('response', response);

        let message = response.message ? response.message : 'Data found Successfully';
        // let status = this.statusService.handleResponseStatus(response.status, message);
        // console.log(status)
        // console.log("response", response);

        if (response.status === true) {
          this.departmentDD = response.data;
          // this.notyf.success(message)

          this.back()
        }
        else if (response.status === "expired") {
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
  designationDD: any = []
  getDesignation(item: any) {
    this.designationDD = []
    let obj: any = {}
    obj['department'] = item
    this.master.designationDD(obj).subscribe({
      next: (response: any) => {
        console.log('response', response);

        let message = response.message ? response.message : 'Data found Successfully';

        if (response.status === true) {
          this.designationDD = response.data;

        }
        else if (response.status === "expired") {
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
  employees: any = []
  employeeList: any = []
  cardData: any = {}
  async loadEmployees() {
    this.employees = []
    this.employeeList = []
    this.cardData = []
    this.originalList = []
    this.employeeService.getEmp().subscribe((response: any) => {
      if (response && response.data && response.status === true) {
        // this.notyf.success(response.message || 'Employees loaded successfully');
        this.employees = [];
        this.cardData = response.data.cardData
        this.employees = response.data.formattedEmps || [];
        this.originalList = response.data.formattedEmps || [];
        this.employeeList = response.data?.formattedEmps?.map((item: any) => ({
          value: item.id,
          label: `${item.firstName} ${item?.lastName || ''}`
        }));

      } else if (response.status === false) {
        this.notyf.error(response.message)
      }
      else if (response.status == 'expired') {
        this.router.navigate(['login'])
      }
    },
      (error: any) => {
        console.error('Error loading employees:', error);
        this.notyf.error(error)
        // alert('Failed to load employees. Please try again.');
      }
    );

  }
  async update(data: any) {
    this.personalDetails = Object.assign({}, data);
    const dob = new Date(this.personalDetails.dateOfBirth);
    const formattedDob = `${dob.getFullYear()}-${(dob.getMonth() + 1).toString().padStart(2, '0')}-${dob.getDate().toString().padStart(2, '0')}`;;
    this.personalDetails.dateOfBirth = formattedDob;
    this.personalDetails.state = Number(this.personalDetails.state);
    this.personalDetails.city = Number(this.personalDetails.city);
    this.personalDetails.country = Number(this.personalDetails.country);
    await this.getstates(this.personalDetails.country);
    await this.getcity(this.personalDetails.state);
    this.createFlag = true;
    this.updateFlag = true;
  }
  updateform() {
    this.createFlag = false;
    this.listflag = true;
    this.updateFlag = false;

    const dob = new Date(this.personalDetails.dateOfBirth);
    const formattedDob = `${dob.getDate().toString().padStart(2, '0')}/${(dob.getMonth() + 1).toString().padStart(2, '0')}/${dob.getFullYear()}`;;
    const obj = Object.assign({}, this.personalDetails);
    obj.dateOfBirth = formattedDob;
    this.employeeService.updateEmp(obj).subscribe(
      (response) => {

        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        console.log(status)
        console.log("response", response);
        if (status === true) {
          this.notyf.success(message)
          this.reset();
          this.loadEmployees()
        } else if (status === "expired") {
          this.notyf.error(message);
          this.router.navigate(["login"]);
        }
        else {
          this.notyf.error(message);
        }


      },
      (error) => {
        console.error('Error adding employee:', error);
        this.notyf.error('Failed to add employee. Please try again.');
      }

    )

  }
  delete(data: any) {
    this.employeeService.deleteEmp(data).subscribe(
      (response) => {
        console.log('Employee deleted successfully:', response);
        if (response && response.status === true) {
          this.loadEmployees();
          this.notyf.success(response.message || 'Employee deleted successfully');
        }
        else if (response && response.status === false) {
          this.notyf.error(response.message || 'Failed to delete employee');
        }
        else {
          this.notyf.error('Failed to delete employee');
        }

      },
      (error) => {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee. Please try again.');
      }
    )
  }

  reset() {
    this.personalDetails = {};
    this.createFlag = false;
    this.listflag = true;
    this.updateFlag = false;
  }
  back() {
    this.personalDetails = {}
    this.createFlag = false
  }
  toUppercase() {
    this.personalDetails.panNo = this.personalDetails.panNo?.toUpperCase() || '';
  }
  view(data: any) {
    console.log(data, "objectsss")
    // Save object
    data.state = Number(data.state);
    data.city = Number(data.city);
    data.country = Number(data.country);
    localStorage.setItem('employeeId', JSON.stringify(data));

    this.router.navigate(['/layout/employee/add']);
  }

  onAadhaarInput(event: any, separator: 'space' | 'dash' = 'space'): void {
    let input = event.target.value.replace(/\D/g, '').substring(0, 12); // only digits, max 12
    let formatted = '';

    // Choose separator: space or dash
    const sep = separator === 'dash' ? '-' : ' ';

    for (let i = 0; i < input.length; i += 4) {
      if (i > 0) formatted += sep;
      formatted += input.substr(i, 4);
    }

    // this.formattedAadhaar = formatted;
    this.personalDetails.adhaarNo = formatted; // store raw 12-digit Aadhaar number
  }

}
