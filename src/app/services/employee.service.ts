import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class EmployeeService {

baseUrl=environment.apiUrl

  constructor(private http: HttpClient) {}
//  newUrl='http://192.168.23.17:3002/api/'
  createEmp(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}createEmp`, data);
  }

  getEmp(): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}getEmp`,{});
  }

  getCountry(): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}getCountryDD`,{});
  }

  getEmploymentTypes(): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}getemptypesDD`,{});
  }
  getStates(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}getStateDD`, data);
  }
  getCities(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}getCityDD`, data);
  }

  updateEmp(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}updateEmp`, data);
  }
  //   updateEmp(data: any): Observable<any> {
  //   return this.http.post(`http://192.168.23.17:3002/api/updateEmp`, data);
  // }

  uploadImage(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}uploadImage`, data);
  }
pythonregister(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/register`, data);
}

getUploadImage(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}getUploadImage`, data);
  }
  deleteEmp(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteEmp`,id);
  }



   addexperience(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createWorkExp`, dept);
  }

  updateexperience(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateWorkExp`, dept);
  }


  deleteexperience(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteWorkExp`, data);
  }


   getexperiences(obj:any): Observable<any> {
    return this.http.post(`${this.baseUrl}getWorkExp`, obj);
  }


addBank(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createBank`, dept);
  }

  updateBank(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateBank`, dept);
  }


  deleteBank(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteBank`, data);
  }


   getBanks(obj:any): Observable<any> {
    return this.http.post(`${this.baseUrl}getBank`, obj);
  }
   getcomponent(obj:any): Observable<any> {
    return this.http.post(`${this.baseUrl}getBasicSalaryEmployee`, obj);
  }

  assignedLeave(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}assign-leave`, data);
  }

   getAssignLeaveList(obj:any): Observable<any> {
    return this.http.post(`${this.baseUrl}get-leave-by-emp`, obj);
  }


}
