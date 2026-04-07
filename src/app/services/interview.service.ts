import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InterviewFeedbackPayload,
  InterviewPanelUser,
  InterviewRoundPlan,
  InterviewSchedulePayload
} from '../recruitment/recruitment.models';
@Injectable({
  providedIn: 'root'
})
export class InterviewService {

 private baseUrl = environment.apiUrl || 'http://192.168.23.11:3001/api/';

  constructor(private http: HttpClient) { }
  getBaseUrl(): string {
    const PORT = localStorage.getItem('PORT')?.replace(/["\\,]/g, '') || '3002';
    return window.location.hostname == 'localhost'
      ? localStorage.getItem('base_url')?.replace(/["\\,]/g, '') || ''
      : localStorage.getItem('base_url')?.replace(/["\\,]/g, '') || '';
  }

  addInterviewRound(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createInterviewRound`, dept);
  }
  updateInterviewRound(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateInterviewRound`, dept);
  }
  getInterviewRound(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}listInterviewRounds`, {});
  }
  deleteInterviewRound(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}deleteInterviewRound`, dept);
  }


  addRoundType(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createRoundType`, dept);
  }
  updateRoundType(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateRoundType`, dept);
  }
  getRoundType(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}listRoundTypes`, {});
  }
  deleteRoundType(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}deleteRoundType`, dept);
  }
  listRoundTypesDD(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}listRoundTypesDD`, {});
  }

  getInterviewSchedule(applicationId: string): Observable<{ status: boolean; data: InterviewRoundPlan[] }> {
    return this.http.post<{ status: boolean; data: InterviewRoundPlan[] }>(
      `${this.baseUrl}interview-schedule-detail`,
      { application_id: applicationId }
    );
  }

  saveInterviewSchedule(payload: InterviewSchedulePayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}save-interview-schedule`, payload);
  }

  saveInterviewFeedback(payload: InterviewFeedbackPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}save-interview-feedback`, payload);
  }

  createInterviewPanelUser(payload: InterviewPanelUser): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createInterviewPanelUser`, payload);
  }

  updateInterviewPanelUser(payload: InterviewPanelUser): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateInterviewPanelUser`, payload);
  }

  listInterviewPanelUsers(): Observable<{ status: boolean; data: InterviewPanelUser[] }> {
    return this.http.post<{ status: boolean; data: InterviewPanelUser[] }>(`${this.baseUrl}listInterviewPanelUsers`, {});
  }

  deleteInterviewPanelUser(payload: { id: string | number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}deleteInterviewPanelUser`, payload);
  }

  assignInterviewer(payload: {
    application_id: string;
    panel_user_id: string | number;
    round_id?: string | number | null;
    scheduled_at?: string | null;
    duration_minutes?: number | null;
    mode?: string | null;
    meeting_link?: string | null;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}assign-interviewer`, payload);
  }
}
