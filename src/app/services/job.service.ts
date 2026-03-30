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

  // getDepartments(): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/departments`);
  // }
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
  getJobRequirements(obj: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}getJobRequirements`, obj);
  }
  deleteJobRequirement(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}deleteJobRequirement`, dept);
  }
  skillsDD(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}get-skills`, dept);
  }

  // frontend/src/app/services/index.ts — add to JobService
  generateLink(jobId: string, baseUrl: string, expiresDays = 21) {
    return this.http.post<{ url: string; token: string; expires: string }>(
      `${baseUrl}/jobs/${jobId}/generate-link`,
      { base_url: baseUrl, expires_days: expiresDays }
    );
  }

  // // In jobs.component.ts
  // copyLink(job: JobPosition) {
  //   this.jobSvc.generateLink(job.id, 'https://careers.yourcompany.com/apply')
  //     .subscribe(({ url }) => {
  //       navigator.clipboard.writeText(url);
  //       this.toast = 'Link copied!';
  //     });
  // }
}
