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
import { firstValueFrom } from 'rxjs';

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
  trafficLayer: L.TileLayer | null = null;
  mapType: string = 'osm';
  isTrafficEnabled: boolean = false;
  isLiveTrackingEnabled: boolean = false;
  liveTrackingInterval: any = null;
  currentTrackingUser: any = null;
  liveTrackingIntervalSeconds: number = 5;
  isFullScreen: boolean = false;
  fullScreenControl: any = null;
  trafficControl: any = null;
  zoomControl: any = null;
  constructor(private locationService: LocationService, public statusService: StatusService, private router: Router, private master: MasterService,) {
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
      this.searchText = ''
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
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map container not found');
        return;
      }

      if (!this.map) {
        this.initMap();
        setTimeout(() => {
          this.loadAndPlotData(user);
        }, 200);
      } else {
        this.clearMap();
        if (!this.fullScreenControl) {
          this.addFullScreenControl();
        }
        if (!this.trafficControl) {
          this.addTrafficControl();
        }
        if (!this.zoomControl) {
          this.addCustomZoomControl();
        }
        this.map.invalidateSize();
        setTimeout(() => {
          this.loadAndPlotData(user);
        }, 100);
      }
    }, 100);
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
      if (layer !== this.currentTileLayer && layer !== this.trafficLayer) {
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
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredDesignation = data.slice(start, end);
  }
  baseurl: any;
  ActiveUsers: any = [];
  viewLiveTracking: boolean = true;

  maskAadhaarNumber(aadhaar: string): string {
    if (!aadhaar || aadhaar.length < 4) {
      return aadhaar || '';
    }

    const cleaned = aadhaar.replace(/\s+/g, '');

    if (cleaned.length <= 4) {
      return 'XXXX XXXX ' + cleaned;
    }

    const first4 = cleaned.substring(0, 4);
    const last4 = cleaned.substring(cleaned.length - 4);
    const middle = 'XXXX';

    return `${first4} ${middle} ${last4}`;
  }
  activeTrackingUsers() {
    this.ActiveUsers = [];
    this.locationService.getActiveTrackingUsers().subscribe({
      next: (response: any) => {
        let message = response.message ? response.message : 'Data found Successfully';
        let status = this.statusService.handleResponseStatus(response.status, message);
        if (status === true) {
          this.ActiveUsers = [];
          response.data = response.data.map((item: any, index: any) => {
            return {
              ...item,
              si_no: index + 1,
              profileImage: item.profileImage ? `${this.baseurl}${item?.profileImage}` : item.gender == 'Female' ? "../../assets/img/avatars/2.png" : '../../assets/img/avatars/1.png'

            }
          }
          );
          this.ActiveUsers = response.data;
          this.originalList = [...response.data];
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
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map container not found');
      return;
    }

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map', {
      minZoom: 2,
      maxZoom: 30,
      zoomControl: false,
      preferCanvas: false,
      fadeAnimation: true,
      zoomAnimation: true,
      zoomAnimationThreshold: 4
    }).setView([26.8687564, 81.006653], 5);

    this.addTileLayer(this.mapType);
    this.addFullScreenControl();
    this.addTrafficControl();
    this.addCustomZoomControl();

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  addFullScreenControl() {
    if (this.fullScreenControl) {
      this.map.removeControl(this.fullScreenControl);
    }

    const self = this;
    const FullScreenControl = L.Control.extend({
      onAdd: (map: L.Map) => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        const link = L.DomUtil.create('a', 'leaflet-control-fullscreen', container);
        link.href = '#';
        link.title = 'Toggle Full Screen';
        link.setAttribute('role', 'button');
        link.setAttribute('aria-label', 'Toggle Full Screen');

        const icon = L.DomUtil.create('i', 'fas', link);
        icon.className = `fas ${self.isFullScreen ? 'fa-compress' : 'fa-expand'}`;

        const updateIcon = () => {
          icon.className = `fas ${self.isFullScreen ? 'fa-compress' : 'fa-expand'}`;
          link.setAttribute('title', self.isFullScreen ? 'Exit Full Screen' : 'Toggle Full Screen');
        };

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(link, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          self.toggleFullScreen();
          setTimeout(updateIcon, 100);
        });

        return container;
      },
      onRemove: (map: L.Map) => {
      }
    });

    this.fullScreenControl = new FullScreenControl({ position: 'topright' });
    this.fullScreenControl.addTo(this.map);
  }

  addTrafficControl() {
    if (this.trafficControl) {
      this.map.removeControl(this.trafficControl);
    }

    const self = this;
    const TrafficControl = L.Control.extend({
      onAdd: (map: L.Map) => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        const link = L.DomUtil.create('a', 'leaflet-control-traffic', container);
        link.href = '#';
        link.title = 'Toggle Traffic';
        link.setAttribute('role', 'button');
        link.setAttribute('aria-label', 'Toggle Traffic');

        const icon = L.DomUtil.create('i', 'fas', link);
        icon.className = `fas fa-traffic-light`;
        if (self.isTrafficEnabled) {
          link.style.backgroundColor = '#ffc107';
          link.style.color = '#000';
        }

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(link, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          self.toggleTraffic();
          if (self.isTrafficEnabled) {
            link.style.backgroundColor = '#ffc107';
            link.style.color = '#000';
          } else {
            link.style.backgroundColor = '';
            link.style.color = '';
          }
        });

        return container;
      },
      onRemove: (map: L.Map) => {
      }
    });

    this.trafficControl = new TrafficControl({ position: 'topright' });
    this.trafficControl.addTo(this.map);
  }

  addCustomZoomControl() {
    if (this.zoomControl) {
      this.map.removeControl(this.zoomControl);
    }

    const self = this;
    const CustomZoomControl = L.Control.extend({
      onAdd: (map: L.Map) => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';

        const zoomInLink = L.DomUtil.create('a', 'leaflet-control-zoom-in', container);
        zoomInLink.href = '#';
        zoomInLink.title = 'Zoom In';
        zoomInLink.setAttribute('role', 'button');
        zoomInLink.setAttribute('aria-label', 'Zoom In');

        const zoomInIcon = L.DomUtil.create('i', 'fas fa-plus', zoomInLink);

        L.DomEvent.disableClickPropagation(zoomInLink);
        L.DomEvent.on(zoomInLink, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          self.zoomIn();
        });

        const zoomOutLink = L.DomUtil.create('a', 'leaflet-control-zoom-out', container);
        zoomOutLink.href = '#';
        zoomOutLink.title = 'Zoom Out';
        zoomOutLink.setAttribute('role', 'button');
        zoomOutLink.setAttribute('aria-label', 'Zoom Out');

        const zoomOutIcon = L.DomUtil.create('i', 'fas fa-minus', zoomOutLink);

        L.DomEvent.disableClickPropagation(zoomOutLink);
        L.DomEvent.on(zoomOutLink, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          self.zoomOut();
        });

        return container;
      },
      onRemove: (map: L.Map) => {
      }
    });

    this.zoomControl = new CustomZoomControl({ position: 'topright' });
    this.zoomControl.addTo(this.map);
  }

  addTileLayer(mapType: string) {
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    let tileLayerUrl = '';
    let attribution = '';

    switch (mapType) {
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
    if (this.isTrafficEnabled && this.map) {
      this.toggleTraffic();
      this.toggleTraffic();
    }
  }

  toggleTraffic() {
    this.isTrafficEnabled = !this.isTrafficEnabled;

    if (!this.map) {
      return;
    }

    if (this.isTrafficEnabled) {
      if (this.trafficLayer) {
        this.map.removeLayer(this.trafficLayer);
        this.trafficLayer = null;
      }

      this.trafficLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        minZoom: 2,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Traffic data &copy; Google',
        opacity: 0.65,
        pane: 'overlayPane',
        zIndex: 1000
      });

      this.trafficLayer.addTo(this.map);

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);
    } else {
      if (this.trafficLayer) {
        this.map.removeLayer(this.trafficLayer);
        this.trafficLayer = null;
      }
    }

    const trafficButton = document.querySelector('.leaflet-control-traffic');
    if (trafficButton) {
      if (this.isTrafficEnabled) {
        (trafficButton as HTMLElement).style.backgroundColor = '#ffc107';
        (trafficButton as HTMLElement).style.color = '#000';
      } else {
        (trafficButton as HTMLElement).style.backgroundColor = '';
        (trafficButton as HTMLElement).style.color = '';
      }
    }
  }
