import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../include/header/header.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NewnavbarComponent } from '../newnavbar/newnavbar.component';
import { RecruitmentNavbarComponent } from '../recruitment/recruitment-navbar/recruitment-navbar.component';

@Component({
  selector: 'app-interviewer',
  imports: [HeaderComponent,RecruitmentNavbarComponent, RouterModule],
  templateUrl: './interviewer.component.html',
  styleUrl: './interviewer.component.css'
})
export class InterviewerComponent {

}
