import { supabase } from './supabase';
import { User, AuthSession } from '../types';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'booklocal_session';

export const authService = {
  async signUp(
    email: string,
    password: string,
    fullName: string,
    phone: string,
    isBusinessOwner: boolean
  ): Promise<{ error: string | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone,
          is_business_owner: isBusinessOwner,
        },
      },
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: 'Sign up failed. Please try again.' };
    return { error: null };
  },

  async signIn(email: string, password: string): Promise<{ session: AuthSession | null; error: string | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { session: null, error: error.message };
    if (!data.session || !data.user) return { session: null, error: 'Login failed.' };

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const session: AuthSession = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: profile as User,
    };

    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    return { session, error: null };
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },

  async getStoredSession(): Promise<AuthSession | null> {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile as User | null;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    return { error: error?.message ?? null };
  },

  async saveFcmToken(userId: string, token: string): Promise<void> {
    await supabase.from('users').update({ fcm_token: token }).eq('id', userId);
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'booklocal://reset-password',
    });
    return { error: error?.message ?? null };
  },
};
