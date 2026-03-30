import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuItem } from './recuirtment-navigation';

@Component({
  selector: 'app-recruitment-navbar',
   imports: [CommonModule, RouterModule], // ✅ IMPORTANT
  templateUrl: './recruitment-navbar.component.html',
  styleUrls: ['./recruitment-navbar.component.css']
})
export class RecruitmentNavbarComponent {
  openMenu: string | null = null;

  constructor(private router: Router, private elRef: ElementRef) { }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  async ngAfterViewInit() {
    const items = document.querySelectorAll('.menu-item');
    items.forEach((item: Element) => {
      item.addEventListener('mouseenter', () => {
        item.classList.add('open');
      });

      item.addEventListener('mouseleave', () => {
        item.classList.remove('open');
      });
    });

  }
  menuItems: MenuItem[] = [
    {
      title: 'Dashboards',
      icon: 'ri-home-smile-line',
      active: true,
      link: '/layout/dashboard'
    },

    {
      title: 'Job Recruitment Analysis',
      icon: 'ri-layout-2-line',
      children: [
        // { title: 'Employee List', icon: 'ri-file-list-2-line', link: '/layout/employee/list' },
        { title: 'Job Requirement Analysis', icon: 'ri-user-add-line', link: '/recruitment/jobs/job-requirement' },
        { title: 'Job Posting & Sourcing', icon: 'ri-user-add-line', link: '/recruitment/jobs/posting-sourcing' },
      ]
    },

    {
      title: 'Attendance & Shift',
      icon: 'ri-calendar-check-line',
      children: [
        { title: 'Shift Master', icon: 'ri ri-user-3-line', link: '/layout/attendance/shift' },
        { title: 'Date Wise Attendance', icon: 'ri-calendar-line', link: '/layout/attendance/date-wise-attendance' },
        { title: 'Holiday', icon: 'ri-barricade-fill', link: '/layout/attendance/holiday' },
        { title: 'Attendance Logs', icon: 'ri-calendar-line', link: '/layout/attendance/logs' },
        { title: 'Leaves', icon: 'ri-leaf-line', link: '/layout/attendance/leaves' },
        { title: 'Upload Attendance', icon: 'ri-upload-cloud-line', link: '/layout/attendance/upload-attendance' },
        { title: 'Regularize', icon: 'ri-upload-cloud-line', link: '/layout/attendance/regularize' },
        { title: 'Weekend Employee List', icon: 'ri-upload-cloud-line', link: '/layout/attendance/weekend-emp-list' },
        { title: 'Add Comp Off', icon: 'ri-upload-cloud-line', link: '/layout/attendance/add-comp-off' }

      ]
    },
    {
      title: 'Payroll & Compensation',
      icon: 'ri-money-cny-circle-line',
      children: [
        { title: 'Generate Salary', icon: 'ri-money-rupee-circle-line', link: '/layout/payroll/full-time' },
        { title: 'Generated Salary List', icon: 'ri-suitcase-line', link: '/layout/payroll/generated-salary' },
        { title: 'Reimbursement', icon: 'ri-refund-line', link: '/layout/payroll/reimbursement' },
        // { title: 'Part Time Salary Master', icon: 'ri-time-line', link: '/layout/payroll/part-time' },
        // // { title: 'Allowances Master', icon: 'ri-gift-line', link: '/layout/payroll/allowances' },
        // { title: 'Deductions', icon: 'ri-subtract-line', link: '/layout/payroll/deductions' }
      ]
    },
    {
      title: 'Reports',
      icon: 'ri-bar-chart-line',
      children: [
        { title: 'Employee Report', icon: 'ri-file-user-line', link: '/layout/reports/employee' },
        { title: 'Payroll Report', icon: 'ri-file-paper-line', link: '/layout/reports/payroll' },
        { title: 'Attendance Report', icon: 'ri-file-list-3-line', link: '/layout/reports/attendance' },
        { title: 'Tracking Report', icon: 'ri-file-list-3-line', link: '/layout/reports/tracking-report' },
      ]
    },
    {
      title: 'Master',
      icon: 'ri-settings-3-line',
      children: [
        { title: 'Designation Master', icon: 'ri-team-line', link: '/layout/master/designation' },
        { title: 'Department Master', icon: 'ri-building-4-line', link: '/layout/master/department' },
        { title: 'Employment Type', icon: 'ri-briefcase-4-line', link: '/layout/master/employment-type' },
        { title: 'Documents', icon: 'ri-file-text-line', link: '/layout/master/documents' },
        { title: 'Holiday Types', icon: 'ri-suitcase-line', link: '/layout/master/holiday-type' },
        // { title: 'Company Prefix', icon: 'ri-info-card-line', link: '/layout/master/prefix' },
        { title: 'Salary Component', icon: 'ri-wallet-2-line', link: '/layout/master/salary-component' },
        // { title: 'Currency', icon: 'ri-copper-coin-line', link: '/layout/master/currency' },
        { title: 'Pay Slip Setup', icon: 'ri-file-pdf-2-line', link: '/layout/master/pay-slip' },
        { title: 'Branch', icon: 'ri-file-pdf-2-line', link: '/layout/master/branch' },

        // {title: 'Attendance Master11', icon: 'ri-file-line', link: '/layout/master/salary-master'}

      ]
    },
    {
      title: 'Setting',
      icon: 'ri-settings-3-line',
      children: [
        { title: 'Attendance Master', icon: 'ri-calendar-line', link: '/layout/attendance/salary-master' },
        { title: 'Currency', icon: 'ri-copper-coin-line', link: '/layout/master/currency' },
        { title: 'Company Prefix', icon: 'ri-info-card-line', link: '/layout/master/prefix' },
        // { title: 'Date Format', icon: 'ri-building-4-line', link: '/layout/master/date-format' },
        // { title: 'Time Zone', icon: 'ri-briefcase-4-line', link: '/layout/master/time-zone' },
        // { title: 'SMS', icon: 'ri-file-text-line', link: '/layout/master/SMS' },
        // { title: 'EMAIL', icon: 'ri-suitcase-line', link: '/layout/master/email' },


      ]
    },
    //  {
    //   title: 'Tracking',
    //   icon: 'ri-settings-3-line',
    //     link: '/layout/tracking'
    // }
  ];
  toggleMenu(menu: any): void {
    // this.menuItems.forEach(m => {
    //   if (m !== menu) m.active = false;
    // });
    // menu.active = !menu.active;
    this.menuItems.forEach(m => {
      if (m.title === menu.title) {
        m.active = true;
      } else {
        m.active = false;
      }
    })
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setActiveMenuItem(event.urlAfterRedirects);
      }
    });

    // Also run once on init
    this.setActiveMenuItem(this.router.url);
  }
  // Checks if any child in the given array is active (used in navbar.component.html)
  isAnyChildActive(children: any[]): boolean {
    if (!children) return false;
    return children.some(child => child.active || (child.children && this.isAnyChildActive(child.children)));
  }


  async setActiveMenuItem(currentUrl: string) {
    const markActive = (items: MenuItem[]): boolean => {
      let anyActive = false;

      items.forEach(item => {
        item.active = item.link === currentUrl;
        if (item.children?.length) {
          const childActive = markActive(item.children);
          item.active = item.active || childActive;
        }
        anyActive ||= item.active;
      });

      return anyActive;
    };

    markActive(this.menuItems);
  }


}
// export class RecruitmentNavbarComponent implements OnInit {

