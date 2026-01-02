import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';
import { StatusService } from '../../services/status.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../services/master.service';

interface LocationData {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
    altitudeAccuracy: number;
    heading: number;
    speed: number;
  };
  timestamp: number;
  mode: string;
  Deviceid: string;
  deviceOs: string;
}

@Component({
  selector: 'app-live-tracking',
  templateUrl: './live-tracking.component.html',
  styleUrls: ['./live-tracking.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LiveTrackingComponent implements OnInit, OnDestroy {
  map!: L.Map;
  currentMarker!: L.Marker;
  polyline!: L.Polyline;
  currentTileLayer!: L.TileLayer;
  mapType: string = 'osm';

  employee: any = null;
  employeeName: string = '';
  employeeProfileImage: string = '';
  baseurl: string = '';
  locationHistory: LocationData[] = [];
  currentLocation: LocationData | null = null;

  isTracking: boolean = true;
  trackingInterval: any = null;
  refreshInterval: number = 3;
staticLocationData:any=[]
  // staticLocationData: LocationData[] = [
  //   {
  //     coords: {
  //       latitude: 26.8687539,
  //       longitude: 81.0066458,
  //       altitude: 84.5,
  //       accuracy: 100,
  //       altitudeAccuracy: 100,
  //       heading: 0,
  //       speed: 0
  //     },
  //     timestamp: Date.now() - 60000,
  //     mode: 'background',
  //     Deviceid: '2df1cffc11a4dbb7',
  //     deviceOs: 'A'
  //   },
  //   {
  //     coords: {
  //       latitude: 26.8688000,
  //       longitude: 81.0067000,
  //       altitude: 85.0,
  //       accuracy: 100,
  //       altitudeAccuracy: 100,
  //       heading: 45,
  //       speed: 5.5
  //     },
  //     timestamp: Date.now() - 45000,
  //     mode: 'foreground',
  //     Deviceid: '2df1cffc11a4dbb7',
  //     deviceOs: 'A'
  //   },
  //   {
  //     coords: {
  //       latitude: 26.8688500,
  //       longitude: 81.0067500,
  //       altitude: 85.5,
  //       accuracy: 100,
  //       altitudeAccuracy: 100,
  //       heading: 90,
  //       speed: 8.2
  //     },
  //     timestamp: Date.now() - 30000,
  //     mode: 'foreground',
  //     Deviceid: '2df1cffc11a4dbb7',
  //     deviceOs: 'A'
  //   },
  //   {
  //     coords: {
  //       latitude: 26.8689000,
  //       longitude: 81.0068000,
  //       altitude: 86.0,
  //       accuracy: 100,
  //       altitudeAccuracy: 100,
  //       heading: 135,
  //       speed: 12.3
  //     },
  //     timestamp: Date.now() - 15000,
  //     mode: 'foreground',
  //     Deviceid: '2df1cffc11a4dbb7',
  //     deviceOs: 'A'
  //   },
  //   {
  //     coords: {
  //       latitude: 26.8689500,
  //       longitude: 81.0068500,
  //       altitude: 86.5,
  //       accuracy: 100,
  //       altitudeAccuracy: 100,
  //       heading: 180,
  //       speed: 15.8
  //     },
  //     timestamp: Date.now(),
  //     mode: 'foreground',
  //     Deviceid: '2df1cffc11a4dbb7',
  //     deviceOs: 'A'
  //   }
  // ];
  markers: L.Marker[] = [];
  arrowMarkers: L.Marker[] = [];
  isLiveTrackingEnabled: boolean = false;
  liveTrackingInterval: any = null;
  currentTrackingUser: any = null;
  liveTrackingIntervalSeconds: number = 5;
  constructor(
    private locationService: LocationService,
    public statusService: StatusService,
    private router: Router,
    private route: ActivatedRoute,
    private master: MasterService
  ) {
    this.baseurl = this.master.getBaseUrl();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['employee']) {
        try {
          this.employee = JSON.parse(decodeURIComponent(params['employee']));
          this.employeeName = `${this.employee.firstName || ''} ${this.employee.lastName || ''}`.trim() || 'Employee';

          // Set profile image
          if (this.employee.profileImage) {
            this.employeeProfileImage = `${this.baseurl}${this.employee.profileImage}`;
          } else {
            // Default avatar based on gender
            this.employeeProfileImage = this.employee.gender == 'Female'
              ? '../../assets/img/avatars/2.png'
              : '../../assets/img/avatars/1.png';
          }
        } catch (e) {
          console.error('Error parsing employee data:', e);
          this.employeeName = 'Employee';
          this.employeeProfileImage = '../../assets/img/avatars/1.png';
        }
      } else {
        this.employeeName = 'Employee';
        this.employeeProfileImage = '../../assets/img/avatars/1.png';
      }
    });
  //  this.activeTrackingUsers();
    this.locationHistory = [...this.staticLocationData];
    this.currentLocation = this.locationHistory[this.locationHistory.length - 1];

    setTimeout(() => {
      this.initMap();
      setTimeout(() => {
        this.startTracking();
      }, 800);
    }, 500);
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

  loadAndPlotData(user: any) {
   const employeeId = user ? user.id : null;
   const payload: any = {};

   if (employeeId) {
     payload.employeeId = employeeId;
   }

   this.locationService.getLatestLocations(payload).subscribe(res => {
     const points: any = res?.data || [];
     if (!points.length) return;

     this.clearMap();

     const polylineColor = '#2c3e50';
     const bounds = L.latLngBounds([]);

     // ✅ Sort by timestamp
     const sortedPoints = [...points].sort(
       (a, b) => a.timestamp - b.timestamp
     );

     // ✅ Polyline route
     const route: L.LatLngExpression[] = sortedPoints.map(p => [
       p.coords.latitude,
       p.coords.longitude
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

     // ✅ START marker
     const startPoint = sortedPoints[0];
     const startIcon = this.createCustomIcon('#28a745', 'START');

     const startMarker = L.marker(
       [startPoint.coords.latitude, startPoint.coords.longitude],
       { icon: startIcon }
     ).addTo(this.map);

     startMarker.bindPopup(`
       <b>START</b><br/>
       Lat: ${startPoint.coords.latitude.toFixed(6)}<br/>
       Lng: ${startPoint.coords.longitude.toFixed(6)}<br/>
       Time: ${new Date(startPoint.timestamp).toLocaleString()}
     `);

     this.markers.push(startMarker);
     bounds.extend([startPoint.coords.latitude, startPoint.coords.longitude]);

     // ✅ END marker
     if (sortedPoints.length > 1) {
       const endPoint = sortedPoints[sortedPoints.length - 1];
       const endIcon = this.createCustomIcon('#dc3545', 'END');

       const endMarker = L.marker(
         [endPoint.coords.latitude, endPoint.coords.longitude],
         { icon: endIcon }
       ).addTo(this.map);

       endMarker.bindPopup(`
         <b>END</b><br/>
         Lat: ${endPoint.coords.latitude.toFixed(6)}<br/>
         Lng: ${endPoint.coords.longitude.toFixed(6)}<br/>
         Time: ${new Date(endPoint.timestamp).toLocaleString()}
       `);

       this.markers.push(endMarker);
       bounds.extend([endPoint.coords.latitude, endPoint.coords.longitude]);
     }

     // ✅ Direction arrows
     const totalSegments = sortedPoints.length - 1;
     const arrowSpacing = Math.max(2, Math.floor(totalSegments / 8));

     for (let i = 0; i < totalSegments; i += arrowSpacing) {
       const curr = sortedPoints[i];
       const next = sortedPoints[i + 1];

       const bearing = this.calculateBearing(
         curr.coords.latitude,
         curr.coords.longitude,
         next.coords.latitude,
         next.coords.longitude
       );

       const ratio = 0.6;
       const arrowLat =
         curr.coords.latitude +
         (next.coords.latitude - curr.coords.latitude) * ratio;
       const arrowLng =
         curr.coords.longitude +
         (next.coords.longitude - curr.coords.longitude) * ratio;

       const arrowIcon = this.createArrowIcon(bearing);
       const arrowMarker = L.marker([arrowLat, arrowLng], {
         icon: arrowIcon
       }).addTo(this.map);

       this.arrowMarkers.push(arrowMarker);
     }

     if (bounds.isValid()) {
       this.map.fitBounds(bounds, { padding: [50, 50] });
     }
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

  initMap() {
    if (this.map) {
      this.map.remove();
    }

    setTimeout(() => {
      const mapElement = document.getElementById('liveMap');
      if (!mapElement) {
        console.error('Map container not found');
        return;
      }

      this.map = L.map('liveMap', {
        minZoom: 2,
        maxZoom: 30,
        zoomControl: true,
        preferCanvas: false
      }).setView([26.8687539, 81.0066458], 15);

      this.addTileLayer(this.mapType);

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          this.plotLocationHistory();
          this.updateCurrentLocation();
        }
      }, 300);
    }, 300);
  }

  addTileLayer(mapType: string) {
    if (!this.map) {
      console.warn('Map not initialized yet');
      return;
    }

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
      maxZoom: 30,
      crossOrigin: true
    }).addTo(this.map);

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  changeMapType(mapType: string) {
    this.mapType = mapType;
    if (this.map) {
      this.addTileLayer(mapType);
    }
  }

  createVehicleIcon(heading: number, speed: number): L.DivIcon {
    const rotation = heading - 90;
    const speedColor = speed > 10 ? '#28a745' : speed > 5 ? '#ffc107' : '#dc3545';

    const userIconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="4" fill="${speedColor}"/>
        <path d="M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="${speedColor}" stroke-width="2" fill="none"/>
      </svg>
    `;

    return L.divIcon({
      className: 'vehicle-marker',
      html: `
        <div style="
          position: relative;
          width: 45px;
          height: 45px;
        ">
          <!-- User icon/profile image container - Main Focus -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid ${speedColor};
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            z-index: 3;
          ">
            <img
              src="${this.employeeProfileImage}"
              alt="${this.employeeName}"
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
              "
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div style="
              display: none;
              width: 20px;
              height: 20px;
              align-items: center;
              justify-content: center;
            ">
              ${userIconSvg}
            </div>
          </div>

          <!-- Direction arrow - Visible and prominent -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(${rotation}deg);
            width: 0;
            height: 0;
            border-left: 9px solid transparent;
            border-right: 9px solid transparent;
            border-bottom: 18px solid ${speedColor};
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6));
            z-index: 2;
            opacity: 1;
            margin-top: 16px;
          "></div>

          <!-- Arrow shadow for better visibility -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(${rotation}deg);
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 19px solid rgba(0,0,0,0.3);
            z-index: 1;
            margin-top: 17px;
            margin-left: 1px;
          "></div>

          <!-- Pulse animation ring -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border: 2px solid ${speedColor};
            opacity: 0.4;
            animation: pulse-ring 2s infinite;
            z-index: 0;
          "></div>

          <!-- Outer pulse ring -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 52px;
            height: 52px;
            border-radius: 50%;
            border: 2px solid ${speedColor};
            opacity: 0.2;
            animation: pulse-ring 2s infinite;
            animation-delay: 0.5s;
            z-index: 0;
          "></div>
        </div>
      `,
      iconSize: [45, 45],
      iconAnchor: [22.5, 22.5]
    });
  }

  plotLocationHistory() {
    if (!this.map || this.locationHistory.length === 0) return;

    if (this.polyline) {
      this.map.removeLayer(this.polyline);
    }

    const route: L.LatLngExpression[] = this.locationHistory.map(loc => [
      loc.coords.latitude,
      loc.coords.longitude
    ]);

    this.polyline = L.polyline(route, {
      color: '#007bff',
      weight: 4,
      opacity: 0.8,
      smoothFactor: 1.0,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    if (route.length > 0 && !this.isTracking) {
      const bounds = L.latLngBounds(route);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  updateCurrentLocation() {
    if (!this.map || !this.currentLocation) return;

    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }

    const { latitude, longitude, heading, speed } = this.currentLocation.coords;

    const vehicleIcon = this.createVehicleIcon(heading, speed);

    this.currentMarker = L.marker([latitude, longitude], {
      icon: vehicleIcon,
      zIndexOffset: 1000
    }).addTo(this.map);

    const popupContent = `
      <div style="min-width: 200px;">
        <b>${this.employeeName}</b><br/>
        <b>Current Location</b><br/>
        <small>Lat: ${latitude.toFixed(6)}</small><br/>
        <small>Lng: ${longitude.toFixed(6)}</small><br/>
        <small>Speed: ${speed.toFixed(1)} m/s</small><br/>
        <small>Heading: ${heading.toFixed(0)}°</small><br/>
        <small>Time: ${new Date(this.currentLocation.timestamp).toLocaleString()}</small>
      </div>
    `;
    this.currentMarker.bindPopup(popupContent).openPopup();

    if (this.isTracking) {
      this.map.setView([latitude, longitude], this.map.getZoom(), {
        animate: true,
        duration: 1.0,
        easeLinearity: 0.25
      });
    } else {
      const currentZoom = this.map.getZoom();
      if (currentZoom >= 15) {
        this.map.setView([latitude, longitude], currentZoom, {
          animate: true,
          duration: 0.5
        });
      } else {
        if (this.locationHistory.length > 0) {
          const route: L.LatLngExpression[] = this.locationHistory.map(loc => [
            loc.coords.latitude,
            loc.coords.longitude
          ]);
          const bounds = L.latLngBounds(route);
          this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
        }
      }
    }
  }

  generateNewLocation(): LocationData {
    if (!this.currentLocation) {
      return this.staticLocationData[0];
    }

    const lastLoc = this.currentLocation;
    const randomLat = (Math.random() - 0.5) * 0.001; // ~100m variation
    const randomLon = (Math.random() - 0.5) * 0.001;
    const randomSpeed = Math.random() * 20;
    const randomHeading = Math.random() * 360;

    return {
      coords: {
        latitude: lastLoc.coords.latitude + randomLat,
        longitude: lastLoc.coords.longitude + randomLon,
        altitude: lastLoc.coords.altitude + (Math.random() - 0.5) * 2,
        accuracy: 100,
        altitudeAccuracy: 100,
        heading: randomHeading,
        speed: randomSpeed
      },
      timestamp: Date.now(),
      mode: 'foreground',
      Deviceid: lastLoc.Deviceid,
      deviceOs: lastLoc.deviceOs
    };
  }

 addNewLocation() {
  if (!this.employee?.id) {
    this.addGeneratedLocation();
    return;
  }

  const payload = { employeeId: this.employee.id };

  this.locationService.getLatestLocations(payload).subscribe({
    next: (res) => {
      const points: LocationData[] = res?.data || [];

      if (points.length > 0) {
        const latestPoint = points[points.length - 1];

        //  Directly use API data (NO conversion needed)
        this.locationHistory.push(latestPoint);
        this.currentLocation = latestPoint;

        this.plotLocationHistory();
        this.updateCurrentLocation();
      } else {
        this.addGeneratedLocation();
      }
    },
    error: () => {
      this.addGeneratedLocation();
    }
  });
}

  addGeneratedLocation() {
    const newLocation = this.generateNewLocation();
    this.locationHistory.push(newLocation);
    this.currentLocation = newLocation;
    this.plotLocationHistory();
    this.updateCurrentLocation();
  }

  startTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    this.isTracking = true;
    this.trackingInterval = setInterval(() => {
      if (this.isTracking) {
        this.addNewLocation();
      }
    }, this.refreshInterval * 1000);
  }

  stopTracking() {
    this.isTracking = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  toggleTracking() {
    if (this.isTracking) {
      this.stopTracking();
    } else {
      this.startTracking();
    }
  }

  goBack() {
    this.stopTracking();
    this.router.navigate(['/layout/tracking']);
  }

  ngOnDestroy() {
    this.stopTracking();
    if (this.map) {
      this.map.remove();
    }
  }
}

