import { useState, useCallback, useRef, useEffect } from 'react';
import {
  doc,
  collection,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  getDoc,
  serverTimestamp,
  Unsubscribe,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MoveData } from '@/types/game';
import { generateRoomId, isValidRoomId } from '@/lib/roomId';

export function useGameRoom() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isCaller, setIsCaller] = useState(false);
  const roomRef = useRef<ReturnType<typeof doc> | null>(null);
  const unsubscribeRefs = useRef<Unsubscribe[]>([]);

  const cleanup = useCallback(() => {
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];
    roomRef.current = null;
    setRoomId(null);
  }, []);

  const createRoom = useCallback(async (): Promise<string> => {
    try {
      let newRoomId: string;
      let attempts = 0;
      const maxAttempts = 10;

      // Generate a unique room ID (5-6 characters)
      // For MVP, we'll use a simpler approach - just generate
      // In production with many users, you'd want to check Firestore with an index
      newRoomId = generateRoomId(5);
      
      // Optional: Try to check uniqueness (may fail if index doesn't exist - that's OK)
      try {
        const roomsRef = collection(db, 'games');
        const q = query(roomsRef, where('roomId', '==', newRoomId));
        const querySnapshot = await getDocs(q);
        
        // If room exists (very unlikely), generate a 6-character ID
        if (!querySnapshot.empty) {
          newRoomId = generateRoomId(6);
        }
      } catch (error: any) {
        // Index might not exist - that's okay for MVP, just use the generated ID
        // Firebase will prompt you to create the index if needed
        if (error?.code !== 'failed-precondition') {
          console.warn('Could not check room uniqueness:', error);
        }
      }

      const newRoomRef = doc(collection(db, 'games'));
      
      // Create room document with custom roomId
      await setDoc(newRoomRef, {
        roomId: newRoomId,
        createdAt: serverTimestamp(),
      });
      
      roomRef.current = newRoomRef;
      setRoomId(newRoomId);
      setIsCaller(true);
      
      return newRoomId;
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error('Oda oluşturulamadı');
    }
  }, []);

  const joinRoom = useCallback(async (roomIdToJoin: string): Promise<void> => {
    try {
      // Validate room ID format
      const normalizedId = roomIdToJoin.trim().toUpperCase();
      if (!isValidRoomId(normalizedId)) {
        throw new Error('Geçersiz oda ID formatı. 5-6 karakter olmalı.');
      }

      // Search for room by roomId field
      const roomsRef = collection(db, 'games');
      const q = query(roomsRef, where('roomId', '==', normalizedId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Oda bulunamadı. Lütfen oda ID\'sini kontrol edin.');
      }

      // Get the first matching room document
      const roomDoc = querySnapshot.docs[0];
      roomRef.current = doc(db, 'games', roomDoc.id);
      setRoomId(normalizedId);
      setIsCaller(false);
    } catch (error: any) {
      console.error('Error joining room:', error);
      throw new Error(error.message || 'Odaya katılamadı');
    }
  }, []);

  const saveOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!roomRef.current) throw new Error('Room not initialized');
    
    try {
      await updateDoc(roomRef.current, {
        offer: { sdp: offer.sdp, type: offer.type },
      });
    } catch (error) {
      console.error('Error saving offer:', error);
      throw error;
    }
  }, []);

  const saveAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!roomRef.current) throw new Error('Room not initialized');
    
    try {
      await updateDoc(roomRef.current, {
        answer: { sdp: answer.sdp, type: answer.type },
      });
    } catch (error) {
      console.error('Error saving answer:', error);
      throw error;
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidate, isCaller: boolean) => {
    if (!roomRef.current) return;
    
    try {
      const candidateCollection = isCaller
        ? collection(roomRef.current, 'callerCandidates')
        : collection(roomRef.current, 'calleeCandidates');
      
      await addDoc(candidateCollection, candidate.toJSON());
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  const saveMove = useCallback(async (moveData: MoveData) => {
    if (!roomRef.current) return;
    
    try {
      await addDoc(collection(roomRef.current, 'moves'), {
        ...moveData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving move:', error);
    }
  }, []);

  const watchAnswer = useCallback((onAnswer: (answer: RTCSessionDescriptionInit) => void) => {
    if (!roomRef.current) return () => {};
    
    const unsubscribe = onSnapshot(roomRef.current, (snapshot) => {
      const data = snapshot.data();
      if (data?.answer) {
        onAnswer(data.answer as RTCSessionDescriptionInit);
      }
    });
    
    unsubscribeRefs.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  const watchOffer = useCallback((onOffer: (offer: RTCSessionDescriptionInit) => void) => {
    if (!roomRef.current) return () => {};
    
    const unsubscribe = onSnapshot(roomRef.current, (snapshot) => {
      const data = snapshot.data();
      if (data?.offer) {
        onOffer(data.offer as RTCSessionDescriptionInit);
      }
    });
    
    unsubscribeRefs.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  const watchIceCandidates = useCallback((
    isCaller: boolean,
    onCandidate: (candidate: RTCIceCandidateInit) => void
  ) => {
    if (!roomRef.current) return () => {};
    
    const candidateCollection = isCaller
      ? collection(roomRef.current, 'calleeCandidates')
      : collection(roomRef.current, 'callerCandidates');
    
    const unsubscribe = onSnapshot(candidateCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          onCandidate(change.doc.data() as RTCIceCandidateInit);
        }
      });
    });
    
    unsubscribeRefs.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  const watchMoves = useCallback((onMove: (move: MoveData) => void) => {
    if (!roomRef.current) return () => {};
    
    const unsubscribe = onSnapshot(collection(roomRef.current, 'moves'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          onMove({
            from: data.from,
            to: data.to,
            promotion: data.promotion,
            timestamp: data.timestamp?.toMillis?.() || Date.now(),
          });
        }
      });
    });
    
    unsubscribeRefs.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    roomId,
    isCaller,
    createRoom,
    joinRoom,
    saveOffer,
    saveAnswer,
    addIceCandidate,
    saveMove,
    watchAnswer,
    watchOffer,
    watchIceCandidates,
    watchMoves,
    cleanup,
  };
}

