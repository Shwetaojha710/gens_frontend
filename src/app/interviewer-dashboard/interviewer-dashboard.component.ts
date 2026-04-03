import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-interviewer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './interviewer-dashboard.component.html',
  styleUrls: ['./interviewer-dashboard.component.css']
})
export class InterviewerDashboardComponent implements OnInit {
  interviews = [
    { candidateName: 'John Doe', jobTitle: 'Senior Developer', roundName: 'Technical', scheduledAt: new Date(), status: 'pending', applicationId: '1' },
    { candidateName: 'Jane Smith', jobTitle: 'Designer', roundName: 'HR', scheduledAt: new Date(Date.now() - 86400000), status: 'completed', applicationId: '2' }
  ];
  stats = { scheduled: 5, pendingFeedback: 2, completed: 8, total: 15 };
  loading = false;

  ngOnInit() {}
}

