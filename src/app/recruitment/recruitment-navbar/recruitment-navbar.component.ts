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
      title: 'Master',
      icon: 'ri-settings-3-line',
      children: [
        { title: 'Interview Round', icon: 'ri-building-4-line', link: '/recruitment/master/interview-round' },
        { title: 'Round Type', icon: 'ri-building-4-line', link: '/recruitment/master/round-type' },
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
