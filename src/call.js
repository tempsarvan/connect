// WebRTC & MediaStream Peer-to-Peer Calling Module (Mobile & Desktop Optimized)

let localStream = null;
let peerConnection = null;
let callChannel = null;
let currentFacingMode = "user"; // 'user' (front) or 'environment' (back)

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" }
  ]
};

export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

export class CallManager {
  constructor() {
    this.activeCall = false;
    this.isVideo = false;
    this.isMuted = false;
    this.isCameraOff = false;
    this.onCallStateChange = null;
    this.onRemoteStream = null;
    this.onIncomingCall = null;
    this.currentRoomCode = null;
    this.currentUid = null;
  }

  init(roomCode, uid) {
    this.currentRoomCode = roomCode;
    this.currentUid = uid;

    if (callChannel) callChannel.close();
    callChannel = new BroadcastChannel(`connect_call_${roomCode}`);

    callChannel.onmessage = async (event) => {
      const { type, senderUid, isVideo, offer, answer, candidate } = event.data || {};
      if (senderUid === uid) return;

      if (type === "CALL_OFFER") {
        if (this.onIncomingCall) {
          this.onIncomingCall({ senderUid, isVideo, offer });
        }
      } else if (type === "CALL_ANSWER") {
        if (peerConnection && answer) {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            if (this.onCallStateChange) {
              this.onCallStateChange({ status: "connected", localStream });
            }
          } catch (e) {
            console.warn("Set remote answer error:", e);
          }
        }
      } else if (type === "ICE_CANDIDATE") {
        if (peerConnection && candidate) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {}
        }
      } else if (type === "CALL_DECLINED") {
        this.stopCall("Call declined by peer");
      } else if (type === "CALL_ENDED") {
        this.stopCall("Call ended");
      }
    };
  }

  async getMediaStream(isVideo = true, facing = "user") {
    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    };

    const videoConstraints = isVideo ? {
      facingMode: facing,
      width: { ideal: isMobileDevice() ? 640 : 1280 },
      height: { ideal: isMobileDevice() ? 480 : 720 },
      frameRate: { max: 30 }
    } : false;

    // Mobile immediate stream request
    return await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
      video: videoConstraints
    });
  }

  async startCall(roomCode, uid, isVideo = true) {
    this.isVideo = isVideo;
    this.activeCall = true;

    if (this.onCallStateChange) {
      this.onCallStateChange({ status: "requesting_permissions" });
    }

    try {
      localStream = await this.getMediaStream(isVideo, currentFacingMode);
      this.createPeerConnection(roomCode, uid);

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (callChannel) {
        callChannel.postMessage({
          type: "CALL_OFFER",
          senderUid: uid,
          isVideo,
          offer
        });
      }

      if (this.onCallStateChange) {
        this.onCallStateChange({ status: "calling", localStream });
      }

      return localStream;
    } catch (err) {
      this.stopCall(err.message || "Camera/microphone permission denied");
      throw err;
    }
  }

  async acceptCall(roomCode, uid, isVideo, offer) {
    this.isVideo = isVideo;
    this.activeCall = true;

    if (this.onCallStateChange) {
      this.onCallStateChange({ status: "requesting_permissions" });
    }

    try {
      localStream = await this.getMediaStream(isVideo, currentFacingMode);
      this.createPeerConnection(roomCode, uid);

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      if (offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        if (callChannel) {
          callChannel.postMessage({
            type: "CALL_ANSWER",
            senderUid: uid,
            answer
          });
        }
      }

      if (this.onCallStateChange) {
        this.onCallStateChange({ status: "connected", localStream });
      }

      return localStream;
    } catch (err) {
      this.stopCall("Call failed: " + err.message);
      throw err;
    }
  }

  declineCall(roomCode, uid) {
    if (callChannel) {
      callChannel.postMessage({ type: "CALL_DECLINED", senderUid: uid });
    }
    this.stopCall();
  }

  createPeerConnection(roomCode, uid) {
    if (peerConnection) peerConnection.close();
    peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && callChannel) {
        callChannel.postMessage({
          type: "ICE_CANDIDATE",
          senderUid: uid,
          candidate: event.candidate
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        if (this.onRemoteStream) {
          this.onRemoteStream(event.streams[0]);
        }
      }
    };
  }

  toggleMic() {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isMuted = !audioTrack.enabled;
        return this.isMuted;
      }
    }
    return false;
  }

  toggleCamera() {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isCameraOff = !videoTrack.enabled;
        return this.isCameraOff;
      }
    }
    return false;
  }

  async flipCamera() {
    if (!this.isVideo || !localStream) return;
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    
    try {
      const newStream = await this.getMediaStream(true, currentFacingMode);
      const newVideoTrack = newStream.getVideoTracks()[0];
      
      const oldVideoTrack = localStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        localStream.removeTrack(oldVideoTrack);
      }
      
      localStream.addTrack(newVideoTrack);
      
      if (peerConnection) {
        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        }
      }

      if (this.onCallStateChange) {
        this.onCallStateChange({ status: "connected", localStream });
      }
    } catch (e) {
      console.warn("Camera flip error:", e);
    }
  }

  stopCall(reason = null) {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      localStream = null;
    }

    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }

    if (this.activeCall && callChannel) {
      callChannel.postMessage({ type: "CALL_ENDED" });
    }

    this.activeCall = false;
    this.isMuted = false;
    this.isCameraOff = false;

    if (this.onCallStateChange) {
      this.onCallStateChange({ status: "ended", reason });
    }
  }
}

export const callManager = new CallManager();
