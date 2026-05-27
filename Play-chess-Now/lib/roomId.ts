/**
 * Generates a short, readable room ID (5-6 characters)
 * Uses alphanumeric characters, excluding confusing ones (0, O, I, l)
 */
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed 0, O, I, l, 1

export function generateRoomId(length: number = 5): string {
  let result = '';
  const charsLength = CHARS.length;
  
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * charsLength));
  }
  
  return result;
}

export function isValidRoomId(id: string): boolean {
  // Check if room ID is 5-6 characters and contains only valid characters
  return /^[A-Z2-9]{5,6}$/.test(id.toUpperCase());
}

