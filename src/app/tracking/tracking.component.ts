import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { LocationService } from '../services/location.service';
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
export class TrackingComponent implements OnInit, OnDestroy {

  map!: L.Map;
  markers: L.Marker[] = [];
  arrowMarkers: L.Marker[] = [];
  polyline!: L.Polyline;
  currentTileLayer!: L.TileLayer;
  mapType: string = 'osm'; 
  isLiveTrackingEnabled: boolean = false;
  liveTrackingInterval: any = null;
  currentTrackingUser: any = null;
  liveTrackingIntervalSeconds: number = 5; 
  constructor(private locationService: LocationService,public statusService: StatusService, private router: Router,private master: MasterService,) {
  }

  ngOnInit(): void {
    this.activeTrackingUsers();
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

  }

  viewTrackingOnMap(user: any) {
  if (!user) {
    console.warn('User is undefined');
    return;
  }

  this.viewLiveTracking = false;
  this.currentTrackingUser = user;
  this.isLiveTrackingEnabled = false; 
  this.stopLiveTracking(); 

  setTimeout(() => {
    if (!this.map) {
      this.initMap();
    } else {
      this.clearMap();
    }
    this.loadAndPlotData(user);
  });
  }

  clearMap() {
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = [];

    this.arrowMarkers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.arrowMarkers = [];

    if (this.polyline) {
      this.map.removeLayer(this.polyline);
    }

    this.map.eachLayer((layer) => {
      if (layer !== this.currentTileLayer) {
        this.map.removeLayer(layer);
      }
    });
  }

