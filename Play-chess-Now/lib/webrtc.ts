const METERED_DOMAIN = process.env.NEXT_PUBLIC_METERED_DOMAIN || '';
const METERED_SECRET_KEY = process.env.NEXT_PUBLIC_METERED_SECRET_KEY || '';

// ExpressTurn.com configuration (free TURN server)
const EXPRESSTURN_USERNAME = process.env.NEXT_PUBLIC_EXPRESSTURN_USERNAME || '';
const EXPRESSTURN_PASSWORD = process.env.NEXT_PUBLIC_EXPRESSTURN_PASSWORD || '';
const EXPRESSTURN_SERVER = process.env.NEXT_PUBLIC_EXPRESSTURN_SERVER || 'free.expressturn.com';

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export async function getIceServers(): Promise<IceServer[]> {
  // Try ExpressTurn first (free, static credentials)
  if (EXPRESSTURN_USERNAME && EXPRESSTURN_PASSWORD) {
    console.log('Using ExpressTurn.com TURN server (free)...');
    const expressTurnServer: IceServer = {
      urls: [
        `turn:${EXPRESSTURN_SERVER}:3478`,
        `turns:${EXPRESSTURN_SERVER}:5349`, // TLS version
      ],
      username: EXPRESSTURN_USERNAME,
      credential: EXPRESSTURN_PASSWORD,
    };
    
    console.log('ExpressTurn credentials configured');
    return [
      { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
      expressTurnServer,
    ];
  }
  
  // Try Metered TURN (if ExpressTurn not configured)
  try {
    if (!METERED_DOMAIN || !METERED_SECRET_KEY) {
      console.warn('No TURN server configured, using STUN only');
      return [
        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
      ];
    }
    
    // Metered TURN API: Create credential using secretKey (POST method)
    // According to docs: https://www.metered.ca/docs/turn-rest-api/post-create-credential/
    console.log('Fetching TURN credentials from Metered...');
    const response = await fetch(
      `https://${METERED_DOMAIN}/api/v1/turn/credential?secretKey=${METERED_SECRET_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiryInSeconds: 3600, // 1 hour
          label: 'chess-game-turn',
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('TURN credential error:', response.status, errorText);
      throw new Error(`Failed to create TURN credential: ${response.status}`);
    }
    
    const credential = await response.json();
    console.log('TURN credentials received:', { username: credential.username, hasPassword: !!credential.password });
    
    // Format the credential for WebRTC ICE servers
    // Metered TURN servers typically use port 3478
    const turnServer: IceServer = {
      urls: [
        `turn:${METERED_DOMAIN}:3478`,
        `turns:${METERED_DOMAIN}:5349`, // TLS version
      ],
      username: credential.username,
      credential: credential.password,
    };
    
    console.log('ICE servers configured:', {
      stun: 'Google STUN',
      turn: `${METERED_DOMAIN}:3478`,
    });
    
    // Return STUN + TURN servers
    // Note: Order matters - STUN first, then TURN
    const iceServers: IceServer[] = [
      { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
      turnServer,
    ];
    
    console.log('ICE servers configured:', iceServers.map(s => ({
      urls: Array.isArray(s.urls) ? s.urls : [s.urls],
      hasCredentials: !!(s.username && s.credential)
    })));
    
    return iceServers;
  } catch (error) {
    console.warn('TURN server error, continuing with STUN only:', error);
    return [
      { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    ];
  }
}

export function createPeerConnection(iceServers: IceServer[]): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers,
    iceCandidatePoolSize: 10,
  });
}

