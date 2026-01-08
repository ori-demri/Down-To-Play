import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { Court } from '../types/database';
import { useLocationStore, calculateDistance } from './locationStore';

interface CourtState {
  courts: Court[];
  nearbyCourts: Court[];
  selectedCourt: Court | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNearbyCourts: (radiusKm?: number) => Promise<void>;
  fetchCourtById: (courtId: string) => Promise<void>;
  createCourt: (court: Omit<Court, 'id' | 'created_at' | 'updated_at'>) => Promise<Court | null>;
  searchCourts: (query: string) => Promise<void>;
  clearError: () => void;
}

export const useCourtStore = create<CourtState>((set, get) => ({
  courts: [],
  nearbyCourts: [],
  selectedCourt: null,
  isLoading: false,
  error: null,

  fetchNearbyCourts: async (radiusKm = 15) => {
    const location = useLocationStore.getState().currentLocation;
    
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      let courts = data as Court[];
      
      // Filter by distance if location is available
      if (location) {
        courts = courts
          .map((court) => ({
            ...court,
            distance: calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              court.latitude,
              court.longitude
            ),
          }))
          .filter((court) => (court as any).distance <= radiusKm)
          .sort((a, b) => (a as any).distance - (b as any).distance);
      }
      
      set({ nearbyCourts: courts, courts: data as Court[] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCourtById: async (courtId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('id', courtId)
        .single();
      
      if (error) throw error;
      
      set({ selectedCourt: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createCourt: async (court) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('courts')
        .insert(court)
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh courts list
      await get().fetchNearbyCourts();
      
      return data;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  searchCourts: async (query: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      set({ courts: data as Court[] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
