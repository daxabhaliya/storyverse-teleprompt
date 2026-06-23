import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, X, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

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
  }, [setIsPlaying]);

  // Auto-scroll logic
  useEffect(() => {
    if (!isPlaying || voiceTracking || isAutoScrollPaused) {
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
  }, [isPlaying, scrollSpeed, voiceTracking, isAutoScrollPaused, fontSize]);

  // Voice tracking / commands logic
  useEffect(() => {
    if (!isPlaying || (!voiceTracking && !voiceCommands)) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

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
      if (voiceTracking && !isPausedRef.current) {
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
      console.log("🎤 Speech recognition STARTED. Listening for commands...");
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // This is perfectly normal, the browser throws this if there's silence for a few seconds.
        // It will automatically trigger onend and our code will restart it.
        return;
      }
      console.error("🎤 Speech recognition ERROR:", event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access was denied. Please allow microphone permissions in your browser.");
      }
    };

    recognition.onend = () => {
      console.log("🎤 Speech recognition ENDED. Attempting to restart...");
      // Restart if we are still playing and voice tracking/commands are enabled
      if (isPlaying && (voiceTracking || voiceCommands)) {
        try {
          recognition.start();
        } catch (e) {
          console.error("🎤 Failed to restart recognition:", e);
        }
      }
    };

    try {
      console.log("🎤 Attempting to start Speech Recognition...");
      recognition.start();
    } catch (e) {
      console.error("🎤 Error starting Speech Recognition:", e);
    }

    return () => {
      console.log("🎤 Cleaning up Speech Recognition...");
      // clear the onend handler so it doesn't restart when we intentionally stop it
      recognition.onend = null;
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [isPlaying, voiceTracking, voiceCommands, fontSize]);

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
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'var(--danger)', color: 'white', padding: '1rem', borderRadius: '8px', zIndex: 100 }}>
          {error}
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
          backdropFilter: 'blur(4px)'
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

      <div className="teleprompter-overlay-controls glass">
        <button 
          className="icon-btn" 
          onClick={() => {
            const newVal = !isAutoScrollPaused;
            setIsAutoScrollPaused(newVal);
            isPausedRef.current = newVal;
          }}
          title={isAutoScrollPaused ? "Play" : "Pause"}
        >
          {isAutoScrollPaused ? <Play size={20} /> : <Pause size={20} />}
        </button>
        <button 
          className="icon-btn" 
          onClick={() => {
            offsetRef.current = 0;
            finalTranscriptRef.current = '';
            if (textWrapperRef.current) {
              textWrapperRef.current.style.transform = `translateY(0px)`;
            }
          }}
          title="Replay from start"
        >
          <RotateCcw size={20} />
        </button>
        <button 
          className="icon-btn" 
          onClick={() => {
            setIsPlaying(false);
            if (window.history.state?.isTeleprompter) {
              window.history.back();
            }
          }}
          title="Stop and Exit"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
