import { supabase } from '../lib/supabaseClient';

export interface ExtraClassParams {
  roomCode: string;
  start: string;
  end: string;
}

export const bookExtraClass = async (params: ExtraClassParams): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get room resource ID
  const { data: room, error: roomError } = await supabase
    .from('resources')
    .select('id')
    .eq('kind', 'room')
    .eq('label', params.roomCode)
    .single();

  if (roomError) throw new Error('Room not found');

  // Validate duration (max 75 minutes)
  const startTime = new Date(params.start);
  const endTime = new Date(params.end);
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  
  if (durationMinutes > 75) {
    throw new Error('Maximum class duration is 75 minutes');
  }

  const { error } = await supabase
    .from('bookings')
    .insert({
      resource_id: room.id,
      booked_by: user.id,
      booked_for: user.id,
      start_ts: startTime.toISOString(),
      end_ts: endTime.toISOString(),
      status: 'confirmed'
    });

  if (error) throw error;

  // Log audit entry
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'booking.create',
    payload: { type: 'room', room: params.roomCode, duration: durationMinutes }
  });
};

export const getFacultyClasses = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      start_ts,
      end_ts,
      status,
      resources (
        label
      )
    `)
    .eq('booked_by', user.id)
    .eq('resources.kind', 'room')
    .order('start_ts', { ascending: false });

  if (error) throw error;
  return data;
};