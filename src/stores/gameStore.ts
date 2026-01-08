import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { Game, GameWithDetails, GameStatus, ParticipantStatus } from '../types/database';
import { useAuthStore } from './authStore';
import { useLocationStore, calculateDistance } from './locationStore';

interface GameState {
  games: GameWithDetails[];
  nearbyGames: GameWithDetails[];
  myGames: GameWithDetails[];
  selectedGame: GameWithDetails | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNearbyGames: (radiusKm?: number) => Promise<void>;
  fetchMyGames: () => Promise<void>;
  fetchGameById: (gameId: string) => Promise<void>;
  createGame: (game: Omit<Game, 'id' | 'created_at' | 'updated_at' | 'players_joined'>) => Promise<Game | null>;
  updateGame: (gameId: string, updates: Partial<Game>) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
  leaveGame: (gameId: string) => Promise<void>;
  updateParticipantStatus: (gameId: string, playerId: string, status: ParticipantStatus) => Promise<void>;
  subscribeToGame: (gameId: string) => () => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  nearbyGames: [],
  myGames: [],
  selectedGame: null,
  isLoading: false,
  error: null,

  fetchNearbyGames: async (radiusKm = 10) => {
    try {
      set({ isLoading: true, error: null });
      
      const location = useLocationStore.getState().currentLocation;
      
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          court:courts(*),
          organizer:profiles!organizer_id(*),
          participants:game_participants(
            *,
            player:profiles(*)
          )
        `)
        .in('status', ['open', 'in_progress'])
        .gte('game_date', new Date().toISOString().split('T')[0])
        .order('game_date', { ascending: true });
      
      if (error) throw error;
      
      let filteredGames = data as GameWithDetails[];
      
      // Filter by distance if location is available
      if (location) {
        filteredGames = filteredGames.filter((game) => {
          const gameLat = game.court?.latitude || game.latitude;
          const gameLon = game.court?.longitude || game.longitude;
          
          if (!gameLat || !gameLon) return true; // Include games without location
          
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            gameLat,
            gameLon
          );
          
          return distance <= radiusKm;
        });
      }
      
      set({ nearbyGames: filteredGames, games: data as GameWithDetails[] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyGames: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;
    
    try {
      set({ isLoading: true, error: null });
      
      // Games I organized
      const { data: organizedGames, error: orgError } = await supabase
        .from('games')
        .select(`
          *,
          court:courts(*),
          organizer:profiles!organizer_id(*),
          participants:game_participants(
            *,
            player:profiles(*)
          )
        `)
        .eq('organizer_id', profile.id)
        .order('game_date', { ascending: true });
      
      if (orgError) throw orgError;
      
      // Games I joined
      const { data: joinedGames, error: joinError } = await supabase
        .from('game_participants')
        .select(`
          game:games(
            *,
            court:courts(*),
            organizer:profiles!organizer_id(*),
            participants:game_participants(
              *,
              player:profiles(*)
            )
          )
        `)
        .eq('player_id', profile.id)
        .in('status', ['pending', 'approved']);
      
      if (joinError) throw joinError;
      
      const allMyGames = [
        ...(organizedGames as GameWithDetails[]),
        ...(joinedGames?.map((j: any) => j.game).filter(Boolean) as GameWithDetails[]),
      ];
      
      // Remove duplicates
      const uniqueGames = allMyGames.filter(
        (game, index, self) => index === self.findIndex((g) => g.id === game.id)
      );
      
      set({ myGames: uniqueGames });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGameById: async (gameId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          court:courts(*),
          organizer:profiles!organizer_id(*),
          participants:game_participants(
            *,
            player:profiles(*)
          )
        `)
        .eq('id', gameId)
        .single();
      
      if (error) throw error;
      
      set({ selectedGame: data as GameWithDetails });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createGame: async (game) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('games')
        .insert({
          ...game,
          players_joined: 0,
          status: 'open' as GameStatus,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh games list
      await get().fetchNearbyGames();
      await get().fetchMyGames();
      
      return data;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateGame: async (gameId: string, updates: Partial<Game>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('games')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', gameId);
      
      if (error) throw error;
      
      await get().fetchGameById(gameId);
      await get().fetchMyGames();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGame: async (gameId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);
      
      if (error) throw error;
      
      set({ selectedGame: null });
      await get().fetchMyGames();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  joinGame: async (gameId: string) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;
    
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('game_participants')
        .insert({
          game_id: gameId,
          player_id: profile.id,
          status: 'pending' as ParticipantStatus,
        });
      
      if (error) throw error;
      
      await get().fetchGameById(gameId);
      await get().fetchMyGames();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  leaveGame: async (gameId: string) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;
    
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('game_participants')
        .delete()
        .eq('game_id', gameId)
        .eq('player_id', profile.id);
      
      if (error) throw error;
      
      await get().fetchGameById(gameId);
      await get().fetchMyGames();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateParticipantStatus: async (gameId: string, playerId: string, status: ParticipantStatus) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('game_participants')
        .update({ status })
        .eq('game_id', gameId)
        .eq('player_id', playerId);
      
      if (error) throw error;
      
      // Update players_joined count if approved
      if (status === 'approved') {
        const game = get().selectedGame;
        if (game) {
          await supabase
            .from('games')
            .update({ players_joined: game.players_joined + 1 })
            .eq('id', gameId);
        }
      }
      
      await get().fetchGameById(gameId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToGame: (gameId: string) => {
    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        () => {
          get().fetchGameById(gameId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          get().fetchGameById(gameId);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  },

  clearError: () => set({ error: null }),
}));
