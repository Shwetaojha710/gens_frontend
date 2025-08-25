import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../include/header/header.component';

@Component({
  selector: 'app-layout',
  imports: [NavbarComponent,HeaderComponent,RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