// async loadAndPlotData(user: any) {
//   const employeeId = user ? user.id : null;
//   const payload: any = {};

//   if (employeeId) {
//     payload.employeeId = employeeId;
//   }

//   this.locationService.getLatestLocations(payload).subscribe(async res => {
//     const points: any[] = res?.data || [];
//     if (!points.length) return;

//     this.clearMap();

//     const bounds = L.latLngBounds([]);
//     const polylineColor = '#2c3e50';

//     // ✅ Sort points
//     const sortedPoints = [...points].sort(
//       (a, b) => a.timestamp - b.timestamp
//     );

//     // ✅ Draw polyline
//     const route: L.LatLngExpression[] = sortedPoints.map(p => [
//       p.coords.latitude,
//       p.coords.longitude
//     ]);

//     this.polyline = L.polyline(route, {
//       color: polylineColor,
//       weight: 6,
//       opacity: 0.9
//     }).addTo(this.map);

//     bounds.extend(this.polyline.getBounds());

//     // =====================================================
//     // 🔥 ADD LOCATION NAME FOR EACH POLYLINE POINT (HERE)
//     // =====================================================
//     for (const point of sortedPoints) {
//       const latLng: L.LatLngExpression = [
//         point.coords.latitude,
//         point.coords.longitude
//       ];

