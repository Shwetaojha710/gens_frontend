import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}
