import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cohoacpqbefjadhhfwdo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvaG9hY3BxYmVmamFkaGhmd2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjgwNTYsImV4cCI6MjA2NjQ0NDA1Nn0.JtVcoXMA4RrzsFXQXDsIu_y5YXTwKjs8q2iuv2alnm0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Save or update the alarm time for a user in Supabase.
 * @param userId The user's unique id (from Supabase auth)
 * @param alarmTime The alarm time as a Date object
 */
export async function saveAlarmTime(userId: string, alarmTime: Date) {
  // Save as ISO string for consistency
  const { data, error } = await supabase
    .from('alarms')
    .upsert([
      { uuid: userId, alarms: alarmTime.toISOString() },
    ], { onConflict: 'uuid' });
  if (error) throw error;
  return data;
}
