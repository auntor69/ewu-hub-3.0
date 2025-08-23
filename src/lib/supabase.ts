import { supabase } from './supabaseClient';

// Real-time subscription helpers
export const subscribeToBookings = (callback: (payload: any) => void) => {
  return supabase
    .channel('bookings-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'bookings' }, 
      callback
    )
    .subscribe();
};

export const subscribeToResources = (callback: (payload: any) => void) => {
  return supabase
    .channel('resources-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'resources' }, 
      callback
    )
    .subscribe();
};

// Helper functions for common queries
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const getOpeningHours = async () => {
  const { data, error } = await supabase
    .from('opening_hours')
    .select('*')
    .eq('resource_scope', 'global')
    .order('dow');
  
  if (error) throw error;
  return data;
};

// Check if current time is within operating hours
export const isWithinOperatingHours = async () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  const { data: hours } = await supabase
    .from('opening_hours')
    .select('*')
    .eq('resource_scope', 'global')
    .eq('dow', dayOfWeek)
    .single();

  if (!hours || hours.closed) return false;
  
  return currentTime >= hours.open_time && currentTime <= hours.close_time;
};

export default supabase;