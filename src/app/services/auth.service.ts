import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  baseurl =environment.apiUrl;
  loginUser(object: any): Observable<any> {
    return this.http.post(`${this.baseurl}login`, object, {
      withCredentials: true,
      responseType: 'text',
    });
  }
  //   logout(object: any): Observable<any> {
  //   return this.http.post(`${this.baseurl}logout`, object, {
  //     withCredentials: true,
  //     responseType: 'text',
  //   }
  // );
  // }
    logout(): Observable<any> {
    return this.http.post(`${this.baseurl}logout`, {});
  }

}
