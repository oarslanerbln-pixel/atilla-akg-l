import Stripe from 'stripe';
import { env } from './config';

let client: Stripe | null = null;

export function stripe(): Stripe {
  client ??= new Stripe(env('STRIPE_SECRET_KEY'));
  return client;
}
