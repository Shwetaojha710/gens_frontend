import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RecruitmentNavbarComponent } from '../recruitment/recruitment-navbar/recruitment-navbar.component';
import { InterviewerHeaderComponent } from './interviewer-header/interviewer-header.component';

@Component({
  selector: 'app-interviewer',
  imports: [InterviewerHeaderComponent,RecruitmentNavbarComponent, RouterModule],
  templateUrl: './interviewer.component.html',
  styleUrl: './interviewer.component.css'
})
export class InterviewerComponent {

}
