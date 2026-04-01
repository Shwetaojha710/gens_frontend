import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private baseUrl = environment.apiUrl || 'http://192.168.23.11:3001/api/';

  constructor(private http: HttpClient) { }

  getBaseUrl(): string {
    const PORT = localStorage.getItem('PORT')?.replace(/["\\,]/g, '') || '3002';
    return window.location.hostname == 'localhost'
      ? localStorage.getItem('base_url')?.replace(/["\\,]/g, '') || ''
      : localStorage.getItem('base_url')?.replace(/["\\,]/g, '') || '';
  }

  ApplyJobRequirement(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createJobRequirement`, dept);
  }

  updateJobRequirement(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateJobRequirement`, dept);
  }

  PublishJob(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}publishJob`, dept);
  }

  getJobRequirements(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}getJobRequirements`, {});
  }

  deleteJobRequirement(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}deleteJobRequirement`, dept);
  }

  skillsDD(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}get-skills`, dept);
  }

  getPublicJobPosting(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}candidate/public-job-posting`, payload);
  }

  checkDuplicateCandidateApplication(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}candidate/check-duplicate-application`, payload);
  }

  submitCandidateApplication(payload: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}candidate/submit-application`, payload);
  }

  generateLink(jobId: string, baseUrl: string, expiresDays = 21) {
    return this.http.post<{ url: string; token: string; expires: string }>(
      `${baseUrl}/jobs/${jobId}/generate-link`,
      { base_url: baseUrl, expires_days: expiresDays }
    );
  }
}
