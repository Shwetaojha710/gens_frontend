import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JobService } from '../../services/job.service';
import { StatusService } from '../../services/status.service';
import { CandidateApplicationRecord, RecruitmentStageKey } from '../recruitment.models';

interface StageSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface RecentAppRow {
  id: string;
  shortId: string;
  name: string;
  jobTitle: string;
  stage: string;
  stageLabel: string;
  applied: string;
}

interface TopOpenJobRow {
  title: string;
  code: string;
}

interface InterviewSoon {
  name: string;
  jobTitle: string;
  when: string;
  sortKey: number;
}

@Component({
  selector: 'app-recuiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recuiter-dashboard.component.html',
  styleUrl: './recuiter-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecuiterDashboardComponent implements OnInit {
  loading = true;
  jobs: any[] = [];
  applications: CandidateApplicationRecord[] = [];

  openRoles = 0;
  totalCandidates = 0;
  interviewsActive = 0;
  offersOut = 0;
  hiredClosed = 0;
  newThisWeek = 0;

  stageSlices: StageSlice[] = [];
  donutGradient = 'conic-gradient(#e2e8f0 0% 100%)';

  deptBars: { label: string; count: number; pct: number }[] = [];

  recentRows: RecentAppRow[] = [];
  upcomingInterviews: InterviewSoon[] = [];
  topOpenJobs: TopOpenJobRow[] = [];

  readonly stageOrder: { key: RecruitmentStageKey; label: string; color: string }[] = [
    { key: 'candidate_applied', label: 'Applied', color: '#209af7' },
    { key: 'ats_screening', label: 'ATS / Screening', color: '#6366f1' },
    { key: 'shortlisted', label: 'Shortlisted', color: '#8b5cf6' },
    { key: 'interview_scheduled', label: 'Interview due', color: '#f59e0b' },
    { key: 'interview_in_progress', label: 'Interview live', color: '#ea580c' },
    { key: 'offered', label: 'Offered', color: '#22c55e' },
    { key: 'closed', label: 'Closed / Hired', color: '#0d9488' },
    { key: 'rejected', label: 'Rejected', color: '#94a3b8' },
    { key: 'job_requirement', label: 'Requirement', color: '#cbd5e1' },
    { key: 'posting', label: 'Posting', color: '#94a3b8' },
  ];

  constructor(
    private jobService: JobService,
    private statusService: StatusService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();

    forkJoin({
      jobs: this.jobService.getJobRequirements().pipe(
        catchError(() => of({ status: false, data: [] })),
      ),
      pipeline: this.jobService.getCandidatePipeline({}).pipe(
        catchError(() => of({ status: false, data: [] })),
      ),
    }).subscribe({
      next: ({ jobs, pipeline }) => {
        const p = pipeline as any;
        if (p.status === 'expired') {
          this.statusService.handleResponseStatus('expired', 'Session expired');
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }

        this.jobs = (jobs as any).status === true ? (jobs as any).data || [] : [];
        this.applications = p.status === true ? p.data || [] : [];

        this.computeAll();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private computeAll(): void {
    this.openRoles = this.jobs.filter((j) => this.isJobOpen(j)).length;
    this.totalCandidates = this.applications.length;

    this.interviewsActive = this.applications.filter((a) =>
      ['interview_scheduled', 'interview_in_progress'].includes(a.stage),
    ).length;

    this.offersOut = this.applications.filter((a) => a.stage === 'offered').length;
    this.hiredClosed = this.applications.filter((a) => a.stage === 'closed').length;

    const weekAgo = Date.now() - 7 * 86400000;
    this.newThisWeek = this.applications.filter((a) => {
      const t = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      return t >= weekAgo;
    }).length;

    this.buildStageSlices();
    this.buildDeptBars();
    this.buildRecent();
    this.buildUpcomingInterviews();
    this.buildTopOpenJobs();
  }

  private buildTopOpenJobs(): void {
    this.topOpenJobs = this.jobs
      .filter((j) => this.isJobOpen(j))
      .slice(0, 5)
      .map((j) => ({
        title: String(j.job_title || j.title || j.designation_name || j.role_name || 'Open role').trim(),
        code: String(j.job_code || j.company_job_code || j.id || '')
          .replace(/-/g, '')
          .slice(0, 10)
          .toUpperCase() || '—',
      }));
  }

  private isJobOpen(j: any): boolean {
    const s = String(j?.status || j?.job_status || '').toLowerCase();
    return s === 'active' || s === 'published' || j?.is_published === true || j?.published === true;
  }

  private buildStageSlices(): void {
    const counts = new Map<string, number>();
    for (const a of this.applications) {
      const k = a.stage || 'candidate_applied';
      counts.set(k, (counts.get(k) || 0) + 1);
    }

    this.stageSlices = this.stageOrder
      .map((s) => ({
        key: s.key,
        label: s.label,
        value: counts.get(s.key) || 0,
        color: s.color,
      }))
      .filter((x) => x.value > 0);

    const total = this.stageSlices.reduce((sum, x) => sum + x.value, 0) || 1;
    let acc = 0;
    const parts: string[] = [];
    for (const s of this.stageSlices) {
      const pct = (s.value / total) * 100;
      const start = acc;
      acc += pct;
      parts.push(`${s.color} ${start}% ${acc}%`);
    }
    this.donutGradient = parts.length ? `conic-gradient(${parts.join(', ')})` : 'conic-gradient(#e2e8f0 0% 100%)';
  }

  private buildDeptBars(): void {
    const map = new Map<string, number>();
    for (const a of this.applications) {
      const label = (a.department || a.job_title || 'General').trim() || 'General';
      map.set(label, (map.get(label) || 0) + 1);
    }
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = Math.max(...entries.map((e) => e[1]), 1);
    this.deptBars = entries.map(([label, count]) => ({
      label: label.length > 28 ? label.slice(0, 26) + '…' : label,
      count,
      pct: Math.round((count / max) * 100),
    }));
  }

  private stageLabel(stage: string): string {
    const f = this.stageOrder.find((s) => s.key === stage);
    return f?.label || stage.replace(/_/g, ' ');
  }

  private buildRecent(): void {
    const sorted = [...this.applications].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    this.recentRows = sorted.slice(0, 8).map((a) => ({
      id: a.id,
      shortId: a.id
        ? String(a.id)
            .replace(/-/g, '')
            .slice(-10)
            .toUpperCase()
        : '—',
      name: a.name || '—',
      jobTitle: a.job_title || '—',
      stage: a.stage,
      stageLabel: this.stageLabel(a.stage),
      applied: a.createdAt ? this.formatShortDate(a.createdAt) : '—',
    }));
  }

  private formatShortDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '—';
    }
  }

  private buildUpcomingInterviews(): void {
    const out: InterviewSoon[] = [];
    const now = Date.now();
    for (const a of this.applications) {
      const rounds = a.interview_rounds || [];
      for (const r of rounds) {
        if (!r.scheduled_at || r.status === 'cancelled') continue;
        const t = new Date(r.scheduled_at).getTime();
        if (t < now) continue;
        out.push({
          name: a.name || 'Candidate',
          jobTitle: a.job_title || '',
          when: this.formatShortDate(r.scheduled_at) + (r.round_name ? ` · ${r.round_name}` : ''),
          sortKey: t,
        });
      }
    }
    out.sort((a, b) => a.sortKey - b.sortKey);
    this.upcomingInterviews = out.slice(0, 5);
  }

  stagePillClass(stage: string): string {
    if (stage === 'offered' || stage === 'closed') return 'rd-pill-stage--success';
    if (stage === 'rejected') return 'rd-pill-stage--muted';
    if (stage?.includes('interview')) return 'rd-pill-stage--warn';
    return 'rd-pill-stage--primary';
  }
}
