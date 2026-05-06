import { useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { api } from '../api/client';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

export function useVoice() {
  const clientRef       = useRef(null);
  const localTrackRef   = useRef(null);

  const [connected, setConnected] = useState(false);
  const [muted,     setMuted]     = useState(false);
  
  const [volumes, setVolumes] = useState({});

  const start = useCallback(async (roomId) => {

    if (clientRef.current) return;

    AgoraRTC.setParameter('AUDIO_SESSION_ENABLE_OPUS_DTX', true);

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
    clientRef.current = client;


    AgoraRTC.onAutoplayFailed = () => {
      const btn = document.createElement('button');
      btn.innerText = '🔊 소리를 켜려면 탭하세요';
      Object.assign(btn.style, {
        position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, padding: '12px 24px', borderRadius: '24px',
        background: '#e94560', color: '#fff', border: 'none', fontSize: '15px',
        cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      });
      btn.onclick = () => {
        client.remoteUsers.forEach((u) => u.audioTrack?.play());
        btn.remove();
      };
      document.body.appendChild(btn);
    };

    // 1. 다른 사용자 음성 자동 구독
    client.on('user-published', async (remoteUser, mediaType) => {
      console.log('[Agora] user-published:', remoteUser.uid, mediaType);
      await client.subscribe(remoteUser, mediaType);
      if (mediaType === 'audio') {
        console.log('[Agora] playing remote audio from:', remoteUser.uid);
        remoteUser.audioTrack.play();
      }
    });
    client.enableAudioVolumeIndicator();
    client.on('volume-indicator', (volumesData) => {
      const newVolumes = {};
      volumesData.forEach((vol) => {
        newVolumes[String(vol.uid)] = vol.level; 
      });
      setVolumes(newVolumes);
    });

    try {
      console.log('[Agora] fetching token for roomId:', roomId);
      
      let token = null;
      let uid = null;
      
      try {
        const response = await api.get(`/api/agora/token?roomId=${roomId}`);
        token = response?.data?.token || response?.token || null;
        uid = response?.data?.uid || response?.uid || null;
      } catch (apiErr) {
        console.warn('[Agora] 토큰 API 호출 실패 (테스트 모드로 null 접속 시도):', apiErr.message);
      }
      
      console.log('[Agora] joining channel:', String(roomId), 'uid:', uid, 'token:', token ? '존재함' : 'null');

      await client.join(APP_ID, String(roomId), token, uid);
      console.log('[Agora] joined successfully');

      const localTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: {
          sampleRate: 48000, 
          stereo: false,     
          bitrate: 64,       
        },
        AEC: true, 
        ANS: true, 
        AGC: true, 
      });
      
      localTrackRef.current = localTrack;
      await client.publish(localTrack);
      console.log('[Agora] published local track');

      setConnected(true);
      setMuted(false);
    } catch (err) {
      console.error('[Agora] start failed - name:', err.name, '/ message:', err.message, '/ code:', err.code);
      clientRef.current = null;
      throw err;
    }
  }, []);

  const toggleMute = useCallback(async () => {
    const track = localTrackRef.current;
    if (!track) return;
    
    try {
      const newMutedState = !muted;
      await track.setMuted(newMutedState); 
      setMuted(newMutedState);
      console.log(`[Agora] Microphone is now ${newMutedState ? 'Muted 🔇' : 'Unmuted 🎤'}`);
    } catch (err) {
      console.error('[Agora] toggleMute failed:', err);
    }
  }, [muted]);

  const stop = useCallback(async () => {
    localTrackRef.current?.close();
    localTrackRef.current = null;
    await clientRef.current?.leave();
    clientRef.current = null;
    setConnected(false);
    setMuted(false);
    setVolumes({}); // 나갈 때 볼륨 초기화
  }, []);

  return { start, stop, toggleMute, connected, muted, volumes };
}