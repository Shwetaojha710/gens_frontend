import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
baseUrl=environment.apiUrl
    constructor(private http: HttpClient) { }


    getDashboardData(): Observable<any> {
    return this.http.post(`${this.baseUrl}dashboard`, {});
  }
}
