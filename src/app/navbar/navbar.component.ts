import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuItem } from './navigation';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  // Tracks which top-level (or nested) menu title is currently open
  openMenu: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // On every route change, auto-expand the parent menu of the active route
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.expandActiveMenu());

    // Also run on first load
    this.expandActiveMenu();
  }

  /** Toggle a menu open/close. Clicking an already-open menu closes it. */
  toggleMenu(title: string): void {
    this.openMenu = this.openMenu === title ? null : title;
  }

  /** Returns true if the given routerLink matches the current URL exactly */
  isLinkActive(link?: string): boolean {
    if (!link) return false;
    return this.router.url === link || this.router.url.startsWith(link + '/');
  }

  /** Returns true if any child (recursively) has an active link */
  isAnyChildActive(children?: MenuItem[]): boolean {
    if (!children) return false;
    return children.some(child =>
      this.isLinkActive(child.link) || this.isAnyChildActive(child.children)
    );
  }

  isCollapsed = false;

toggleSidebar() {
  this.isCollapsed = !this.isCollapsed;
}
  /** On navigation, find and open the parent menu containing the active route */
  private expandActiveMenu(): void {
    for (const item of this.menuItems) {
      if (item.children && this.isAnyChildActive(item.children)) {
        this.openMenu = item.title;
        return;
      }
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'ri-home-smile-line',
      link: '/layout/dashboard'
    },
    {
      title: 'Employee Management',
      icon: 'ri-group-line',
      children: [
        { title: 'Add Employee',  icon: 'ri-user-add-line',    link: '/layout/employee/joining' },
        { title: 'Apply Leave',   icon: 'ri-file-list-2-line', link: '/layout/employee/apply-leave' },
      ]
    },
    {
      title: 'Attendance & Shift',
      icon: 'ri-calendar-check-line',
      children: [
        { title: 'Shift Master',         icon: 'ri-user-3-line',        link: '/layout/attendance/shift' },
        { title: 'Date Wise Attendance', icon: 'ri-calendar-line',      link: '/layout/attendance/date-wise-attendance' },
        { title: 'Holiday',              icon: 'ri-barricade-fill',     link: '/layout/attendance/holiday' },
        { title: 'Attendance Logs',      icon: 'ri-calendar-line',      link: '/layout/attendance/logs' },
        { title: 'Leaves',               icon: 'ri-leaf-line',          link: '/layout/attendance/leaves' },
        { title: 'Upload Attendance',    icon: 'ri-upload-cloud-line',  link: '/layout/attendance/upload-attendance' },
        { title: 'Regularize',           icon: 'ri-refresh-line',       link: '/layout/attendance/regularize' },
        { title: 'Weekend Emp List',     icon: 'ri-team-line',          link: '/layout/attendance/weekend-emp-list' },
        { title: 'Add Comp Off',         icon: 'ri-rest-time-line',     link: '/layout/attendance/add-comp-off' },
      ]
    },
    {
      title: 'Payroll & Compensation',
      icon: 'ri-money-cny-circle-line',
      children: [
        { title: 'Generate Salary',       icon: 'ri-money-rupee-circle-line', link: '/layout/payroll/full-time' },
        { title: 'Generated Salary List', icon: 'ri-suitcase-line',           link: '/layout/payroll/generated-salary' },
        { title: 'Reimbursement',         icon: 'ri-refund-line',             link: '/layout/payroll/reimbursement' },
      ]
    },
    {
      title: 'Recruitment',
      icon: 'ri-user-search-line',
      children: [
        { title: 'Job Postings', icon: 'ri-briefcase-line',   link: '/layout/recruitment/jobs' },
        { title: 'Candidates',   icon: 'ri-contacts-line',    link: '/layout/recruitment/candidates' },
        { title: 'Pipeline',     icon: 'ri-kanban-view',      link: '/layout/recruitment/pipeline' },
        { title: 'Offers & BGV', icon: 'ri-file-text-line',   link: '/layout/recruitment/offers' },
      ]
    },
    {
      title: 'Master',
      icon: 'ri-settings-3-line',
      children: [
        { title: 'Department',       icon: 'ri-building-line',         link: '/layout/master/department' },
        { title: 'Designation',      icon: 'ri-award-line',            link: '/layout/master/designation' },
        { title: 'Employment Type',  icon: 'ri-id-card-line',          link: '/layout/master/employment-type' },
        { title: 'Documents',        icon: 'ri-file-copy-line',        link: '/layout/master/documents' },
        { title: 'Holiday Type',     icon: 'ri-calendar-event-line',   link: '/layout/master/holiday-type' },
        { title: 'Prefix',           icon: 'ri-text',                  link: '/layout/master/prefix' },
        { title: 'Salary Component', icon: 'ri-money-dollar-box-line', link: '/layout/master/salary-component' },
        { title: 'Currency',         icon: 'ri-currency-line',         link: '/layout/master/currency' },
        { title: 'Pay Slip Order',   icon: 'ri-file-list-3-line',      link: '/layout/master/pay-slip' },
        { title: 'Branch',           icon: 'ri-git-branch-line',       link: '/layout/master/branch' },
      ]
    },
    {
      title: 'Reports',
      icon: 'ri-bar-chart-2-line',
      children: [
        { title: 'Employee Report',  icon: 'ri-group-2-line',          link: '/layout/reports/employee' },
        { title: 'Payroll Report',   icon: 'ri-money-rupee-circle-line', link: '/layout/reports/payroll' },
        { title: 'Attendance Report',icon: 'ri-calendar-2-line',       link: '/layout/reports/attendance' },
        { title: 'Tracking Report',  icon: 'ri-route-line',            link: '/layout/reports/tracking-report' },
      ]
    },
    {
      title: 'Tracking',
      icon: 'ri-map-pin-line',
      children: [
        { title: 'Live Tracking', icon: 'ri-live-line', link: '/layout/tracking/live' },
      ]
    },
  ];
}
