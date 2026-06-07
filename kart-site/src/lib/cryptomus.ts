import crypto from 'crypto';

const CRYPTOMUS_API = 'https://api.cryptomus.com/v1';
const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID || '';
const API_KEY = process.env.CRYPTOMUS_API_KEY || '';

interface CreatePaymentParams {
  amount: number;
  currency: string;
  orderId: string;
  callbackUrl: string;
  successUrl?: string;
  failUrl?: string;
}

interface CryptomusPayment {
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount: string;
  payer_amount: string;
  payer_currency: string;
  currency: string;
  address: string;
  network: string;
  url: string;
  expired_at: number;
  status: string;
}

function generateSign(data: Record<string, any>): string {
  const jsonData = JSON.stringify(data);
  const base64Data = Buffer.from(jsonData).toString('base64');
  return crypto
    .createHash('md5')
    .update(base64Data + API_KEY)
    .digest('hex');
}

export async function createPayment(params: CreatePaymentParams): Promise<CryptomusPayment> {
  const data = {
    amount: params.amount.toString(),
    currency: params.currency,
    order_id: params.orderId,
    url_callback: params.callbackUrl,
    url_success: params.successUrl,
    url_return: params.failUrl,
    is_payment_multiple: false,
    lifetime: 3600, // 1 hour
  };

  const sign = generateSign(data);

  const response = await fetch(`${CRYPTOMUS_API}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      merchant: MERCHANT_ID,
      sign,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || result.state !== 0) {
    throw new Error(result.message || 'Failed to create payment');
  }

  return result.result;
}

export function verifyWebhook(body: Record<string, any>, receivedSign: string): boolean {
  const expectedSign = generateSign(body);
  return expectedSign === receivedSign;
}

export function getPaymentStatus(status: string): 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' {
  switch (status) {
    case 'paid':
    case 'paid_over':
      return 'COMPLETED';
    case 'wrong_amount':
    case 'fail':
    case 'wrong_amount_waiting':
      return 'FAILED';
    case 'cancel':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}
