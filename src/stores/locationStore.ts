import { create } from 'zustand';
import * as Location from 'expo-location';
import { supabase } from '../config/supabase';
import { useAuthStore } from './authStore';

interface LocationState {
  currentLocation: Location.LocationObject | null;
  permissionStatus: Location.PermissionStatus | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Location.LocationObject | null>;
  updateUserLocation: () => Promise<void>;
  watchLocation: () => Promise<Location.LocationSubscription | null>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  permissionStatus: null,
  isLoading: false,
  error: null,

  requestPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      set({ permissionStatus: status });
      return status === 'granted';
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  getCurrentLocation: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const permissionGranted = await get().requestPermission();
      if (!permissionGranted) {
        throw new Error('Location permission not granted');
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      set({ currentLocation: location });
      return location;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserLocation: async () => {
    const location = get().currentLocation;
    const profile = useAuthStore.getState().profile;
    
    if (!location || !profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          last_location_update: new Date().toISOString(),
        })
        .eq('id', profile.id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Update location error:', error);
      set({ error: error.message });
    }
  },

  watchLocation: async () => {
    try {
      const permissionGranted = await get().requestPermission();
      if (!permissionGranted) return null;
      
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 100, // Or every 100 meters
        },
        (location) => {
          set({ currentLocation: location });
          get().updateUserLocation();
        }
      );
      
      return subscription;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },
}));

// Utility function to calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
