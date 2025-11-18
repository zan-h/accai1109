import { clerkClient } from '@clerk/nextjs/server';
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { Database } from '@/app/lib/supabase/types';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];

const NO_ROWS_CODE = 'PGRST116';
const UNIQUE_VIOLATION = '23505';

/**
 * Ensures the Supabase `users` table has a record for the given Clerk user.
 * Attempts to look up the record and, if missing, backfills it using Clerk data.
 */
export async function getOrCreateSupabaseUser(
  supabase: SupabaseClient<Database>,
  clerkUserId: string
): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (data) {
    return data;
  }

  if (error && error.code !== NO_ROWS_CODE) {
    throw error;
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    ) ?? clerkUser.emailAddresses[0];

  if (!primaryEmail) {
    throw new Error(`Clerk user ${clerkUserId} is missing an email address`);
  }

  const newUser: UserInsert = {
    clerk_user_id: clerkUserId,
    email: primaryEmail.emailAddress,
    display_name:
      clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName ?? clerkUser.lastName ?? primaryEmail.emailAddress,
    avatar_url: clerkUser.imageUrl ?? null,
    subscription_tier: 'free',
    is_active: true,
  };

  try {
    const { data: inserted, error: insertError } = await (supabase
      .from('users')
      .insert as any)(newUser)
      .select('*')
      .single();

    if (insertError || !inserted) {
      throw insertError ?? new Error('Failed to insert user record');
    }

    return inserted;
  } catch (insertErr) {
    const errorObject = insertErr as PostgrestError & { code?: string };
    if (errorObject?.code === UNIQUE_VIOLATION) {
      const { data: existing, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (fetchError || !existing) {
        throw fetchError ?? new Error('Failed to fetch user after unique violation');
      }

      return existing;
    }

    throw insertErr;
  }
}
