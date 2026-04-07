import { useState, useCallback, useRef } from 'react';
import {
  Room,
  RoomEvent,
  RemoteTrack,
  Track,
  ConnectionState,
  TranscriptionSegment,
  Participant,
} from 'livekit-client';
import { TranscriptEntry } from '../types';

const TOKEN_BASE = import.meta.env.VITE_TOKEN_SERVER_URL
  ? `${import.meta.env.VITE_TOKEN_SERVER_URL}/token`
  : '/token';

export type CallStatus = 'Idle' | 'Connecting' | 'Listening' | 'Speaking';

export function useSofia() {
  const roomRef = useRef<Room | null>(null);
  const [status, setStatus] = useState<CallStatus>('Idle');
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const addEntry = useCallback((speaker: TranscriptEntry['speaker'], text: string) => {
    setTranscript(prev => [...prev, { speaker, text, timestamp: new Date() }]);
  }, []);

  const toggleMic = useCallback(async () => {
    if (!roomRef.current) return;
    const newMuted = !isMuted;
    await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  const startCall = useCallback(async () => {
    if (roomRef.current) return; // prevent double-invoke
    setStatus('Connecting');
    setIsCalling(true);

    try {
      const identity = `guest-${Math.random().toString(36).slice(2, 7)}`;
      const res = await fetch(`${TOKEN_BASE}?identity=${encodeURIComponent(identity)}`);
      if (!res.ok) throw new Error('Failed to get token');
      const { token, url } = await res.json();

      const room = new Room({
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          const audioEl = track.attach();
          audioEl.volume = 1.0;
          document.body.appendChild(audioEl);
          setStatus('Speaking');
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach().forEach((el: HTMLMediaElement) => el.remove());
        setStatus('Listening');
      });

      room.on(
        RoomEvent.TranscriptionReceived,
        (segments: TranscriptionSegment[], participant?: Participant) => {
          const isAgent = !participant || participant.identity.startsWith('agent');
          const speaker: TranscriptEntry['speaker'] = isAgent ? 'Parveen' : 'You';

          segments.forEach(seg => {
            const text = seg.text.trim();
            if (!text) return;

            if (seg.final) {
              // Final segment — upsert by segment id then mark done
              setTranscript(prev => {
                const idx = prev.findIndex(e => e.id === seg.id);
                if (idx !== -1) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], text, final: true };
                  return updated;
                }
                return [...prev, { id: seg.id, speaker, text, final: true, timestamp: new Date() }];
              });
            } else {
              // Interim segment — upsert in place so it doesn't duplicate
              setTranscript(prev => {
                const idx = prev.findIndex(e => e.id === seg.id);
                if (idx !== -1) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], text };
                  return updated;
                }
                return [...prev, { id: seg.id, speaker, text, final: false, timestamp: new Date() }];
              });
            }
          });
        }
      );

      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Connected) {
          setStatus('Listening');
          addEntry('System', 'Connected to Parveen. She will greet you shortly...');
        }
        if (state === ConnectionState.Disconnected) {
          setStatus('Idle');
          setIsCalling(false);
        }
      });

      await room.connect(url, token, { autoSubscribe: true });
      await room.localParticipant.setMicrophoneEnabled(true);

    } catch (err) {
      console.error(err);
      addEntry('System', 'Failed to connect. Please try again.');
      setStatus('Idle');
      setIsCalling(false);
    }
  }, [addEntry]);

  const endCall = useCallback(async () => {
    roomRef.current?.remoteParticipants.forEach(participant => {
      participant.audioTrackPublications.forEach(pub => {
        pub.track?.detach().forEach((el: HTMLMediaElement) => el.remove());
      });
    });
    await roomRef.current?.disconnect();
    roomRef.current = null;
    setIsCalling(false);
    setIsMuted(false);
    setStatus('Idle');
    addEntry('System', 'Session ended.');
  }, [addEntry]);

  return { status, isCalling, isMuted, transcript, startCall, endCall, toggleMic };
}
