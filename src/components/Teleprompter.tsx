import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, X, RotateCcw, Mic, Square, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

export const Teleprompter: React.FC = () => {
  const { 
    text, 
    isPlaying, 
    setIsPlaying, 
    fontSize, 
    scrollSpeed, 
    mirrorMode, 
    voiceTracking,
    voiceCommands,
    coloredText,
    theme
  } = useAppContext();

  const offsetRef = useRef(0);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const [error, setError] = useState<string | null>(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const isPausedRef = useRef(false);
  const lastTouchY = useRef<number | null>(null);

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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent page scroll
        setIsAutoScrollPaused(prev => {
          const newVal = !prev;
          isPausedRef.current = newVal;
          return newVal;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setIsPlaying(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [voiceCommands, voiceTracking, isPlaying, recordingState]);

  // Auto-scroll logic
  useEffect(() => {
    const isVoiceTrackingActive = voiceTracking && recordingState === 'inactive';
    if (!isPlaying || isVoiceTrackingActive || isAutoScrollPaused) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    let lastTime = performance.now();
    const scrollStep = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      if (textWrapperRef.current) {
        // Base font size is 64. Scroll speed scales with font size so words-per-minute remains constant.
        const fontMultiplier = fontSize / 64;
        const pixelsPerMs = (scrollSpeed / 100) * 1.6 * fontMultiplier;
        offsetRef.current += pixelsPerMs * deltaTime;
        textWrapperRef.current.style.transform = `translateY(-${offsetRef.current}px)`;
      }
      
      lastTime = currentTime;
      animationRef.current = requestAnimationFrame(scrollStep);
    };

    animationRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, scrollSpeed, voiceTracking, isAutoScrollPaused, fontSize, recordingState]);

  // Voice tracking / commands logic
  useEffect(() => {
    let isExplicitlyStopped = false;

    if ((voiceCommands || voiceTracking) && isPlaying && recordingState === 'inactive') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let newFinalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            newFinalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (newFinalTranscript) {
          finalTranscriptRef.current += newFinalTranscript + ' ';
        }

        const combinedTranscript = (newFinalTranscript + interimTranscript).toLowerCase();
        const totalSpoken = (finalTranscriptRef.current + interimTranscript).toLowerCase();

        // Voice commands (we only need to check the recent combinedTranscript for commands)
        if (voiceCommands) {
          const wordsArr = combinedTranscript.split(/[\s,.-]+/);
          const stopIdx = wordsArr.lastIndexOf("stop");
          const startIdx = wordsArr.lastIndexOf("start");

          if (stopIdx !== -1 || startIdx !== -1) {
            if (stopIdx > startIdx) {
              setIsAutoScrollPaused(true);
              isPausedRef.current = true;
            } else {
              setIsAutoScrollPaused(false);
              isPausedRef.current = false;
            }
          }
        }

        // Voice tracking scrolling (perfectly syncs spoken word to center line)
        const isVoiceTrackingActive = voiceTracking && recordingState === 'inactive';
        if (isVoiceTrackingActive && !isPausedRef.current) {
          const totalWords = totalSpoken.trim().split(/\s+/).filter(Boolean).length;
          const scriptWords = text.trim().split(/\s+/).filter(Boolean).length || 1;
          
          if (totalWords > 0 && textWrapperRef.current) {
            const textElement = textWrapperRef.current.firstElementChild as HTMLElement;
            if (textElement) {
              const fraction = Math.min(1, totalWords / scriptWords);
              const textHeight = textElement.offsetHeight;
              offsetRef.current = fraction * textHeight; 
              textWrapperRef.current.style.transform = `translateY(-${offsetRef.current}px)`;
            }
          }
        }
      };

      recognition.onstart = () => {
        // Silently start
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed') {
          setError("Microphone access was denied. Please allow microphone permissions in your browser.");
        }
      };

      recognition.onend = () => {
        if (isPlaying && (voiceTracking || voiceCommands) && !isExplicitlyStopped) {
          try {
            recognition.start();
          } catch (e) {
            // Silently fail, it will be cleaned up
          }
        }
      };

      try {
        recognition.start();
      } catch (e) {
        console.error("🎤 Error starting Speech Recognition:", e);
      }
    }

    return () => {
      isExplicitlyStopped = true;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try {
          // Use abort() instead of stop() to instantly kill the engine and release the hardware lock!
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [isPlaying, voiceTracking, voiceCommands, fontSize, recordingState]);

  const renderText = () => {
    if (!coloredText) return text;

    // Split text into sentences based on punctuation (including Hindi Danda).
    const sentences = text.split(/(?<=[.!?।॥])\s+/);
    
    // If background is dark, use light pastel colors. If background is light, use dark vivid colors.
    const lightPalette = ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e8baff'];
    const darkPalette = ['#e6194b', '#3cb44b', '#d35400', '#4363d8', '#f58231', '#911eb4'];
    
    const palette = theme === 'dark' ? lightPalette : darkPalette;
    
    return sentences.map((sentence, index) => (
      <span key={index} style={{ color: palette[index % palette.length] }}>
        {sentence}{index < sentences.length - 1 ? ' ' : ''}
      </span>
    ));
  };

  const handleWheel = (e: React.WheelEvent) => {
    offsetRef.current += e.deltaY;
    if (offsetRef.current < 0) offsetRef.current = 0;
    if (textWrapperRef.current) {
      textWrapperRef.current.style.transform = `translateY(-${offsetRef.current}px)`;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    lastTouchY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (lastTouchY.current !== null) {
      const deltaY = lastTouchY.current - e.touches[0].clientY;
      offsetRef.current += deltaY;
      if (offsetRef.current < 0) offsetRef.current = 0;
      if (textWrapperRef.current) {
        textWrapperRef.current.style.transform = `translateY(-${offsetRef.current}px)`;
      }
      lastTouchY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    lastTouchY.current = null;
  };

  if (!isPlaying) return null;

  return (
    <div className="teleprompter-view">
      {error && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'var(--danger)', color: 'white', padding: '1rem', borderRadius: '8px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
            <X size={16} />
          </button>
        </div>
      )}
      <div className="reading-line"></div>

      {isAutoScrollPaused && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '50%',
          padding: '2rem',
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none'
        }}>
          <Pause size={100} color="white" />
        </div>
      )}

      <div 
        className="teleprompter-scroll-container" 
        style={{ overflow: 'hidden' }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="teleprompter-content-wrapper" 
          ref={textWrapperRef}
          style={{ willChange: 'transform' }}
        >
          <div 
            className={`teleprompter-text ${mirrorMode ? 'mirror' : ''}`}
            style={{ 
              fontSize: `${fontSize}px`,
              textAlign: 'center'
            }}
          >
            {renderText()}
          </div>
        </div>
      </div>

      <div className="teleprompter-overlay-controls glass" style={{ padding: '0.25rem', gap: '0.5rem', width: 'auto', flexWrap: 'nowrap' }}>
        
        {/* Voice Controls Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: recordingState !== 'inactive' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', padding: '0.25rem 0.5rem', borderRadius: '40px', border: recordingState !== 'inactive' ? '1px solid rgba(239, 68, 68, 0.3)' : 'none' }}>
          {recordingState !== 'inactive' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.25rem', color: '#ef4444', gap: '0.25rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', animation: recordingState === 'recording' ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontSize: '0.9rem', marginRight: '0.25rem' }}>{formatTime(recordingTime)}</span>
            </div>
          )}
          {recordingState === 'inactive' ? (
            <button 
              className="icon-btn"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); startRecording(); }}
              title="Start Voice Recording"
              style={{ width: '36px', height: '36px' }}
            >
              <Mic size={14} />
            </button>
          ) : (
            <>
              <button 
                className="icon-btn"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); recordingState === 'recording' ? pauseRecording() : resumeRecording(); }}
                title={recordingState === 'recording' ? "Pause Recording" : "Resume Recording"}
                style={{ color: '#eab308', borderColor: '#eab308', width: '36px', height: '36px' }}
              >
                {recordingState === 'recording' ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button 
                className="icon-btn"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); stopRecording(); }}
                title="Stop & Save Recording"
                style={{ color: '#ef4444', borderColor: '#ef4444', animation: recordingState === 'recording' ? 'pulse 2s infinite' : 'none', width: '36px', height: '36px' }}
              >
                <Square size={14} fill="currentColor" />
              </button>
            </>
          )}
        </div>

        {/* Scroll Controls Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.25rem', color: 'var(--text-secondary)' }}>
            <FileText size={14} />
          </div>
          <button 
            className="icon-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const newVal = !isAutoScrollPaused;
              setIsAutoScrollPaused(newVal);
              isPausedRef.current = newVal;
            }}
            title={isAutoScrollPaused ? "Play Scroll" : "Pause Scroll"}
            style={{ width: '36px', height: '36px' }}
          >
            {isAutoScrollPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button 
            className="icon-btn" 
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              offsetRef.current = 0;
              finalTranscriptRef.current = '';
              if (textWrapperRef.current) {
                textWrapperRef.current.style.transform = `translateY(0px)`;
              }
            }}
            title="Replay from start"
            style={{ width: '36px', height: '36px' }}
          >
            <RotateCcw size={14} />
          </button>
          <button 
            className="icon-btn" 
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              setIsPlaying(false);
              if (window.history.state?.isTeleprompter) {
                window.history.back();
              }
            }}
            title="Stop and Exit"
            style={{ width: '36px', height: '36px' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {pendingAudioUrl && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '300px' }}>
            <h3 style={{ margin: 0 }}>Save Recording</h3>
            <input 
              type="text" 
              placeholder="Recording Title..." 
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '1.1rem' }}
              autoFocus
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
