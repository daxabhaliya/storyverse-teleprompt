import { useState, useRef, useEffect } from 'react';

export const useAudioRecorder = (onError?: (err: string) => void) => {
  const [recordingState, setRecordingState] = useState<'inactive' | 'recording' | 'paused'>('inactive');
  const [recordingTime, setRecordingTime] = useState(0);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState('');
  const [audioExtension, setAudioExtension] = useState('webm');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isRecordingIntentRef = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (recordingState === 'inactive') {
      setRecordingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [recordingState]);

  const startRecording = () => {
    console.log("🎤 startRecording called. Setting state to 'recording'...");
    setRecordingState('recording');
    isRecordingIntentRef.current = true;
    
    // Wait 1 full second for Android OS to release any previous hardware lock!
    setTimeout(() => {
      console.log("🎤 Requesting microphone access (getUserMedia)...");
      
      const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
      const timeoutPromise = new Promise<MediaStream>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout waiting for microphone access. Ensure permissions are granted and no other app is using the mic.")), 8000)
      );

      Promise.race([streamPromise, timeoutPromise])
        .then(stream => {
          console.log("🎤 Microphone access granted! Stream:", stream.id);
          
          if (!isRecordingIntentRef.current) {
            console.log("🎤 User clicked Stop before microphone was acquired! Discarding stream.");
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          const mediaRecorder = new MediaRecorder(stream);
          console.log("🎤 MediaRecorder created. MimeType:", mediaRecorder.mimeType);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (e) => {
            console.log("🎤 ondataavailable fired! Size:", e.data.size);
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            console.log("🎤 mediaRecorder.onstop fired! Total chunks:", audioChunksRef.current.length);
            if (audioChunksRef.current.length === 0) {
              console.error("🎤 No audio data recorded. Chunks array is empty.");
              if (onError) onError("No audio data was recorded. Your microphone might be muted or blocked by the emulator.");
              stream.getTracks().forEach(track => track.stop());
              return;
            }

            // Fallback to mp4/webm depending on what the browser generated
            const mimeType = mediaRecorder.mimeType || 'audio/webm';
            const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
            console.log("🎤 Saving with extension:", extension, "MimeType:", mimeType);
            setAudioExtension(extension);
            
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log("🎤 Audio URL created successfully:", audioUrl);
            setPendingAudioUrl(audioUrl);
            
            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          console.log("🎤 mediaRecorder.start() called successfully.");
        })
        .catch(err => {
          console.error("🎤 Error accessing microphone:", err);
          if (onError) onError(`Microphone error: ${err.message || 'Unknown error'}`);
          setRecordingState('inactive');
        });
    }, 1000); 
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    setRecordingState('paused');
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    setRecordingState('recording');
  };

  const stopRecording = () => {
    console.log("🎤 stopRecording called.");
    isRecordingIntentRef.current = false;
    
    console.log("🎤 mediaRecorderRef exists:", !!mediaRecorderRef.current);
    if (mediaRecorderRef.current) {
      console.log("🎤 mediaRecorder state:", mediaRecorderRef.current.state);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log("🎤 Calling mediaRecorder.stop()...");
      mediaRecorderRef.current.stop();
    } else {
      console.log("🎤 Skipping stop() because mediaRecorder is null or inactive.");
    }
    setRecordingState('inactive');
  };

  const saveRecording = () => {
    if (pendingAudioUrl) {
      const link = document.createElement('a');
      link.href = pendingAudioUrl;
      link.download = `${audioTitle.trim() || 'storyverse-recording'}.${audioExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setPendingAudioUrl(null);
      setAudioTitle('');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    recordingState,
    recordingTime,
    pendingAudioUrl,
    audioTitle,
    setAudioTitle,
    setPendingAudioUrl,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    saveRecording,
    formatTime
  };
};
