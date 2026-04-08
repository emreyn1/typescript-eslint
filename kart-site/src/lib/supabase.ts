import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = url && key ? createClient(url, key) : null;

export interface DbUser {
  id: string;
  email: string;
  balance: number;
  created_at: string;
}

export interface DbCard {
  id: string;
  user_id: string;
  provider_card_id: string;
  type: string;
  label: string;
  last_four: string;
  status: string;
  created_at: string;
}

export interface DbPayment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  provider: string;
  provider_id: string;
  status: string;
  created_at: string;
}
