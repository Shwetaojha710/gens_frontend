import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-recruitment-navbar',
   imports: [CommonModule, RouterModule], // ✅ IMPORTANT
  templateUrl: './recruitment-navbar.component.html',
  styleUrls: ['./recruitment-navbar.component.css']
})
export class RecruitmentNavbarComponent implements OnInit {

  isSidebarCollapsed = false;
  openMenu: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.setActiveMenu());
  }

  // Toggle sidebar
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // Toggle submenu
  toggleMenu(title: string) {
    this.openMenu = this.openMenu === title ? null : title;
  }

  // Active route
  isLinkActive(link?: string): boolean {
    if (!link) return false;
    return this.router.url.includes(link);
  }

  // Check child active
  isAnyChildActive(children?: any[]): boolean {
    return children?.some(child =>
      this.isLinkActive(child.link)
    ) || false;
  }

  // Auto open active menu
  setActiveMenu() {
    this.menuItems.forEach(menu => {
      if (menu.children && this.isAnyChildActive(menu.children)) {
        this.openMenu = menu.title;
      }
    });
  }

  // MENU DATA
  menuItems = [
    {
      title: 'Dashboard',
      icon: 'ri-home-line',
      link: '/layout/recuiter-dashboard'
    },
    {
      title: 'Recruitment',
      icon: 'ri-user-search-line',
      children: [
        { title: 'Jobs', icon: 'ri-briefcase-line', link: '/layout/recruitment/jobs' },
        { title: 'Candidates', icon: 'ri-group-line', link: '/layout/recruitment/candidates' }
      ]
    },
    {
      title: 'Employee',
      icon: 'ri-user-line',
      children: [
        { title: 'Add Employee', icon: 'ri-user-add-line', link: '/layout/employee/add' }
      ]
    }
  ];
}
