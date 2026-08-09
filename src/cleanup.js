import { db } from "./firebase";
import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { notifySessionEndedLocal } from "./chat";

export async function destroyRoomSession(roomCode) {
  if (!roomCode) return;

  try {
    // 1. Delete all message documents in batch
    const messagesRef = collection(db, "rooms", roomCode, "messages");
    const snapshot = await getDocs(messagesRef);

    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }

    // 2. Delete or mark room document as ended
    const roomRef = doc(db, "rooms", roomCode);
    try {
      await updateDoc(roomRef, { status: "ended" });
      await deleteDoc(roomRef);
    } catch (e) {
      // Document might already be deleted
    }

  } catch (err) {
    console.warn("Failed to destroy room session on Firestore:", err);
  }

  // 3. Notify local channel
  notifySessionEndedLocal(roomCode);
}

// Auto-cleanup on window unload / close tab
let activeRoomCodeForUnload = null;

export function registerUnloadCleanup(roomCode) {
  activeRoomCodeForUnload = roomCode;
}

export function unregisterUnloadCleanup() {
  activeRoomCodeForUnload = null;
}

// Handle window unload / close tab events cleanly
window.addEventListener("pagehide", () => {
  if (activeRoomCodeForUnload) {
    destroyRoomSession(activeRoomCodeForUnload);
  }
});

window.addEventListener("beforeunload", () => {
  if (activeRoomCodeForUnload) {
    destroyRoomSession(activeRoomCodeForUnload);
  }
});
