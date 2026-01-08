import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { NearbyPlayer, Profile } from '../types/database';
import { useAuthStore } from './authStore';
import { useLocationStore, calculateDistance } from './locationStore';

interface PlayerState {
  nearbyPlayers: NearbyPlayer[];
  selectedPlayer: Profile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNearbyPlayers: (radiusKm?: number) => Promise<void>;
  fetchPlayerById: (playerId: string) => Promise<void>;
  toggleAvailability: () => Promise<void>;
  clearError: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  nearbyPlayers: [],
  selectedPlayer: null,
  isLoading: false,
  error: null,

  fetchNearbyPlayers: async (radiusKm = 10) => {
    const profile = useAuthStore.getState().profile;
    const location = useLocationStore.getState().currentLocation;
    
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_available', true)
        .not('id', 'eq', profile?.id || '');
      
      if (error) throw error;
      
      let players = data as NearbyPlayer[];
      
      // Calculate distance and filter if location is available
      if (location) {
        players = players
          .map((player) => {
            if (player.latitude && player.longitude) {
              const distance = calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                player.latitude,
                player.longitude
              );
              return { ...player, distance };
            }
            return { ...player, distance: undefined };
          })
          .filter((player) => {
            // Include players without location or within radius
            if (player.distance === undefined) return true;
            return player.distance <= radiusKm;
          })
          .sort((a, b) => {
            // Sort by distance (players without distance go last)
            if (a.distance === undefined) return 1;
            if (b.distance === undefined) return -1;
            return a.distance - b.distance;
          });
      }
      
      set({ nearbyPlayers: players });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPlayerById: async (playerId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', playerId)
        .single();
      
      if (error) throw error;
      
      set({ selectedPlayer: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleAvailability: async () => {
    const profile = useAuthStore.getState().profile;
    const updateProfile = useAuthStore.getState().updateProfile;
    
    if (!profile) return;
    
    try {
      await updateProfile({ is_available: !profile.is_available });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));