//       // 🔥 Reverse geocode
//       const locationName = await this.addLocationName(point);

//       const marker = L.circleMarker(latLng, {
//         radius: 5,
//         color: '#2c3e50',
//         fillColor: '#3498db',
//         fillOpacity: 1
//       }).addTo(this.map);

//       // Tooltip (hover)
//       marker.bindTooltip(
//         `<b>Location:</b><br>${locationName}`,
//         { sticky: true }
//       );

//       // Popup (click)
//       marker.bindPopup(`
//         <b>Location</b><br/>
//         ${locationName}<br/><br/>
//         <b>Lat:</b> ${point.coords.latitude.toFixed(6)}<br/>
//         <b>Lng:</b> ${point.coords.longitude.toFixed(6)}<br/>
//         <b>Speed:</b> ${point.coords.speed} m/s<br/>
//         <b>Time:</b> ${new Date(point.timestamp).toLocaleString()}
//       `);

//       bounds.extend(latLng);
//     }

//     // ✅ START marker
//     const start = sortedPoints[0];
//     const startMarker = L.marker(
//       [start.coords.latitude, start.coords.longitude],
//       { icon: this.createCustomIcon('#28a745', 'START') }
//     ).addTo(this.map);

//     // ✅ END marker
//     if (sortedPoints.length > 1) {
//       const end = sortedPoints[sortedPoints.length - 1];
//       const endMarker = L.marker(
//         [end.coords.latitude, end.coords.longitude],
//         { icon: this.createCustomIcon('#dc3545', 'END') }
//       ).addTo(this.map);
//     }

