import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../services/interview.service';
import { StatusService } from '../services/status.service';
import { Router } from '@angular/router';
import { Notyf } from 'notyf';

interface AssignedInterview {
  round_id: string;
  round_master_id: string;
  application_id: string;
  round_name: string;
  round_type: string;
  sequence: number;
  total_rounds: number;
  scheduled_at: string;
  duration_minutes: number;
  mode: string;
  meeting_link: string;
  status: string;
  feedback_submitted: boolean;
  is_unlocked: boolean;
  candidate: { name: string; email: string; phone: string; experience: string };
  job: { job_title: string; department: string };
}

interface FeedbackForm {
  application_id: string;
  round_id: string;
  interviewer_name: string;
  interviewer_email: string;
  rating: number;
  recommendation: string;
  strengths: string;
  concerns: string;
  notes: string;
}

@Component({
  selector: 'app-interviewer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './interviewer-dashboard.component.html',
  styleUrls: ['./interviewer-dashboard.component.css']
})
export class InterviewerDashboardComponent implements OnInit {
  currentUser: any = {};
  loading = false;
  notyf = new Notyf();

  assignedInterviews: AssignedInterview[] = [];
  stats = { total: 0, scheduled: 0, pending_feedback: 0, completed: 0 };

  // Feedback modal
  showFeedbackModal = false;
  selectedInterview: AssignedInterview | null = null;
  feedbackForm: FeedbackForm = {
    application_id: '',
    round_id: '',
    interviewer_name: '',
    interviewer_email: '',
    rating: 3,
    recommendation: 'selected',
    strengths: '',
    concerns: '',
    notes: ''
  };
  isSubmittingFeedback = false;
  stars = [1, 2, 3, 4, 5];

  constructor(
    private interviewService: InterviewService,
    private statusService: StatusService,
    private router: Router
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  }

  ngOnInit(): void {
    this.loadMyInterviews();
  }

  loadMyInterviews(): void {
    this.loading = true;
    this.interviewService.getMyInterviews().subscribe({
      next: (res: any) => {
        const status = this.statusService.handleResponseStatus(res.status);
        if (status === true) {
          this.assignedInterviews = res.data?.interviews || [];
          this.stats = res.data?.stats || { total: 0, scheduled: 0, pending_feedback: 0, completed: 0 };
        } else if (status === 'expired') {
          this.router.navigate(['login']);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notyf.error('Failed to load interviews');
      }
    });
  }

  openFeedbackModal(item: AssignedInterview): void {
    this.selectedInterview = item;
    const name = [this.currentUser.first_name, this.currentUser.last_name].filter(Boolean).join(' ')
      || this.currentUser.name || this.currentUser.email || '';
    this.feedbackForm = {
      application_id: item.application_id,
      round_id: item.round_id,
      interviewer_name: name,
      interviewer_email: this.currentUser.email || '',
      rating: 3,
      recommendation: 'selected',
      strengths: '',
      concerns: '',
      notes: ''
    };
    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.selectedInterview = null;
  }

  setRating(star: number): void {
    this.feedbackForm.rating = star;
  }

  submitFeedback(): void {
    if (!this.feedbackForm.rating || !this.feedbackForm.recommendation) {
      this.notyf.error('Please provide rating and recommendation');
      return;
    }

    this.isSubmittingFeedback = true;
    this.interviewService.panelSaveFeedback(this.feedbackForm as any).subscribe({
      next: (res: any) => {
        if (res.status === true) {
          this.notyf.success('Feedback submitted successfully');
          this.closeFeedbackModal();
          this.loadMyInterviews();
        } else {
          this.notyf.error(res.message || 'Failed to submit feedback');
        }
        this.isSubmittingFeedback = false;
      },
      error: (err: any) => {
        this.notyf.error(err?.error?.message || 'Error submitting feedback');
        this.isSubmittingFeedback = false;
      }
    });
  }

  getStatusClass(item: AssignedInterview): string {
    if (item.feedback_submitted || item.status === 'completed') return 'bg-success';
    if (item.status === 'scheduled') return 'bg-warning';
    if (item.status === 'cancelled') return 'bg-danger';
    return 'bg-secondary';
  }

  getStatusLabel(item: AssignedInterview): string {
    if (item.feedback_submitted || item.status === 'completed') return 'Completed';
    if (item.status === 'scheduled') return 'Scheduled';
    if (item.status === 'cancelled') return 'Cancelled';
    return item.status || 'Pending';
  }
}