  createCustomIcon(color: string, label: string): L.DivIcon {
    const size = label === 'START' ? 30 : 30;
    const bgColor = color;
    const textColor = 'white';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${bgColor};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: ${textColor};
            font-weight: bold;
            font-size: 12px;
            text-align: center;
          ">${label === 'START' ? 'S' : 'E'}</div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size]
    });
  }

  
  createArrowIcon(bearing: number): L.DivIcon {
    const rotation = bearing - 90;
    
    const uniqueId = 'arrowGlow' + Math.random().toString(36).substr(2, 9);
    
    const arrowSvg = `
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="${uniqueId}">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g transform="rotate(${rotation} 9 9)">
          <path d="M 3 9 L 15 9 M 9 3 L 15 9 L 9 15" 
                stroke="#ff4500" 
                stroke-width="2.5" 
                fill="none" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                filter="url(#${uniqueId})"/>
        </g>
      </svg>
    `;
    
    return L.divIcon({
      className: 'arrow-marker',
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 2px rgba(255,255,255,0.9));
        ">${arrowSvg}</div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }

  calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return bearing;
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
          }
        },
        error: (err) => {
          console.error('Error:', err);
        }
      });


  }

  initMap() {

    this.map = L.map('map', {
    minZoom: 2,
    maxZoom: 30,
    zoomControl: true
  }).setView([26.8687564, 81.006653], 5);

  this.addTileLayer(this.mapType);

  }

  addTileLayer(mapType: string) {
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    let tileLayerUrl = '';
    let attribution = '';

    switch(mapType) {
      case 'osm':
        tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        attribution = '© OpenStreetMap';
        break;
      case 'satellite':
        tileLayerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = '© Esri';
        break;
      case 'terrain':
        tileLayerUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        attribution = '© OpenTopoMap';
        break;
      case 'dark':
        tileLayerUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        attribution = '© CARTO';
        break;
      case 'streets':
        tileLayerUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
        attribution = '© OpenStreetMap HOT';
        break;
      default:
        tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        attribution = '© OpenStreetMap';
    }

    this.currentTileLayer = L.tileLayer(tileLayerUrl, {
      attribution: attribution,
      minZoom: 2,
      maxZoom: 30
    }).addTo(this.map);
  }

  changeMapType(mapType: string) {
    this.mapType = mapType;
    this.addTileLayer(mapType);
  }

  loadAndPlotData(user: any) {
    const employeeId = user ? user.id : null;
    const obj:any={}
    if(employeeId){
      obj['employeeId']=employeeId
    }
  this.locationService.getLatestLocations(obj).subscribe(res => {
    if (!res?.data) return;

    this.clearMap();

    const polylineColor = '#2c3e50'; 
    const bounds: L.LatLngBounds = L.latLngBounds([]);

    Object.keys(res.data).forEach((employeeId) => {
      const points = res.data[employeeId];
      if (!points.length) return;

      const sortedPoints = [...points].sort((a: any, b: any) => 
        new Date(a.tracked_at).getTime() - new Date(b.tracked_at).getTime()
      );

      const route: L.LatLngExpression[] = sortedPoints.map((p: any) => [
        p.latitude,
        p.longitude
      ]);

      this.polyline = L.polyline(route, {
        color: polylineColor,
        weight: 6,
        opacity: 0.9,
        smoothFactor: 1.0, 
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);

      bounds.extend(this.polyline.getBounds());

      if (sortedPoints.length > 0) {
        const startPoint = sortedPoints[0];
        const startIcon = this.createCustomIcon('#28a745', 'START');
        const startMarker = L.marker([startPoint.latitude, startPoint.longitude], {
          icon: startIcon
        }).addTo(this.map);
        
        startMarker.bindPopup(`
          <b>START</b><br/>
          <b>Employee:</b> ${employeeId}<br/>
          Lat: ${startPoint.latitude.toFixed(6)}<br/>
          Lng: ${startPoint.longitude.toFixed(6)}<br/>
          Time: ${new Date(startPoint.tracked_at).toLocaleString()}
        `);
        
        this.markers.push(startMarker);
        bounds.extend([startPoint.latitude, startPoint.longitude]);
      }

      if (sortedPoints.length > 1) {
        const endPoint = sortedPoints[sortedPoints.length - 1];
        const endIcon = this.createCustomIcon('#dc3545', 'END');
        const endMarker = L.marker([endPoint.latitude, endPoint.longitude], {
          icon: endIcon
        }).addTo(this.map);
        
        endMarker.bindPopup(`
          <b>END</b><br/>
          <b>Employee:</b> ${employeeId}<br/>
          Lat: ${endPoint.latitude.toFixed(6)}<br/>
          Lng: ${endPoint.longitude.toFixed(6)}<br/>
          Time: ${new Date(endPoint.tracked_at).toLocaleString()}
        `);
        
        this.markers.push(endMarker);
        bounds.extend([endPoint.latitude, endPoint.longitude]);
      }

      const totalSegments = sortedPoints.length - 1;
      
      const arrowSpacing = Math.max(2, Math.floor(totalSegments / 8)); 
      
      for (let i = 0; i < totalSegments; i += arrowSpacing) {
        const currentPoint = sortedPoints[i];
        const nextPoint = sortedPoints[i + 1];
        
        const segmentRatio = 0.6;
        const arrowLat = currentPoint.latitude + (nextPoint.latitude - currentPoint.latitude) * segmentRatio;
        const arrowLon = currentPoint.longitude + (nextPoint.longitude - currentPoint.longitude) * segmentRatio;
        
        const bearing = this.calculateBearing(
          currentPoint.latitude,
          currentPoint.longitude,
          nextPoint.latitude,
          nextPoint.longitude
        );
        
        const arrowIcon = this.createArrowIcon(bearing);
        const arrowMarker = L.marker([arrowLat, arrowLon], {
          icon: arrowIcon
        }).addTo(this.map);
        
        this.arrowMarkers.push(arrowMarker);
      }

      if (sortedPoints.length >= 2) {
        const firstPoint = sortedPoints[0];
        const secondPoint = sortedPoints[1];
        const initialBearing = this.calculateBearing(
          firstPoint.latitude,
          firstPoint.longitude,
          secondPoint.latitude,
          secondPoint.longitude
        );
        
        const startRatio = 0.3;
        const startArrowLat = firstPoint.latitude + (secondPoint.latitude - firstPoint.latitude) * startRatio;
        const startArrowLon = firstPoint.longitude + (secondPoint.longitude - firstPoint.longitude) * startRatio;
        
        const startArrowIcon = this.createArrowIcon(initialBearing);
        const startArrowMarker = L.marker([startArrowLat, startArrowLon], {
          icon: startArrowIcon
        }).addTo(this.map);
        
        this.arrowMarkers.push(startArrowMarker);
      }

      if (sortedPoints.length >= 2) {
        const secondLastPoint = sortedPoints[sortedPoints.length - 2];
        const lastPoint = sortedPoints[sortedPoints.length - 1];
        const finalBearing = this.calculateBearing(
          secondLastPoint.latitude,
          secondLastPoint.longitude,
          lastPoint.latitude,
          lastPoint.longitude
        );
        
        const endRatio = 0.7;
        const endArrowLat = secondLastPoint.latitude + (lastPoint.latitude - secondLastPoint.latitude) * endRatio;
        const endArrowLon = secondLastPoint.longitude + (lastPoint.longitude - secondLastPoint.longitude) * endRatio;
        
        const endArrowIcon = this.createArrowIcon(finalBearing);
        const endArrowMarker = L.marker([endArrowLat, endArrowLon], {
          icon: endArrowIcon
        }).addTo(this.map);
        
        this.arrowMarkers.push(endArrowMarker);
      }
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  });
}

  toggleLiveTracking() {
    if (!this.currentTrackingUser) {
      console.warn('No user selected for live tracking');
      return;
    }

    const employeeData = encodeURIComponent(JSON.stringify(this.currentTrackingUser));
    this.router.navigate(['/layout/tracking/live'], {
      queryParams: { employee: employeeData }
    });
  }

  startLiveTracking() {
    if (!this.currentTrackingUser) {
      console.warn('No user selected for live tracking');
      return;
    }

    this.isLiveTrackingEnabled = true;
    
    this.loadAndPlotData(this.currentTrackingUser);
    
    this.liveTrackingInterval = setInterval(() => {
      if (this.isLiveTrackingEnabled && this.currentTrackingUser) {
        this.loadAndPlotData(this.currentTrackingUser);
      }
    }, this.liveTrackingIntervalSeconds * 1000);
  }

  stopLiveTracking() {
    this.isLiveTrackingEnabled = false;
    if (this.liveTrackingInterval) {
      clearInterval(this.liveTrackingInterval);
      this.liveTrackingInterval = null;
    }
  }

  ngOnDestroy() {
    this.stopLiveTracking();
  }
}
