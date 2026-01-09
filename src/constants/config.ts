// App configuration constants

export const MAP_CONFIG = {
  // Default location (can be a central location in your target region)
  defaultRegion: {
    latitude: 40.4168, // Madrid, Spain as default
    longitude: -3.7038,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // How much to zoom when centering on user location
  userLocationDelta: {
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  
  // Search radius in meters
  defaultSearchRadius: 5000, // 5km
  maxSearchRadius: 50000, // 50km
  
  // Marker clustering threshold
  clusteringThreshold: 50, // cluster markers when more than 50
} as const;

export const LOCATION_CONFIG = {
  // Location update settings
  distanceInterval: 100, // meters between updates
  timeInterval: 10000, // ms between updates
  
  // Timeout for getting location
  timeout: 15000, // 15 seconds
} as const;
