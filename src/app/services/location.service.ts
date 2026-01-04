import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LocationService {

  private baseUrl = environment.apiUrl || 'http://192.168.23.11:3001/api/';


  constructor(private http: HttpClient) {}

  getLatestLocations(obj:any): Observable<any> {
    return this.http.post(`${this.baseUrl}track-location-history`, obj);
  }

  getActiveTrackingUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}active-location-emp`);
  }

  getAddressFromCoords(lat: number, lng: number) {
  return this.http.get<any>(
    `https://nominatim.openstreetmap.org/reverse`,
    {
      params: {
        format: 'json',
        lat,
        lon: lng
      }
    }
  );
}

  getAddressFromGlobalVTS(lat: number, lng: number): Observable<any> {
    return this.http.get<any>(
      `https://s3-api.globalvts.in/api/Geocode/GetAddress/${lat}/${lng}`
    );
  }

}
