import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HeaderComponent } from '../include/header/header.component';
import { RouterModule } from '@angular/router';
import { EmployeeComponent } from '../employee/employee.component';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent,HeaderComponent,RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
