import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';
import { generatePrefixedId } from '@/lib/shared/utils';

export async function POST(req: Request) {
  // CLERK_WEBHOOK_SECRET is required to verify the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Process the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

    // Extraer la dirección de correo electrónico principal
    const email = email_addresses?.[0]?.email_address || '';
    
    // Concatenar de forma segura el nombre completo
    const full_name = `${first_name || ''} ${last_name || ''}`.trim();
    
    // Procesamiento de Roles
    let role = 'logistics'; // default
    if (public_metadata && Array.isArray(public_metadata.roles) && public_metadata.roles.length > 0) {
      role = public_metadata.roles.join(',');
    }

    try {
      await prisma.usuario.upsert({
        where: { clerk_user_id: id },
        update: {
          email,
          full_name,
          role,
        },
        create: {
          id: generatePrefixedId('usr'),
          clerk_user_id: id,
          email,
          full_name,
          role,
        },
      });

      return new Response('User synced successfully', { status: 200 });
    } catch (error) {
      console.error('Error syncing user to database:', error);
      return new Response('Error syncing user', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 });
}