//     if (bounds.isValid()) {
//       this.map.fitBounds(bounds, { padding: [50, 50] });
//     }
//   });
// }

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

    const sortedPoints = [...points].sort(
      (a, b) => a.timestamp - b.timestamp
    );

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

    const startPoint = sortedPoints[0];
    const startIcon = this.createCustomIcon('#28a745', 'START');

    const startMarker = L.marker(
      [startPoint.coords.latitude, startPoint.coords.longitude],
      { icon: startIcon }
    ).addTo(this.map);

    this.bindMarkerPopupWithAddress(startMarker, 'START', startPoint.coords.latitude, startPoint.coords.longitude, startPoint.timestamp);

    this.markers.push(startMarker);
    bounds.extend([startPoint.coords.latitude, startPoint.coords.longitude]);

    if (sortedPoints.length > 1) {
      const endPoint = sortedPoints[sortedPoints.length - 1];
      const endIcon = this.createCustomIcon('#dc3545', 'END');

      const endMarker = L.marker(
        [endPoint.coords.latitude, endPoint.coords.longitude],
        { icon: endIcon }
      ).addTo(this.map);

      this.bindMarkerPopupWithAddress(endMarker, 'END', endPoint.coords.latitude, endPoint.coords.longitude, endPoint.timestamp);

      this.markers.push(endMarker);
      bounds.extend([endPoint.coords.latitude, endPoint.coords.longitude]);
    }

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
async addLocationName(point: any): Promise<string> {
  try {
    const res: any = await this.locationService.getAddressFromCoords(point.coords.latitude, point.coords.longitude)
      .toPromise();

    return res?.display_name || 'Unknown Location';
  } catch {
    return 'Unknown Location';
  }
}

  async getAddressFromAPI(lat: number, lng: number): Promise<string | null> {
    try {
      const response: any = await firstValueFrom(this.locationService.getAddressFromGlobalVTS(lat, lng));

      if (response && response.address && typeof response.address === 'string' && response.address.trim() !== '') {
        return response.address;
      }

      return null;
    } catch (error) {
      console.error('Error fetching address from API:', error);
      return null;
    }
  }

  bindMarkerPopupWithAddress(marker: L.Marker, label: string, lat: number, lng: number, timestamp: number) {
    const initialContent = `
      <b>${label}</b><br/>
      <small>Loading address...</small><br/>
      <b>Lat:</b> ${lat.toFixed(6)}<br/>
      <b>Lng:</b> ${lng.toFixed(6)}<br/>
      <b>Time:</b> ${new Date(timestamp).toLocaleString()}
    `;

    marker.bindPopup(initialContent);

    // this.getAddressFromAPI(lat, lng).then(address => {
      let popupContent = `
        <b>${label}</b><br/>
      `;

      // if (address) {
      //   popupContent += `<b>Address:</b> ${address}<br/>`;
      // }

      popupContent += `
        <b>Lat:</b> ${lat.toFixed(6)}<br/>
        <b>Lng:</b> ${lng.toFixed(6)}<br/>
        <b>Time:</b> ${new Date(timestamp).toLocaleString()}
      `;

      marker.setPopupContent(popupContent);
    // }).catch(error => {
    //   const fallbackContent = `
    //     <b>${label}</b><br/>
    //     <b>Lat:</b> ${lat.toFixed(6)}<br/>
    //     <b>Lng:</b> ${lng.toFixed(6)}<br/>
    //     <b>Time:</b> ${new Date(timestamp).toLocaleString()}
    //   `;
    //   marker.setPopupContent(fallbackContent);
    // });
  }


  // loadAndPlotData(user: any) {
  //   const employeeId = user ? user.id : null;
  //   const obj: any = {}
  //   if (employeeId) {
  //     obj['employeeId'] = employeeId
  //   }
  //   this.locationService.getLatestLocations(obj).subscribe(res => {
  //     if (!res?.data) return;

  //     this.clearMap();

  //     const polylineColor = '#2c3e50';
  //     const bounds: L.LatLngBounds = L.latLngBounds([]);

  //     Object.keys(res.data).forEach((employeeId) => {
  //       const points = res.data[employeeId];
  //       if (!points.length) return;

  //       const sortedPoints = [...points].sort((a: any, b: any) =>
  //         new Date(a.tracked_at).getTime() - new Date(b.tracked_at).getTime()
  //       );

  //       const route: L.LatLngExpression[] = sortedPoints.map((p: any) => [
  //         p.latitude,
  //         p.longitude
  //       ]);

  //       this.polyline = L.polyline(route, {
  //         color: polylineColor,
  //         weight: 6,
  //         opacity: 0.9,
  //         smoothFactor: 1.0,
  //         lineCap: 'round',
  //         lineJoin: 'round'
  //       }).addTo(this.map);

  //       bounds.extend(this.polyline.getBounds());

  //       if (sortedPoints.length > 0) {
  //         const startPoint = sortedPoints[0];
  //         const startIcon = this.createCustomIcon('#28a745', 'START');
  //         const startMarker = L.marker([startPoint.latitude, startPoint.longitude], {
  //           icon: startIcon
  //         }).addTo(this.map);

  //         startMarker.bindPopup(`
  //         <b>START</b><br/>
  //         <b>Employee:</b> ${employeeId}<br/>
  //         Lat: ${startPoint.latitude.toFixed(6)}<br/>
  //         Lng: ${startPoint.longitude.toFixed(6)}<br/>
  //         Time: ${new Date(startPoint.tracked_at).toLocaleString()}
  //       `);

  //         this.markers.push(startMarker);
  //         bounds.extend([startPoint.latitude, startPoint.longitude]);
  //       }

  //       if (sortedPoints.length > 1) {
  //         const endPoint = sortedPoints[sortedPoints.length - 1];
  //         const endIcon = this.createCustomIcon('#dc3545', 'END');
  //         const endMarker = L.marker([endPoint.latitude, endPoint.longitude], {
  //           icon: endIcon
  //         }).addTo(this.map);

  //         endMarker.bindPopup(`
  //         <b>END</b><br/>
  //         <b>Employee:</b> ${employeeId}<br/>
  //         Lat: ${endPoint.latitude.toFixed(6)}<br/>
  //         Lng: ${endPoint.longitude.toFixed(6)}<br/>
  //         Time: ${new Date(endPoint.tracked_at).toLocaleString()}
  //       `);

  //         this.markers.push(endMarker);
  //         bounds.extend([endPoint.latitude, endPoint.longitude]);
  //       }

  //       const totalSegments = sortedPoints.length - 1;

  //       const arrowSpacing = Math.max(2, Math.floor(totalSegments / 8));

  //       for (let i = 0; i < totalSegments; i += arrowSpacing) {
  //         const currentPoint = sortedPoints[i];
  //         const nextPoint = sortedPoints[i + 1];

  //         const segmentRatio = 0.6;
  //         const arrowLat = currentPoint.latitude + (nextPoint.latitude - currentPoint.latitude) * segmentRatio;
  //         const arrowLon = currentPoint.longitude + (nextPoint.longitude - currentPoint.longitude) * segmentRatio;

  //         const bearing = this.calculateBearing(
  //           currentPoint.latitude,
  //           currentPoint.longitude,
  //           nextPoint.latitude,
  //           nextPoint.longitude
  //         );

  //         const arrowIcon = this.createArrowIcon(bearing);
  //         const arrowMarker = L.marker([arrowLat, arrowLon], {
  //           icon: arrowIcon
  //         }).addTo(this.map);

  //         this.arrowMarkers.push(arrowMarker);
  //       }

  //       if (sortedPoints.length >= 2) {
  //         const firstPoint = sortedPoints[0];
  //         const secondPoint = sortedPoints[1];
  //         const initialBearing = this.calculateBearing(
  //           firstPoint.latitude,
  //           firstPoint.longitude,
  //           secondPoint.latitude,
  //           secondPoint.longitude
  //         );

  //         const startRatio = 0.3;
  //         const startArrowLat = firstPoint.latitude + (secondPoint.latitude - firstPoint.latitude) * startRatio;
  //         const startArrowLon = firstPoint.longitude + (secondPoint.longitude - firstPoint.longitude) * startRatio;

  //         const startArrowIcon = this.createArrowIcon(initialBearing);
  //         const startArrowMarker = L.marker([startArrowLat, startArrowLon], {
  //           icon: startArrowIcon
  //         }).addTo(this.map);

  //         this.arrowMarkers.push(startArrowMarker);
  //       }

  //       if (sortedPoints.length >= 2) {
  //         const secondLastPoint = sortedPoints[sortedPoints.length - 2];
  //         const lastPoint = sortedPoints[sortedPoints.length - 1];
  //         const finalBearing = this.calculateBearing(
  //           secondLastPoint.latitude,
  //           secondLastPoint.longitude,
  //           lastPoint.latitude,
  //           lastPoint.longitude
  //         );

  //         const endRatio = 0.7;
  //         const endArrowLat = secondLastPoint.latitude + (lastPoint.latitude - secondLastPoint.latitude) * endRatio;
  //         const endArrowLon = secondLastPoint.longitude + (lastPoint.longitude - secondLastPoint.longitude) * endRatio;

  //         const endArrowIcon = this.createArrowIcon(finalBearing);
  //         const endArrowMarker = L.marker([endArrowLat, endArrowLon], {
  //           icon: endArrowIcon
  //         }).addTo(this.map);

  //         this.arrowMarkers.push(endArrowMarker);
  //       }
  //     });

  //     if (bounds.isValid()) {
  //       this.map.fitBounds(bounds, { padding: [50, 50] });
  //     }
  //   });
  // }

  toggleLiveTracking() {
    if (!this.currentTrackingUser) {
      console.warn('No user selected for live tracking');
      return;
    }

    const employeeData = encodeURIComponent(JSON.stringify(this.currentTrackingUser));

    console.log(employeeData, "employeeData");

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

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;

    if (this.isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const fullscreenIcon = document.querySelector('.leaflet-control-fullscreen i');
    if (fullscreenIcon) {
      fullscreenIcon.className = `fas ${this.isFullScreen ? 'fa-compress' : 'fa-expand'}`;
    }

    const fullscreenLink = document.querySelector('.leaflet-control-fullscreen');
    if (fullscreenLink) {
      fullscreenLink.setAttribute('title', this.isFullScreen ? 'Exit Full Screen' : 'Toggle Full Screen');
    }

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 100);
      }
    }, 200);
  }

  zoomIn() {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut() {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  ngOnDestroy() {
    this.stopLiveTracking();
    if (this.trafficLayer && this.map) {
      this.map.removeLayer(this.trafficLayer);
      this.trafficLayer = null;
    }
  }
}
