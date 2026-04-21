import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Notyf } from 'notyf';
import { EmployeeService } from '../../services/employee.service';
import { SearchPaginationComponent } from '../../master/search-pagination/search-pagination.component';

@Component({
  selector: 'app-all-letters',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchPaginationComponent],
  templateUrl: './all-letters.component.html',
  styleUrl: './all-letters.component.css',
})
export class AllLettersComponent implements OnInit {
  allEmployees: any[] = [];
  employees: any[] = [];
  filteredEmployees: any[] = [];
  pagedEmployees: any[] = [];

  loading = false;

  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  filterType = 'all';

  counts: any = { appointment: 0, nda: 0, relieving: 0, offer: 0 };
  employeeMap: any = {};

  notyf = new Notyf();

  readonly letterTypes = [
    { key: 'appointment', label: 'Appointment Letter', route: 'appointment-letter', color: 'appointment' },
    { key: 'offer',       label: 'Offer Letter',       route: 'offer-letter',       color: 'offer'       },
    { key: 'nda',         label: 'NDA',                route: 'nda',                color: 'nda'         },
    { key: 'relieving',   label: 'Relieving Letter',   route: 'releving-letter',    color: 'relieving'   },
  ];

  constructor(private employeeService: EmployeeService, private router: Router) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadStats();
  }

  loadStats(): void {
    this.employeeService.getLetterStats().subscribe({
      next: (res: any) => {
        if (res.status && res.data) {
          this.counts     = res.data.counts     || { appointment: 0, nda: 0, relieving: 0, offer: 0 };
          this.employeeMap = res.data.employeeMap || {};
          this.buildFilteredList();
        }
      },
      error: () => {}
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmp().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.status === true) {
          this.allEmployees = res.data?.formattedActiveEmps || res.data?.formattedEmps || [];
          this.buildFilteredList();
        }
      },
      error: () => { this.loading = false; }
    });
  }

  buildFilteredList(): void {
    // Only employees who have at least 1 letter generated
    this.employees = this.allEmployees.filter(e => !!this.employeeMap[e.id]);
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.searchTerm.toLowerCase().trim();
    let list = this.employees;

    if (this.filterType !== 'all') {
      list = list.filter(e => !!this.employeeMap[e.id]?.[this.filterType]);
    }

    this.filteredEmployees = q
      ? list.filter(e =>
          `${e.firstName} ${e.lastName} ${e.empCode} ${e.designation_name} ${e.department_name}`
            .toLowerCase().includes(q))
      : [...list];

    this.currentPage = 1;
    this.updatePage();
  }

  updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedEmployees = this.filteredEmployees.slice(start, start + this.pageSize);
  }

  onSearch(term: string): void { this.searchTerm = term; this.applyFilter(); }
  onPageChange(p: number): void { this.currentPage = p; this.updatePage(); }
  onPageSizeChange(s: number): void { this.pageSize = s; this.currentPage = 1; this.updatePage(); }

  isGenerated(employeeId: string, type: string): boolean {
    return !!this.employeeMap[employeeId]?.[type];
  }

  generatedDate(employeeId: string, type: string): string {
    const iso = this.employeeMap[employeeId]?.[type];
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  generatedCount(emp: any): number {
    return this.letterTypes.filter(t => this.isGenerated(emp.id, t.key)).length;
  }

  openLetter(emp: any, route: string): void {
    localStorage.setItem('employeeId', JSON.stringify(emp));
    this.router.navigate([`/layout/employee/add/profile/professional-info/${route}`]);
  }

  printLetter(emp: any, type: string): void {
    const routeMap: any = {
      appointment: 'appointment-letter',
      offer:       'offer-letter',
      nda:         'nda',
      relieving:   'releving-letter'
    };
    localStorage.setItem('employeeId', JSON.stringify(emp));
    this.router.navigate([`/layout/employee/add/profile/professional-info/${routeMap[type]}`]);
  }

  get totalGenerated(): number { return this.employees.length; }
}
