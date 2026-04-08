import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { RecruitmentStageKey, CandidateApplicationRecord, CandidatePipelinePayload, InterviewPanelUser } from '../recruitment.models';
import { StatusService } from '../../services/status.service';
import { Router } from '@angular/router';
import { SearchPaginationComponent } from '../../master/search-pagination/search-pagination.component';
import { InterviewService } from '../../services/interview.service';
import { Notyf } from 'notyf';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchPaginationComponent],
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationListComponent implements OnInit {
  applications: CandidateApplicationRecord[] = [];
  filteredApps: CandidateApplicationRecord[] = [];
  selectedApp: CandidateApplicationRecord | null = null;
  selectedDetailApp: CandidateApplicationRecord | null = null;
  loadingDetail = false;
  isLoading = false;
  isSaving = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  obj: CandidatePipelinePayload = {};

  editObj: any = {};
  notyf = new Notyf();

  // Assign interviewer
  panelUsers: InterviewPanelUser[] = [];
  interviewRounds: any[] = [];
  assignApp: CandidateApplicationRecord | null = null;
  isAssigning = false;

  // Per-round assignment
  roundAssignments: Array<{
    round_id: string | number;
    round_name: string;
    panel_user_id: string | number | null;
    scheduled_at: string;
    duration_minutes: number | null;
    mode: string;
    meeting_link: string;
    status: string;
    feedback_submitted: boolean;
  }> = [];

  sameInterviewerForAll = false;
  commonAssignFields: {
    panel_user_id: string | number | null;
    scheduled_at: string;
    duration_minutes: number | null;
    mode: string;
    meeting_link: string;
  } = { panel_user_id: null, scheduled_at: '', duration_minutes: null, mode: '', meeting_link: '' };

  constructor(
    private jobService: JobService,
    private statusService: StatusService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private interviewService: InterviewService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.loadPanelUsers();
    this.loadInterviewRounds();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.jobService.getCandidatePipeline(this.obj).subscribe({
      next: (res) => {
        const status = this.statusService.handleResponseStatus(res.status, 'OK');
        if (status === true) {
          this.applications = res.data || [];
          this.totalItems = this.applications.length;
          this.applyFilter();
        } else if (status === 'expired') {
          this.router.navigate(['login']);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadPanelUsers(): void {
    this.interviewService.listInterviewPanelUsers().subscribe({
      next: (res) => {
        if (res.status) {
          this.panelUsers = res.data || [];
          this.cdr.markForCheck();
        }
      }
    });
  }

  loadInterviewRounds(): void {
    this.interviewService.getInterviewRound().subscribe({
      next: (res) => {
        if (res.status) {
          this.interviewRounds = res.data || [];
          this.cdr.markForCheck();
        }
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.applyFilter();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilter();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.applyFilter();
  }

  private applyFilter(): void {
    let filtered = [...this.applications];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(app =>
        `${app.name} ${app.job_title} ${app.email} ${app.phone}`.toLowerCase().includes(this.searchTerm)
      );
    }

    this.totalItems = filtered.length;

    // Pagination
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredApps = filtered.slice(start, start + this.itemsPerPage);

    this.cdr.markForCheck();
  }

  getStageBadgeClass(stage: string): { [key: string]: boolean } {
    const badges: Record<string, string> = {
      'candidate_applied': 'bg-label-primary',
      'ats_screening': 'bg-label-info',
      'shortlisted': 'bg-label-success',
      'interview_scheduled': 'bg-label-warning',
      'interview_in_progress': 'bg-label-warning',
      'offered': 'bg-label-success',
      'closed': 'bg-label-danger',
      'rejected': 'bg-label-danger',
    };
    return { [`${badges[stage] || 'bg-label-secondary'} rounded-pill px-2 py-1 text-xs fw-semibold`]: true };
  }

  async viewApplication(app: CandidateApplicationRecord): Promise<void> {
    this.loadingDetail = true;
    this.selectedDetailApp = null;
    this.selectedApp = app;
    this.cdr.markForCheck();

    try {
      const res = await this.jobService.getCandidateApplicationById(app.id).toPromise();
      if (res?.status) {
        this.selectedDetailApp = res.data;
        this.cdr.markForCheck();
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      this.loadingDetail = false;
      this.openModal();
      this.cdr.markForCheck();
    }
  }


  editApplication(app: CandidateApplicationRecord): void {
    this.editObj = {
      application_id: app.id,
      name: app.name,
      email: app.email,
      phone: app.phone,
      current_company: app.current_company || '',
      last_company: (app as any).last_company || '',
      experience: app.experience,
      current_ctc: app.current_ctc,
      expected_ctc: app.expected_ctc,
      notice_period: app.notice_period,
      current_location: (app as any).current_location || '',
      relocate: (app as any).relocate || '',
      relocateEnabled: !!(app as any).relocate || false,
      home_town: (app as any).home_town || '',
      skills: Array.isArray(app.skills) ? app.skills.join(', ') : (app.skills || ''),
      roles_and_responsibilities: (app as any).roles_and_responsibilities || '',
      project: (app as any).project || '',
      tools: (app as any).tools || '',
      offer_in_hand: (app as any).offer_in_hand || '',
      offerInHandEnabled: !!(app as any).offer_in_hand || false,
      family_background: (app as any).family_background || '',
      highest_qualification: (app as any).highest_qualification || '',
      remark: (app as any).remark || '',
    };

    this.openEditModal();
  }

  openEditModal(): void {
    const el = document.getElementById('editApplicationModal');
    if (el) (window as any).bootstrap.Modal.getOrCreateInstance(el).show();
  }

  closeEditModal(): void {
    const el = document.getElementById('editApplicationModal');
    if (el) {
      const m = (window as any).bootstrap.Modal.getInstance(el);
      if (m) m.hide();
    }
    this.editObj = { relocateEnabled: false, offerInHandEnabled: false };
    this.cdr.markForCheck();
  }


  saveEdit(): void {
    if (!this.editObj.name?.trim() || !this.editObj.email?.trim() || !this.editObj.phone?.trim()) {
      this.notyf.error('Name, email and phone are required');
      return;
    }

    const payload = {
      ...this.editObj,
      skills: this.editObj.skills
        ? String(this.editObj.skills).split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      relocate: this.editObj.relocateEnabled ? (this.editObj.relocate || null) : null,
      offer_in_hand: this.editObj.offerInHandEnabled ? (this.editObj.offer_in_hand || null) : null,
    };


    this.isSaving = true;
    this.cdr.markForCheck();

    this.jobService.updateCandidateApplication(payload).subscribe({
      next: (res: any) => {
        const status = this.statusService.handleResponseStatus(res.status, res.message);
        if (status === true) {
          this.notyf.success(res.message || 'Application updated successfully');
          this.closeEditModal();
          this.loadApplications();
        } else if (status === 'expired') {
          this.router.navigate(['login']);
        } else {
          this.notyf.error(res.message || 'Update failed');
        }
        this.isSaving = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.notyf.error(err?.error?.message || 'Error updating application');
        this.isSaving = false;
        this.cdr.markForCheck();
      }
    });
  }

  openModal(): void {
    const modalElement = document.getElementById('applicationDetailsModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('applicationDetailsModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    this.selectedDetailApp = null;
    this.cdr.markForCheck();
  }

  getStageDisplay(stage: RecruitmentStageKey): string {
    const display: Record<RecruitmentStageKey, string> = {
      'job_requirement': 'Job Requirement',
      'posting': 'Posting',
      'candidate_applied': 'Candidate Applied',
      'ats_screening': 'ATS Screening',
      'shortlisted': 'Shortlisted',
      'interview_scheduled': 'Interview Scheduled',
      'interview_in_progress': 'Interview In Progress',
      'offered': 'Offered',
      'closed': 'Closed',
      'rejected': 'Rejected'
    };
    return display[stage] || stage.replace('_', ' ').toUpperCase();
  }

  updateStage(app: CandidateApplicationRecord, stage: string): void {
    const payload = { application_id: app.id, stage: stage as RecruitmentStageKey };
    this.jobService.updateCandidateStage(payload).subscribe({
      next: (res) => {
        this.statusService.handleResponseStatus(res.status, 'Stage updated');
        this.loadApplications();
      }
    });
  }

  // ATS Resume Evaluate (file upload)
  atsApp: CandidateApplicationRecord | null = null;
  atsFile: File | null = null;
  atsFileName = '';
  atsResult: any = null;
  isEvaluating = false;

  // ATS Evaluate by Resume URL
  atsUrlApp: CandidateApplicationRecord | null = null;
  atsUrlResult: any = null;
  isUrlEvaluating = false;

  // Normalize any ATS response shape to the new structure
  normalizeAtsResult(raw: any): any {
    if (!raw) return null;
    let r = raw?.data ?? raw;
    // URL response: { results: [...], errors: [...], count, job_post_id }
    if (Array.isArray(r?.results) && r.results.length > 0) {
      r = r.results[0];
    } else if (Array.isArray(r?.errors) && r.errors.length > 0) {
      // evaluation failed — return an error marker
      return { _error: r.errors[0]?.error || 'Evaluation failed', _resumeUrl: r.errors[0]?.resume_url };
    }
    // already new format
    if (r?.overall_score !== undefined) return r;
    // legacy format — map old fields to new structure
    return {
      overall_score: r?.ats_score ?? r?.final_score ?? null,
      match_level: null,
      breakdown: {
        skills: {
          score: r?.ats_score ?? null,
          matched: r?.matched_skills ?? [],
          missing: r?.missing_skills ?? [],
          extra: []
        },
        experience: { score: null, details: `${r?.experience_years ?? ''} years` },
        education: { score: null, details: '' },
        keywords: { score: null, matched: [], missing: [] },
        certifications: { score: null, details: '' }
      },
      strengths: [],
      weaknesses: [],
      recommendations: [],
      final_summary: r?.summary ?? ''
    };
  }

  getMatchLevelClass(level: string): string {
    switch ((level || '').toLowerCase()) {
      case 'high':   return 'text-success';
      case 'medium': return 'text-warning';
      case 'low':    return 'text-danger';
      default:       return 'text-secondary';
    }
  }

  getScoreBarClass(score: number): string {
    if (score >= 75) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  openAtsModal(app: CandidateApplicationRecord): void {
    this.atsApp = app;
    this.atsFile = null;
    this.atsFileName = '';
    this.atsResult = null;
    this.isEvaluating = false;
    this.cdr.markForCheck();
    const el = document.getElementById('atsEvaluateModal');
    if (el) (window as any).bootstrap.Modal.getOrCreateInstance(el).show();
  }

  closeAtsModal(): void {
    const el = document.getElementById('atsEvaluateModal');
    if (el) (window as any).bootstrap.Modal.getInstance(el)?.hide();
    this.atsApp = null;
    this.atsFile = null;
    this.atsFileName = '';
    this.atsResult = null;
    this.cdr.markForCheck();
  }

  onAtsFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.atsFile = file;
    this.atsFileName = file?.name || '';
    this.atsResult = null;
    this.cdr.markForCheck();
  }

  runAtsEvaluate(): void {
    if (!this.atsFile) {
      this.notyf.error('Please select a resume file');
      return;
    }
    this.isEvaluating = true;
    this.atsResult = null;
    this.cdr.markForCheck();

    const jobDescription = this.atsApp ? {
      job_title: this.atsApp.job_title,
      department: (this.atsApp as any).department,
      skills: this.atsApp.skills,
      experience: this.atsApp.experience
    } : undefined;

    this.jobService.evaluateResumeFromFile(this.atsFile, {
      candidate_id: this.atsApp?.candidate_id || this.atsApp?.id,
      job_id: this.atsApp?.job_id,
      job_posting_id: this.atsApp?.job_posting_id,
      job_description: jobDescription
    }).subscribe({
      next: (res: any) => {
        this.atsResult = res;
        this.isEvaluating = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.notyf.error(err?.error?.message || 'ATS evaluation failed');
        this.isEvaluating = false;
        this.cdr.markForCheck();
      }
    });
  }

  openAtsUrlModal(app: CandidateApplicationRecord): void {
    this.atsUrlApp = app;
    this.atsUrlResult = null;
    this.isUrlEvaluating = false;
    this.cdr.markForCheck();
    const el = document.getElementById('atsUrlEvaluateModal');
    if (el) (window as any).bootstrap.Modal.getOrCreateInstance(el).show();
  }

  closeAtsUrlModal(): void {
    const el = document.getElementById('atsUrlEvaluateModal');
    if (el) (window as any).bootstrap.Modal.getInstance(el)?.hide();
    this.atsUrlApp = null;
    this.atsUrlResult = null;
    this.cdr.markForCheck();
  }

  runAtsEvaluateByUrl(): void {
    if (!this.atsUrlApp?.resume_url) {
      this.notyf.error('No resume URL available for this candidate');
      return;
    }

    this.isUrlEvaluating = true;
    this.atsUrlResult = null;
    this.cdr.markForCheck();

    const jobDescription = {
      job_title: this.atsUrlApp.job_title,
      department: (this.atsUrlApp as any).department,
      skills: this.atsUrlApp.skills,
      experience: this.atsUrlApp.experience
    };

    this.jobService.evaluateResumeFromUrl({
      job_post_id: this.atsUrlApp.job_posting_id!,
      job_description: jobDescription,
      resumes: [{ candidate_id: this.atsUrlApp.candidate_id || this.atsUrlApp.id, resume_url: this.atsUrlApp.resume_url! }]
    }).subscribe({
      next: (res: any) => {
        this.atsUrlResult = res;
        this.isUrlEvaluating = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.notyf.error(err?.error?.message || 'ATS URL evaluation failed');
        this.isUrlEvaluating = false;
        this.cdr.markForCheck();
      }
    });
  }

  getInterviewerPhone(round: any): string {
    if (round?.interviewer_phone) return round.interviewer_phone;
    if (!round?.interviewer_id) return '';
    const user = this.panelUsers.find(u => String(u.id) === String(round.interviewer_id));
    return user?.mobile_no || '';
  }

  // Quick actions
  shortlist(app: CandidateApplicationRecord): void {
    this.updateStage(app, 'shortlisted');
  }

  reject(app: CandidateApplicationRecord): void {
    this.updateStage(app, 'rejected');
  }

  // Assign interviewer
  openAssignModal(app: CandidateApplicationRecord): void {
    this.assignApp = app;
    this.sameInterviewerForAll = false;
    this.commonAssignFields = { panel_user_id: null, scheduled_at: '', duration_minutes: null, mode: '', meeting_link: '' };

    // Use interview_rounds already present in the application (from admin-pipeline API)
    const rounds: any[] = app.interview_rounds || [];
    this.roundAssignments = rounds.map(r => ({
      round_id: r.round_id,
      round_name: r.round_name,
      panel_user_id: r.interviewer_id || null,
      scheduled_at: r.scheduled_at || '',
      duration_minutes: r.duration_minutes || null,
      mode: r.mode || '',
      meeting_link: r.meeting_link || '',
      status: r.status || 'pending',
      feedback_submitted: r.feedback_submitted || false
    }));

    this.cdr.markForCheck();
    const el = document.getElementById('assignInterviewerModal');
    if (el) (window as any).bootstrap.Modal.getOrCreateInstance(el).show();
  }

  closeAssignModal(): void {
    const el = document.getElementById('assignInterviewerModal');
    if (el) {
      const m = (window as any).bootstrap.Modal.getInstance(el);
      if (m) m.hide();
    }
    this.assignApp = null;
    this.roundAssignments = [];
    this.sameInterviewerForAll = false;
    this.commonAssignFields = { panel_user_id: null, scheduled_at: '', duration_minutes: null, mode: '', meeting_link: '' };
    this.cdr.markForCheck();
  }

  applyCommonToAll(): void {
    this.roundAssignments = this.roundAssignments.map(r => ({
      ...r,
      panel_user_id: this.commonAssignFields.panel_user_id ?? r.panel_user_id,
      scheduled_at: this.commonAssignFields.scheduled_at || r.scheduled_at,
      duration_minutes: this.commonAssignFields.duration_minutes ?? r.duration_minutes,
      mode: this.commonAssignFields.mode || r.mode,
      meeting_link: this.commonAssignFields.meeting_link || r.meeting_link
    }));
    this.cdr.markForCheck();
  }

  confirmAssign(): void {
    if (!this.assignApp) return;

    const toAssign = this.roundAssignments.filter(r => r.panel_user_id);
    if (toAssign.length === 0) {
      this.notyf.error('Please select at least one interviewer');
      return;
    }

    this.isAssigning = true;
    this.cdr.markForCheck();

    const calls = toAssign.map(r =>
      this.interviewService.assignInterviewer({
        application_id: this.assignApp!.id,
        panel_user_id: r.panel_user_id!,
        round_id: r.round_id,
        scheduled_at: r.scheduled_at || null,
        duration_minutes: r.duration_minutes,
        mode: r.mode || null,
        meeting_link: r.meeting_link || null
      })
    );

    forkJoin(calls).subscribe({
      next: () => {
        // After assigning, determine the new stage:
        // If every round is completed with feedback → offered
        // Otherwise → interview_scheduled
        const allDone = this.roundAssignments.length > 0 &&
          this.roundAssignments.every(r => r.feedback_submitted || r.status === 'completed');
        const newStage = allDone ? 'offered' : 'interview_scheduled';
        this.updateStage(this.assignApp!, newStage);

        this.notyf.success(`${toAssign.length} round(s) assigned — stage updated to ${newStage.replace('_', ' ')}`);
        this.closeAssignModal();
        this.loadApplications();
        this.isAssigning = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.notyf.error(err?.error?.message || 'Error assigning interviewers');
        this.isAssigning = false;
        this.cdr.markForCheck();
      }
    });
  }
}
