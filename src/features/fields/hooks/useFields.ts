import { useState, useEffect, useCallback } from 'react';
import { Field, Coordinates } from '@/types';
import { fieldRepository } from '../repositories/fieldRepository';
import { fieldLogger } from '@/utils/logger';

interface UseFieldsReturn {
  fields: Field[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFields(
  userLocation: Coordinates | null,
  radiusMeters: number = 50000 // 50km default for development
): UseFieldsReturn {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all fields (for now, until we have location-based queries working)
      const fetchedFields = await fieldRepository.getAllFields();
      setFields(fetchedFields);
      fieldLogger.debug('Fields fetched successfully', { count: fetchedFields.length });
    } catch (err) {
      fieldLogger.error('Error fetching fields', { 
        error: err instanceof Error ? err.message : String(err) 
      });
      setError(err instanceof Error ? err.message : 'Failed to fetch fields');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch fields on mount and when location changes
  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return {
    fields,
    isLoading,
    error,
    refetch: fetchFields,
  };
}
