import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private baseUrl = environment.apiUrl || 'http://192.168.23.11:3001/api/';

  constructor(private http: HttpClient) { }
  getattendancelist(obj: any): Observable<any> {
    return this.http.post(`${this.baseUrl}get-emp-attendance`, obj);
  }
  getHolidayList(): Observable<any> {
    return this.http.post(`${this.baseUrl}get-holidayList`, {});
  }
  addHoliday(obj: any): Observable<any> {
    return this.http.post(`${this.baseUrl}add-holiday`, obj);
  }
  updateHoliday(obj: any): Observable<any> {
    return this.http.post(`${this.baseUrl}update-holiday`, obj);
  }
  deleteHoliday(obj: any): Observable<any> {
    return this.http.post(`${this.baseUrl}delete-holiday`, obj);
  }
  deleteAttendance(obj: any): Observable<any> {
    return this.http.post(`${this.baseUrl}delete-attendance`, obj);
  }
    getdateWiseAttendance(obj: any): Observable<any> {
    return this.http.post(`${this.baseUrl}get-date-wise-attendance`, obj);
  }
  updateAttendance(obj: any): Observable<any> {
    return this.http.post(`${this.baseUrl}update-attendance`, obj);
  }
}
