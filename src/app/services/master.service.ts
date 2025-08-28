import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class MasterService {

  private baseUrl = environment.apiUrl || 'http://192.168.23.11:3001/api/';

  constructor(private http: HttpClient) { }

  // getDepartments(): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/departments`);
  // }
  getBaseUrl(): string {
  const PORT = localStorage.getItem('PORT')?.replace(/["\\,]/g, '') || '3002';
  return window.location.hostname == 'localhost'
    ? localStorage.getItem('base_url')?.replace(/["\\,]/g, '')|| ''
    : `http://${window.location.hostname}:${PORT}`;
}

  getDesignations(): Observable<any> {
    return this.http.post(`${this.baseUrl}getDesignations`, {});
  }
  getEmploymentTypes(): Observable<any> {
    return this.http.post(`${this.baseUrl}getEmpTypeDD`, {});
  }
  addDepartment(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createDepartment`, dept);
  }

  updateDepartment(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateDepartment`, dept);
  }
  getDepartments(): Observable<any> {
    return this.http.post(`${this.baseUrl}getDepartments`, {});
  }


  Departmentsdd(): Observable<any> {
    return this.http.post(`${this.baseUrl}department-dd`, {});
  }
  designationDD(obj:any): Observable<any> {
    return this.http.post(`${this.baseUrl}designation-dd`, obj);
  }

  deleteDepartment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteDepartment`, data);
  }
  deletedesignation(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteDesignation`, data);
  }
  adddesignation(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createDesignation`, dept);
  }
  updatedesignation(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateDesignation`, dept);
  }



  getEmployee(): Observable<any> {
    return this.http.post(`${this.baseUrl}getEmpTypes`, {});
  }

  addEmployee(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createEmpType`, dept);
  }

  updateEmployee(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}editEmpType`, dept);
  }

  deleteEmployee(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteEmpType`, data);
  }
  getshifts(): Observable<any> {
    return this.http.post(`${this.baseUrl}getShift`, {});
  }

  createShift(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createShift`, dept);
  }

  updateShift(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateShift`, dept);
  }

  deleteShift(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteShift`, data);
  }



  getDocument(obj:any): Observable<any> {
    return this.http.post(`${this.baseUrl}getDocument`, obj);
  }
  getDocumentType(): Observable<any> {
    return this.http.post(`${this.baseUrl}getDocumentType`, {});
  }

  addDocumenttype(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createDocumentType`, dept);
  }

  addDocument(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createDocument`, dept);
  }

  updateDocument(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}editDocument`, dept);
  }
  updateDocumentType(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateDocumentType`, dept);
  }

  deleteDocument(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteDocument`, data);
  }
  deleteDocumentType(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteDocumentType`, data);
  }

   getDocumentDD(): Observable<any> {
    return this.http.post(`${this.baseUrl}getDocumentDD`, {});
  }

addSalaryMaster(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}attendance-setting`, dept);
  }

 updateSalaryMaster(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}updateSalaryMaster`, dept);
  }

  deleteSalaryMaster(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteSalaryMaster`, data);
  }
   getAttendanceSetting(): Observable<any> {
    return this.http.post(`${this.baseUrl}get-attendance-setting`, {});
  }



  createLeave(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}create-leave`, dept);
  }
     getLeaveList(): Observable<any> {
    return this.http.post(`${this.baseUrl}get-leaves`, {});
  }

 updateLeave(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}update-leaves`, dept);
  }

  deleteLeave(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}delete-leaves`, data);
  }

  getemployeeList(): Observable<any> {
    return this.http.post(`${this.baseUrl}get-emp-list`, {});
  }
  getAttendanceYear(): Observable<any> {
    return this.http.post(`${this.baseUrl}get-attendance-year`, {});
  }
  getLeaveTypeList(): Observable<any> {
    return this.http.post(`${this.baseUrl}get-leave-type-dd`, {});
  }
   ApplyLeave(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}apply-leave`, dept);
  }
   UpdateApplyLeaveStatus(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}update-apply-leave-status`, dept);
  }
     getapplyLeaveList(): Observable<any> {
    return this.http.post(`${this.baseUrl}get-applied-leaves`, {});
  }


    getHolidayType(): Observable<any> {
    return this.http.post(`${this.baseUrl}getHolidayTypes`, {});
  }

  addHolidayType(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}createHolidayType`, dept);
  }

  updateHolidayType(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}editHolidayType`, dept);
  }

  deleteHolidayType(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}deleteHolidayType`, data);
  }
  getHolidayTypeDD(): Observable<any> {
     return this.http.post(`${this.baseUrl}getHolidayTypeDD`, {});
  }

  addPrefix(dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}add-prefix`, dept);
  }

  updatePrefix(id: any, dept: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}update-prefix`, dept);
  }

  deletePrefix(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}delete-prefix`, data);
  }
  getPrefix(): Observable<any> {
     return this.http.post(`${this.baseUrl}get-prefix`, {});
  }

//    getAttendanceSetting(): Observable<any> {
//     return this.http.post(`${this.baseUrl}get-attendance-setting`, {});
//   }
}
