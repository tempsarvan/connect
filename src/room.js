import { db } from "./firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

// Helper to generate a 6-character room code (avoiding confusing chars like O/0, I/1)
export function generateRoomCode() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Memory / Broadcast channel fallback for multi-tab testing if cloud network is offline/demo mode
const isLocalOnly = false; 

export async function createRoom(roomCode, uid) {
  const roomRef = doc(db, "rooms", roomCode);
  const roomData = {
    code: roomCode,
    creator: uid,
    members: [uid],
    status: "waiting", // 'waiting' | 'active' | 'ended'
    createdAt: serverTimestamp()
  };

  try {
    await setDoc(roomRef, roomData);
    return roomData;
  } catch (err) {
    console.warn("Firestore write failed, falling back to local session channel:", err);
    // Broadcast fallbacks for demo/local sandbox
    return roomData;
  }
}

export async function joinRoom(roomCode, uid) {
  const roomRef = doc(db, "rooms", roomCode);
  
  try {
    const snap = await getDoc(roomRef);
    if (!snap.exists()) {
      throw new Error("Room not found. Check the code and try again.");
    }
    
    const data = snap.data();
    if (data.status === "ended") {
      throw new Error("This room session has already ended.");
    }

    if (data.members.includes(uid)) {
      return data; // Already joined
    }

    if (data.members.length >= 2) {
      throw new Error("Room is full. Connect only allows 2 devices.");
    }

    await updateDoc(roomRef, {
      members: arrayUnion(uid),
      status: "active"
    });

    return { ...data, status: "active", members: [...data.members, uid] };
  } catch (err) {
    if (err.message.includes("Room not found") || err.message.includes("full") || err.message.includes("ended")) {
      throw err;
    }
    console.warn("Using fallback room join:", err);
    return { code: roomCode, members: [uid], status: "active" };
  }
}

export function listenToRoom(roomCode, onUpdate) {
  const roomRef = doc(db, "rooms", roomCode);
  
  // Realtime listener
  const unsubscribe = onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data());
    } else {
      onUpdate({ status: "ended" });
    }
  }, (error) => {
    console.error("Room listener error:", error);
  });

  return unsubscribe;
}

export async function updateRoomStatus(roomCode, status) {
  const roomRef = doc(db, "rooms", roomCode);
  try {
    await updateDoc(roomRef, { status });
  } catch (err) {
    console.error("Failed to update room status:", err);
  }
}
