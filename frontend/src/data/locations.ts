export type LocationKind = 'source' | 'collector' | 'recycler';

export interface MapLocationData {
  id: string;
  name: string;
  kind: LocationKind;
  address: string;
  district?: string;
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

export const TAMIL_NADU_DISTRICTS = [
  'All Tamil Nadu',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Trichy',
  'Salem',
  'Hosur',
  'Vellore',
] as const;

export const sourceMapLocations: MapLocationData[] = [
  // Chennai Hubs
  { id: 'source-chennai-home', name: 'Your pickup location', kind: 'source', address: 'Anna Nagar, Chennai', district: 'Chennai', lat: 13.085, lng: 80.2101, detail: 'Pickup destination' },
  { id: 'collector-rajan', name: 'Rajan Kumar (E-Fleet)', kind: 'collector', address: 'Shenoy Nagar, Chennai', district: 'Chennai', lat: 13.0792, lng: 80.2261, distance: '1.2 km away', eta: 'ETA 6 min', rating: 4.8, offer: 850, detail: 'Verified collector' },
  { id: 'collector-ecomove', name: 'EcoMove Collections', kind: 'collector', address: 'Guindy Industrial Estate, Chennai', district: 'Chennai', lat: 13.0067, lng: 80.2025, distance: '5.4 km away', eta: 'ETA 15 min', rating: 4.7, offer: 810, detail: 'Battery-trained team' },
  
  // Coimbatore Hubs
  { id: 'collector-kovai-green', name: 'Kovai CleanTech Logistics', kind: 'collector', address: 'Peelamedu, Coimbatore', district: 'Coimbatore', lat: 11.0269, lng: 77.0125, distance: '2.8 km away', eta: 'ETA 9 min', rating: 4.9, offer: 920, detail: 'TNPCB Authorized collector' },
  { id: 'recycler-sidco-cbe', name: 'Kongu E-Waste Recovery Hub', kind: 'recycler', address: 'SIDCO Industrial Estate, Kurichi, Coimbatore', district: 'Coimbatore', lat: 10.9328, lng: 76.9682, authorized: true, accepts: ['PCBs', 'Batteries', 'Consumer Tech'], detail: 'Authorized smelter partner' },
  
  // Madurai Hubs
  { id: 'collector-madurai-swift', name: 'Pandyan E-Logistics', kind: 'collector', address: 'Mattuthavani, Madurai', district: 'Madurai', lat: 9.9482, lng: 78.1584, distance: '3.1 km away', eta: 'ETA 12 min', rating: 4.7, offer: 790, detail: 'Southern TN regional hub' },
  { id: 'recycler-kappalur', name: 'Vaigai EcoRefiners', kind: 'recycler', address: 'Kappalur Industrial Estate, Madurai', district: 'Madurai', lat: 9.8436, lng: 78.0321, authorized: true, accepts: ['Lithium Cells', 'Motherboards'], detail: 'Certified refiner' },
  
  // Tiruchirappalli (Trichy) Hubs
  { id: 'collector-trichy-central', name: 'Cauvery Circular Logistics', kind: 'collector', address: 'Thillai Nagar, Tiruchirappalli', district: 'Trichy', lat: 10.8267, lng: 78.6836, distance: '1.9 km away', eta: 'ETA 8 min', rating: 4.8, offer: 840, detail: 'Central TN dispatch fleet' },
  { id: 'recycler-bhel-trichy', name: 'BHEL Ancillary Recovery Centre', kind: 'recycler', address: 'Thuvakudi Industrial Estate, Trichy', district: 'Trichy', lat: 10.7489, lng: 78.7892, authorized: true, accepts: ['Transformers', 'Server Racks', 'Industrial WEEE'], detail: 'Large-scale processing' },

  // Salem Hubs
  { id: 'collector-salem-steel', name: 'Steel City Scrap Logistics', kind: 'collector', address: 'Shevapet, Salem', district: 'Salem', lat: 11.6534, lng: 78.1423, distance: '4.0 km away', eta: 'ETA 14 min', rating: 4.6, offer: 800, detail: 'Electronics lot pickup' },

  // Hosur / Vellore Hubs
  { id: 'collector-hosur-tech', name: 'Hosur Electronics Aggregator', kind: 'collector', address: 'SIPCOT Phase II, Hosur', district: 'Hosur', lat: 12.7409, lng: 77.8253, distance: '3.6 km away', eta: 'ETA 10 min', rating: 4.9, offer: 950, detail: 'OEM tier-1 supplier return' },
  { id: 'recycler-ranipet-vellore', name: 'Ranipet Environmental Plant', kind: 'recycler', address: 'SIPCOT Industrial Complex, Ranipet, Vellore', district: 'Vellore', lat: 12.9298, lng: 79.3326, authorized: true, accepts: ['Lead-acid', 'Solar Inverters', 'PCBs'], detail: 'Zero-discharge facility' },
];

export const collectorMapLocations: MapLocationData[] = [
  { id: 'job-source-chennai', name: 'Priya’s IT Asset Pickup', kind: 'source', address: 'Anna Nagar, Chennai', district: 'Chennai', lat: 13.085, lng: 80.2101, distance: '1.2 km away', eta: 'ETA 6 min', detail: '2 laptops · pickup confirmed' },
  { id: 'collector-current', name: 'Your Smart Truck', kind: 'collector', address: 'Shenoy Nagar, Chennai', district: 'Chennai', lat: 13.0792, lng: 80.2261, detail: 'Live collector location' },
  { id: 'recycler-greenloop', name: 'GreenLoop Refining Facility', kind: 'recycler', address: 'SIPCOT Sriperumbudur, Tamil Nadu', district: 'Chennai', lat: 12.9675, lng: 79.9412, distance: '8.5 km', eta: 'ETA 22 min', rating: 4.9, authorized: true, accepts: ['Batteries', 'Electronics'], detail: 'Authorized facility' },
  
  // Coimbatore Job
  { id: 'job-cbe-server', name: 'Tidel Park Enterprise Consignment', kind: 'source', address: 'ELCOT SEZ, Coimbatore', district: 'Coimbatore', lat: 11.0312, lng: 77.0398, distance: '4.2 km away', eta: 'ETA 14 min', detail: '45 Servers · CPCB manifest active' },
  // Madurai Job
  { id: 'job-mdu-telecom', name: 'Telecom Tower Battery Lot', kind: 'source', address: 'Ring Road, Madurai', district: 'Madurai', lat: 9.9124, lng: 78.1402, distance: '6.1 km away', eta: 'ETA 19 min', detail: '320 kg UPS modules' },
];

export const recyclerMapLocations: MapLocationData[] = [
  { id: 'recycler-facility-chennai', name: 'GreenLoop Sriperumbudur Facility', kind: 'recycler', address: 'SIPCOT Sriperumbudur, Tamil Nadu', district: 'Chennai', lat: 12.9675, lng: 79.9412, authorized: true, detail: 'Receiving destination' },
  { id: 'incoming-rajan', name: 'Rajan · LOT-2048', kind: 'collector', address: 'Poonamallee, Chennai', district: 'Chennai', lat: 13.0473, lng: 80.0945, distance: '5.2 km away', eta: 'ETA 18 min', detail: '24.6 kg incoming lot' },
  { id: 'recycler-cbe-plant', name: 'Kongu Green Smelting Facility', kind: 'recycler', address: 'SIDCO Kurichi, Coimbatore', district: 'Coimbatore', lat: 10.9328, lng: 76.9682, authorized: true, detail: 'Western TN processing hub' },
  { id: 'incoming-circular', name: 'Circular Route · LOT-2051', kind: 'collector', address: 'Peelamedu, Coimbatore', district: 'Coimbatore', lat: 11.0269, lng: 77.0125, distance: '9.1 km away', eta: 'ETA 29 min', detail: '42.8 kg · pending verification' },
];

export const sourceDemoRoute: DemoRouteData = {
  from: 'Rajan Kumar (E-Fleet Shenoy Nagar)',
  to: 'Your pickup location (Anna Nagar, Chennai)',
  distance: '1.2 km',
  eta: '6 min',
  status: 'Collector approaching via EV truck',
};

export const collectorDemoRoute: DemoRouteData = {
  from: 'Your live area (Shenoy Nagar)',
  to: 'Priya’s pickup (Anna Nagar)',
  distance: '1.2 km',
  eta: '6 min',
  status: 'Pickup route GPS active',
};

export const recyclerDemoRoute: DemoRouteData = {
  from: 'Rajan · LOT-2048 (Poonamallee)',
  to: 'GreenLoop Facility (Sriperumbudur)',
  distance: '5.2 km',
  eta: '18 min',
  status: 'Incoming material manifest verified',
};