//   isSidebarCollapsed = false;
//   openMenu: string | null = null;

//   constructor(private router: Router) {}

//   ngOnInit(): void {
//     this.router.events
//       .pipe(filter(e => e instanceof NavigationEnd))
//       .subscribe(() => this.setActiveMenu());
//   }

//   // Toggle sidebar
//   toggleSidebar() {
//     this.isSidebarCollapsed = !this.isSidebarCollapsed;
//   }

//   // Toggle submenu
//   toggleMenu(title: string) {
//     this.openMenu = this.openMenu === title ? null : title;
//   }

//   // Active route
//   isLinkActive(link?: string): boolean {
//     if (!link) return false;
//     return this.router.url.includes(link);
//   }

//   // Check child active
//   isAnyChildActive(children?: any[]): boolean {
//     return children?.some(child =>
//       this.isLinkActive(child.link)
//     ) || false;
//   }

//   // Auto open active menu
//   setActiveMenu() {
//     this.menuItems.forEach(menu => {
//       if (menu.children && this.isAnyChildActive(menu.children)) {
//         this.openMenu = menu.title;
//       }
//     });
//   }

//   // MENU DATA
//   menuItems = [
//     {
//       title: 'Dashboard',
//       icon: 'ri-home-line',
//       link: '/layout/recuiter-dashboard'
//     },
//     {
//       title: 'Recruitment',
//       icon: 'ri-user-search-line',
//       children: [
//         { title: 'Jobs', icon: 'ri-briefcase-line', link: '/layout/recruitment/jobs' },
//         { title: 'Candidates', icon: 'ri-group-line', link: '/layout/recruitment/candidates' }
//       ]
//     },
//     {
//       title: 'Employee',
//       icon: 'ri-user-line',
//       children: [
//         { title: 'Add Employee', icon: 'ri-user-add-line', link: '/layout/employee/add' }
//       ]
//     }
//   ];
// }
