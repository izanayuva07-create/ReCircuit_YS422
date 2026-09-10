export type LocationKind = 'source' | 'collector' | 'recycler';

export interface MapLocationData {
  id: string;
  name: string;
  kind: LocationKind;
  address: string;
  lat: number;
  lng: number;
  distance?: string;
  eta?: string;
  rating?: number;
  offer?: number;
  authorized?: boolean;
  accepts?: string[];
  detail?: string;
}

export interface DemoRouteData {
  from: string;
  to: string;
  distance: string;
  eta: string;
  status: string;
}

export const sourceMapLocations: MapLocationData[] = [
  { id: 'source-home', name: 'Your pickup location', kind: 'source', address: 'Anna Nagar, Chennai', lat: 13.085, lng: 80.2101, detail: 'Pickup destination' },
  { id: 'collector-rajan', name: 'Rajan Kumar', kind: 'collector', address: 'Shenoy Nagar, Chennai', lat: 13.0792, lng: 80.2261, distance: '1.2 km away', eta: 'ETA 6 min', rating: 4.8, offer: 850, detail: 'Verified collector' },
  { id: 'collector-ecomove', name: 'EcoMove Collections', kind: 'collector', address: 'Kilpauk, Chennai', lat: 13.0827, lng: 80.2429, distance: '2.7 km away', eta: 'ETA 11 min', rating: 4.7, offer: 810, detail: 'Battery-trained team' },
];

export const collectorMapLocations: MapLocationData[] = [
  { id: 'job-source', name: 'Priya’s pickup', kind: 'source', address: 'Anna Nagar, Chennai', lat: 13.085, lng: 80.2101, distance: '1.2 km away', eta: 'ETA 6 min', detail: '2 devices · pickup confirmed' },
  { id: 'collector-current', name: 'Your live area', kind: 'collector', address: 'Shenoy Nagar, Chennai', lat: 13.0792, lng: 80.2261, detail: 'Collector location' },
  { id: 'recycler-greenloop', name: 'GreenLoop Recycling', kind: 'recycler', address: 'Sriperumbudur, Chennai', lat: 12.9675, lng: 79.9412, distance: '8.5 km', eta: 'ETA 22 min', rating: 4.9, authorized: true, accepts: ['Batteries', 'Electronics'], detail: 'Authorized facility' },
];

export const recyclerMapLocations: MapLocationData[] = [
  { id: 'recycler-facility', name: 'GreenLoop Facility', kind: 'recycler', address: 'Sriperumbudur, Chennai', lat: 12.9675, lng: 79.9412, authorized: true, detail: 'Receiving destination' },
  { id: 'incoming-rajan', name: 'Rajan · LOT-2048', kind: 'collector', address: 'Poonamallee, Chennai', lat: 13.0473, lng: 80.0945, distance: '5.2 km away', eta: 'ETA 18 min', detail: '24.6 kg incoming lot' },
  { id: 'incoming-circular', name: 'Circular Route · LOT-2051', kind: 'collector', address: 'Porur, Chennai', lat: 13.0356, lng: 80.1582, distance: '9.1 km away', eta: 'ETA 29 min', detail: '17.3 kg · pending verification' },
];

export const sourceDemoRoute: DemoRouteData = { from: 'Rajan Kumar', to: 'Your pickup location', distance: '1.2 km', eta: '6 min', status: 'Collector approaching' };
export const collectorDemoRoute: DemoRouteData = { from: 'Your live area', to: 'Priya’s pickup', distance: '1.2 km', eta: '6 min', status: 'Pickup route ready' };
export const recyclerDemoRoute: DemoRouteData = { from: 'Rajan · LOT-2048', to: 'GreenLoop Facility', distance: '5.2 km', eta: '18 min', status: 'Incoming material' };
