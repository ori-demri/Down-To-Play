import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '@/types';
import { LOCATION_CONFIG } from '@/constants';
import { mapLogger } from '@/utils/logger';

interface LocationState {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
}

interface UseLocationReturn extends LocationState {
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Coordinates | null>;
  refreshLocation: () => Promise<void>;
}

export function useLocation(): UseLocationReturn {
  const [state, setState] = useState<LocationState>({
    coordinates: null,
    isLoading: true,
    error: null,
    permissionStatus: null,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setState(prev => ({ ...prev, permissionStatus: status }));
      mapLogger.debug('Location permission status', { status });
      return status === 'granted';
    } catch (error) {
      mapLogger.error('Error requesting location permission', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION_CONFIG.timeout,
      });

      const coordinates: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setState(prev => ({
        ...prev,
        coordinates,
        isLoading: false,
        error: null,
      }));

      return coordinates;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const refreshLocation = useCallback(async (): Promise<void> => {
    const hasPermission = await requestPermission();
    if (hasPermission) {
      await getCurrentLocation();
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Location permission denied',
      }));
    }
  }, [requestPermission, getCurrentLocation]);

  // Initial location fetch on mount
  useEffect(() => {
    refreshLocation();
  }, []);

  return {
    ...state,
    requestPermission,
    getCurrentLocation,
    refreshLocation,
  };
}
