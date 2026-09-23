// Geolocation & Distance Calculation Utility for NeedBridge
import { UserCoordinates } from '../types';
export type { UserCoordinates };

export const POPULAR_LOCATIONS: UserCoordinates[] = [
  { label: 'Pune (Shivajinagar / Central)', city: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { label: 'Pune (Kothrud & West)', city: 'Kothrud', state: 'Maharashtra', latitude: 18.5074, longitude: 73.8077 },
  { label: 'Pune (Hadapsar & East)', city: 'Hadapsar', state: 'Maharashtra', latitude: 18.5089, longitude: 73.9260 },
  { label: 'Pune (Pimpri-Chinchwad)', city: 'Pimpri-Chinchwad', state: 'Maharashtra', latitude: 18.6279, longitude: 73.8009 },
  { label: 'Alibaug / Raigad Coastal', city: 'Alibaug', state: 'Maharashtra', latitude: 18.6414, longitude: 72.8722 },
  { label: 'Mumbai (South & Central)', city: 'Mumbai', state: 'Maharashtra', latitude: 18.9220, longitude: 72.8347 },
  { label: 'Mumbai (Suburbs / Bandra)', city: 'Bandra', state: 'Maharashtra', latitude: 19.0596, longitude: 72.8295 },
  { label: 'Thane & Navi Mumbai', city: 'Thane', state: 'Maharashtra', latitude: 19.2183, longitude: 72.9781 },
  { label: 'Nashik', city: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
  { label: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { label: 'Delhi NCR', city: 'Delhi NCR', state: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
];

export const DEFAULT_USER_LOCATION: UserCoordinates = POPULAR_LOCATIONS[0]; // Pune Central

/**
 * Calculates Great-Circle Distance between two coordinates in Kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Formats distance with intuitive badge notation
 */
export function formatDistance(km: number | undefined): string {
  if (km === undefined || isNaN(km)) return 'Distance available on request';
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

/**
 * Get user browser GPS coordinates with fallback
 */
export function getUserBrowserCoordinates(): Promise<UserCoordinates> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_USER_LOCATION);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          label: 'Current GPS Location',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(DEFAULT_USER_LOCATION);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}
