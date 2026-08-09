import { db } from "./firebase";
import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { purgeLocalMessages } from "./chat";

const registryChannel = new BroadcastChannel("connect_room_registry");

export async function destroyRoomSession(roomCode) {
  if (!roomCode) return;

  // Purge local in-memory messages & broadcast destroy event
  purgeLocalMessages(roomCode);
  registryChannel.postMessage({ type: "DESTROY_ROOM", roomCode });

  // Try Firestore batch deletion
  try {
    const messagesRef = collection(db, "rooms", roomCode, "messages");
    const snapshot = await getDocs(messagesRef);

    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }

    const roomRef = doc(db, "rooms", roomCode);
    await updateDoc(roomRef, { status: "ended" });
    await deleteDoc(roomRef);
  } catch (err) {
    // Firestore cleanup bypassed
  }
}

let activeRoomCodeForUnload = null;

export function registerUnloadCleanup(roomCode) {
  activeRoomCodeForUnload = roomCode;
}

export function unregisterUnloadCleanup() {
  activeRoomCodeForUnload = null;
}

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
