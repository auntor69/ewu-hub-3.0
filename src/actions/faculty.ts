// TODO(Supabase): Replace stub with actual Supabase call
// - bookExtraClass: INSERT bookings with resource_kind='room', max 75 minutes

export interface ExtraClassParams {
  roomCode: string;
  start: string;
  end: string;
}

export const bookExtraClass = async (params: ExtraClassParams): Promise<void> => {
  console.log('bookExtraClass called with:', params);
  return Promise.reject(new Error("NOT_CONNECTED"));
};