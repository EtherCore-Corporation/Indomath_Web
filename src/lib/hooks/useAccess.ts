import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AccessInfo {
  hasAccess: boolean;
  expiresAt: string | null;
  purchaseId: string | null;
}

interface UseAccessReturn {
  isLoading: boolean;
  error: string | null;
  checkAccess: (contentType: string, contentId: string, courseType?: string, user?: User | null) => Promise<AccessInfo>;
  getUserAccess: () => Promise<unknown[]>;
  hasAccess: (contentType: string, contentId: string, courseType?: string, user?: User | null) => Promise<boolean>;
}

// Cache para evitar múltiples consultas
const accessCache = new Map<string, { data: AccessInfo; timestamp: number }>();
const CACHE_DURATION = 0; // Deshabilitar cache durante desarrollo

export function useAccess(): UseAccessReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async (
    contentType: string, 
    contentId: string, 
    courseType?: string,
    userParam?: User | null
  ): Promise<AccessInfo> => {
    // Crear clave de cache
    const cacheKey = `${userParam?.id || 'unknown'}-${contentType}-${contentId}-${courseType || ''}`;
    
    // Verificar cache
    const cached = accessCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🔄 Using cached access for:', cacheKey);
      return cached.data;
    }
    
    console.log('🔄 Cache miss or disabled, querying database...');

    setIsLoading(true);
    setError(null);

    try {
      // Usar el usuario pasado como parámetro
      const user = userParam;
      if (!user) {
        console.log('⚠️ No user provided to checkAccess');
        return { hasAccess: false, expiresAt: null, purchaseId: null };
      }

      console.log('🔍 Checking access for user:', user.id, 'content:', contentType, contentId);

      // Consulta directa simplificada para evitar errores RPC
      const { data: accessRecords, error: queryError } = await supabase
        .from('content_access')
        .select('expires_at, purchase_id, is_active')
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .gte('expires_at', new Date().toISOString());

      if (queryError) {
        console.error('❌ Error querying content_access:', queryError);
        
        // Si es error 406, intentar sin is_active
        if (queryError.code === 'PGRST116' || queryError.message?.includes('406')) {
          console.log('🔄 Retrying without is_active filter...');
          
          const { data: accessRecordsRetry, error: retryError } = await supabase
            .from('content_access')
            .select('expires_at, purchase_id')
            .eq('user_id', user.id)
            .eq('content_type', contentType)
            .eq('content_id', contentId)
            .gte('expires_at', new Date().toISOString());

          if (retryError) {
            console.error('❌ Retry also failed:', retryError);
            return { hasAccess: false, expiresAt: null, purchaseId: null };
          }

          const hasValidAccess = accessRecordsRetry && accessRecordsRetry.length > 0;
          const result = {
            hasAccess: hasValidAccess,
            expiresAt: hasValidAccess ? accessRecordsRetry[0].expires_at : null,
            purchaseId: hasValidAccess ? accessRecordsRetry[0].purchase_id : null
          };

          // Guardar en cache
          accessCache.set(cacheKey, { data: result, timestamp: Date.now() });
          console.log('✅ Access check completed (retry):', result);
          console.log('🔍 hasAccess (retry):', result.hasAccess, 'expiresAt:', result.expiresAt);
          
          return result;
        }

        return { hasAccess: false, expiresAt: null, purchaseId: null };
      }

      // Filtrar registros activos manualmente
      const activeRecords = accessRecords?.filter(record => 
        record.is_active !== false && new Date(record.expires_at) > new Date()
      ) || [];

      const hasValidAccess = activeRecords.length > 0;
      const result = {
        hasAccess: hasValidAccess,
        expiresAt: hasValidAccess ? (activeRecords[0] as Record<string, unknown>).expires_at as string : null,
        purchaseId: hasValidAccess ? (activeRecords[0] as Record<string, unknown>).purchase_id as string : null
      };

      // Guardar en cache
      accessCache.set(cacheKey, { data: result, timestamp: Date.now() });
      console.log('✅ Access check completed:', result);
      console.log('🔍 hasAccess:', result.hasAccess, 'expiresAt:', result.expiresAt);

      return result;
    } catch (err) {
      console.error('❌ Unexpected error in checkAccess:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return { hasAccess: false, expiresAt: null, purchaseId: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserAccess = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return [];
      }

      // Consulta directa simplificada sin RPC
      const { data, error } = await supabase
        .from('content_access')
        .select('content_type, content_id, course_type, expires_at')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .order('content_type', { ascending: true });

      if (error) {
        console.error('Error getting user access:', error);
        return [];
      }

      // Filtrar activos manualmente
      return (data || []).filter(record => 
        new Date(record.expires_at) > new Date()
      );
    } catch (err) {
      console.error('Error getting user access:', err);
      return [];
    }
  }, []);

  const hasAccess = useCallback(async (
    contentType: string, 
    contentId: string, 
    courseType?: string,
    user?: User | null
  ): Promise<boolean> => {
    const accessInfo = await checkAccess(contentType, contentId, courseType, user);
    return accessInfo.hasAccess;
  }, [checkAccess]);

  // Limpiar cache viejo periódicamente
  const clearOldCache = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of accessCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        accessCache.delete(key);
      }
    }
  }, []);

  // Limpiar cache al montar/desmontar
  useEffect(() => {
    const interval = setInterval(clearOldCache, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [clearOldCache]);

  return useMemo(() => ({
    isLoading,
    error,
    checkAccess,
    getUserAccess,
    hasAccess,
  }), [isLoading, error, checkAccess, getUserAccess, hasAccess]);
} 