import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { LocationService } from '../services/location.service';
// import { Notyf } from 'notyf';
import { StatusService } from '../services/status.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SearchPaginationComponent } from '../master/search-pagination/search-pagination.component';
import { CommonModule } from '@angular/common';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css'],
  imports: [FormsModule, CommonModule, NgSelectModule, SearchPaginationComponent]
})
export class TrackingComponent implements OnInit {

  map!: L.Map;
  markers: L.Marker[] = [];
  polyline!: L.Polyline;
  // notyf: Notyf;
  constructor(private locationService: LocationService,public statusService: StatusService, private router: Router,private master: MasterService,) {
    // this.notyf = new Notyf();
  }

  ngOnInit(): void {
    this.activeTrackingUsers();
    this.initMap();
    // this.loadAndPlotData();
       this.baseurl = this.master.getBaseUrl();
  }
    pageSize = 10;
  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';
  onSearch(term: string) {
    if (!term) {
      this.searchText=''
      this.activeTrackingUsers()
    } else {
      this.searchTerm = term.toLowerCase();
      this.currentPage = 1;
      this.applyFilters();
    }

    // this.loadEmployees()
  }

  viewTrackingOnMap(user: any) {
    // this.viewLiveTracking = false;
    // this.initMap();
    // this.loadAndPlotData(user);
  if (!user) {
    console.warn('User is undefined');
    return;
  }

  this.viewLiveTracking = false;

  setTimeout(() => {
    this.initMap();
    this.loadAndPlotData(user);
  });


    // this.map.setView([user.latitude, user.longitude], 13);
    // L.marker([user.latitude, user.longitude])
    //   .addTo(this.map)
    //   .bindPopup(`
    //     <b>${user.name}</b><br/>
    //     Lat: ${user.latitude}<br/>
    //     Lng: ${user.longitude}<br/>
    //     Time: ${new Date(user.tracked_at).toLocaleString()}
    //   `)
    //   .openPopup();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.applyFilters();
  }
  filteredDesignation: any = []
  searchText: any = ''
  originalList: any = []
  applyFilters() {
    let data = [...this.ActiveUsers];
    const value = this.searchTerm || '';
    this.searchText = value.trim();
    if (this.searchText === '') {
      this.ActiveUsers = [...this.originalList];
    } else {
      this.ActiveUsers = this.originalList.filter((item: any) =>
        JSON.stringify(item).toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
    // pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredDesignation = data.slice(start, end);
  }
    baseurl:any;
  ActiveUsers: any = [];
  viewLiveTracking: boolean = true;
  activeTrackingUsers() {
      this.ActiveUsers = [];
      this.locationService.getActiveTrackingUsers().subscribe({
        next: (response: any) => {
          let message = response.message ? response.message : 'Data found Successfully';
          let status = this.statusService.handleResponseStatus(response.status, message);
          if (status === true) {
            this.ActiveUsers = [];
            // this.notyf.success(message)
            response.data=response.data.map((item: any,index:any) => {
              return {
                ...item,
               si_no: index + 1,
               profileImage:  item.profileImage ? `${this.baseurl}${item?.profileImage}` : item.gender =='Female'?"../../assets/img/avatars/2.png":'../../assets/img/avatars/1.png'

              }
            }
            );
            this.ActiveUsers = response.data;
            console.log(this.ActiveUsers);
          }
          else if (status === "expired") {
            this.router.navigate(["login"]);
          }
          else {
            // this.notyf.error(message)
          }
        },
        error: (err) => {
          console.error('Error:', err);
          // this.notyf.error(err.error?.message)
        }
      });


  }

  initMap() {

    this.map = L.map('map', {
    minZoom: 2,
    maxZoom: 30,
    zoomControl: true
  }).setView([26.8687564, 81.006653], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    minZoom: 2,
    maxZoom: 30
  }).addTo(this.map);



    // this.map = L.map('map').setView([26.8687564, 81.006653], 8);
    // // this.map = L.map('map').setView([10.5937, 10.9629], 5); // Centered on India
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '© OpenStreetMap'
    // }).addTo(this.map);
  }

  loadAndPlotData(user: any) {
    const employeeId = user ? user.id : null;
    const obj:any={}
    if(employeeId){
      obj['employeeId']=employeeId
    }
  this.locationService.getLatestLocations(obj).subscribe(res => {
    if (!res?.data) return;

    const colors = ['red', 'blue', 'green', 'purple', 'orange', 'brown'];
    let colorIndex = 0;

    Object.keys(res.data).forEach((employeeId) => {
      const points = res.data[employeeId];
      if (!points.length) return;

      const route: L.LatLngExpression[] = points.map((p: any) => [
        p.latitude,
        p.longitude
      ]);

      const color = colors[colorIndex % colors.length];
      colorIndex++;

      // Polyline for employee
      const polyline = L.polyline(route, {
        color,
        weight: 4
      }).addTo(this.map);

      // Markers
      points.forEach((p: any, index: number) => {
        const label =
          index === 0 ? 'START' :
          index === points.length - 1 ? 'END' :
          `Point ${index + 1}`;

        L.marker([p.latitude, p.longitude])
          .addTo(this.map)
          .bindPopup(`
            <b>${label}</b><br/>
            <b>Employee:</b> ${employeeId}<br/>
            Lat: ${p.latitude}<br/>
            Lng: ${p.longitude}<br/>
            Time: ${new Date(p.tracked_at).toLocaleString()}
          `);
      });

      this.map.fitBounds(polyline.getBounds());
    });
  });
}

}
