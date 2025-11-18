import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createServiceClient } from '@/app/lib/supabase/service';
import { Database } from '@/app/lib/supabase/types';

type UserInsert = Database['public']['Tables']['users']['Insert'];

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  const supabase = createServiceClient();

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Create user in our database
    const newUser: UserInsert = {
      clerk_user_id: id,
      email: email_addresses[0].email_address,
      display_name: first_name && last_name ? `${first_name} ${last_name}` : null,
      avatar_url: image_url || null,
      subscription_tier: 'free',
    };

    // @ts-ignore - Supabase type inference issue with server client
    const { error } = await supabase.from('users').insert([newUser]);
    
    if (error) {
      console.error('Error creating user:', error);
      return new Response('Error creating user', { status: 500 });
    }
    
    console.log('✅ User created:', id);
  }
  
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const updateData = {
      email: email_addresses[0].email_address,
      display_name: first_name && last_name ? `${first_name} ${last_name}` : null,
      avatar_url: image_url || null,
    };
    
    // @ts-ignore - Supabase type inference issue with server client
    const { error } = await supabase.from('users').update(updateData).eq('clerk_user_id', id);
    
    if (error) {
      console.error('Error updating user:', error);
    }
  }
  
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    // Soft delete (set is_active = false)
    // @ts-ignore - Supabase type inference issue with server client
    const { error } = await supabase.from('users').update({ is_active: false }).eq('clerk_user_id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
    }
  }

  return new Response('', { status: 200 });
}
