import { supabase } from '../utils/supabase';

describe('supabase client', () => {
  it('should be initialized with correct URL', () => {
    expect(supabase).toBeDefined();
    expect(supabase.supabaseUrl).toBe(
      process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    );
  });
});
