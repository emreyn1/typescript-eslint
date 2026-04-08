/**
 * Wanttopay API client for virtual card issuance.
 * Docs: https://docs.wanttopay.com
 */

const API_URL = process.env.WANTTOPAY_API_URL || "https://api.wanttopay.com/v1";

function getKey(): string {
  const key = process.env.WANTTOPAY_API_KEY;
  if (!key) throw new Error("WANTTOPAY_API_KEY is not set");
  return key;
}

async function request(
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: Record<string, unknown>,
) {
  const opts: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}/${path}`, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Wanttopay API error: ${res.status} ${text}`);
  }
  return res.json();
}

export interface CardCreateParams {
  type: "basic" | "smart";
  currency?: string;
  label?: string;
}

export interface Card {
  id: string;
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  balance: number;
  currency: string;
  status: "active" | "frozen" | "cancelled";
  type: string;
  created_at: string;
}

export async function createCard(params: CardCreateParams): Promise<Card> {
  const data = await request("POST", "cards", {
    type: params.type,
    currency: params.currency || "USD",
    label: params.label,
  });
  return data.data ?? data;
}

export async function getCard(cardId: string): Promise<Card> {
  const data = await request("GET", `cards/${cardId}`);
  return data.data ?? data;
}

export async function listCards(): Promise<Card[]> {
  const data = await request("GET", "cards");
  return data.data ?? [];
}

export async function topUpCard(
  cardId: string,
  amount: number,
  currency?: string,
): Promise<{ success: boolean; new_balance: number }> {
  const data = await request("POST", `cards/${cardId}/topup`, {
    amount,
    currency: currency || "USD",
  });
  return data.data ?? data;
}

export async function freezeCard(
  cardId: string,
): Promise<{ success: boolean }> {
  const data = await request("PATCH", `cards/${cardId}`, {
    status: "frozen",
  });
  return { success: true };
}

export async function unfreezeCard(
  cardId: string,
): Promise<{ success: boolean }> {
  const data = await request("PATCH", `cards/${cardId}`, {
    status: "active",
  });
  return { success: true };
}

export async function getTransactions(
  cardId: string,
): Promise<unknown[]> {
  const data = await request("GET", `cards/${cardId}/transactions`);
  return data.data ?? [];
}
