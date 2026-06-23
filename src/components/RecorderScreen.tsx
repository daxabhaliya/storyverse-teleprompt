import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { Mic, Square, Play, Pause } from 'lucide-react';

export const RecorderScreen: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const {
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
  } = useAudioRecorder(setError);

  // Auto-hide error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      gap: '2rem',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Removed absolute X button */}

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #ef4444, #f87171)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Audio Recorder
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Record random sounds, voice notes, or ideas.
        </p>
      </div>

      <div style={{
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: recordingState !== 'inactive' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        border: `2px solid ${recordingState !== 'inactive' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
        animation: recordingState === 'recording' ? 'pulse 2s infinite' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <Mic size={80} color={recordingState !== 'inactive' ? '#ef4444' : 'var(--text-secondary)'} />
      </div>

      <div style={{ fontSize: '3rem', fontFamily: 'monospace', fontWeight: 'bold', color: recordingState !== 'inactive' ? '#ef4444' : 'var(--text-primary)', marginBottom: '2rem' }}>
        {formatTime(recordingTime)}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {recordingState === 'inactive' ? (
          <button
            onClick={(e) => { e.preventDefault(); startRecording(); }}
            style={{
              padding: '1rem 2rem',
              borderRadius: '30px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
            }}
          >
            <Mic size={24} /> Start Recording
          </button>
        ) : (
          <>
            <button
              onClick={(e) => { e.preventDefault(); recordingState === 'recording' ? pauseRecording() : resumeRecording(); }}
              style={{
                padding: '1rem 2rem',
                borderRadius: '30px',
                border: '2px solid #eab308',
                background: 'transparent',
                color: '#eab308',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {recordingState === 'recording' ? <Pause size={24} /> : <Play size={24} />}
              {recordingState === 'recording' ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={(e) => { e.preventDefault(); stopRecording(); }}
              style={{
                padding: '1rem 2rem',
                borderRadius: '30px',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              <Square size={24} fill="currentColor" /> Stop
            </button>
          </>
        )}
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          marginTop: '1rem',
          fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}

      {pendingAudioUrl && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="glass" style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Save Recording</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Give your recording a name before downloading it.
            </p>
            
            <input 
              type="text"
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              placeholder="Recording title (optional)"
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                marginTop: '0.5rem'
              }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                onClick={() => { setPendingAudioUrl(null); setAudioTitle(''); }}
                style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
              >
                Discard
              </button>
              <button 
                onClick={saveRecording}
                style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
