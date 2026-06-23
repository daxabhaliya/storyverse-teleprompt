import React from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
    fontSize, setFontSize,
    scrollSpeed, setScrollSpeed,
    mirrorMode, setMirrorMode,
    theme, setTheme,
    voiceTracking, setVoiceTracking,
    voiceCommands, setVoiceCommands,
    coloredText, setColoredText,
    saveSettings, resetSettings
  } = useAppContext();

  return (
    <div className={`settings-panel glass ${isOpen ? 'open' : ''}`}>
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="icon-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="settings-group">
        <label>
          Text Size
          <span>{fontSize}px</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={() => setFontSize(Math.max(24, fontSize - 2))}
            disabled={fontSize <= 24}
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--glass-border)', cursor: fontSize <= 24 ? 'not-allowed' : 'pointer' }}
          >
            -
          </button>
          <input 
            type="range" 
            min="24" 
            max="120" 
            value={fontSize} 
            onChange={(e) => setFontSize(Number(e.target.value))} 
            style={{ flex: 1 }}
          />
          <button 
            onClick={() => setFontSize(Math.min(120, fontSize + 2))}
            disabled={fontSize >= 120}
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--glass-border)', cursor: fontSize >= 120 ? 'not-allowed' : 'pointer' }}
          >
            +
          </button>
        </div>
      </div>

      <div className="settings-group">
        <label>
          Scroll Speed
          <span>{scrollSpeed}</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={() => setScrollSpeed(Math.max(1, scrollSpeed - 1))}
            disabled={voiceTracking || scrollSpeed <= 1}
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--glass-border)', cursor: (voiceTracking || scrollSpeed <= 1) ? 'not-allowed' : 'pointer' }}
          >
            -
          </button>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={scrollSpeed} 
            onChange={(e) => setScrollSpeed(Number(e.target.value))} 
            disabled={voiceTracking}
            style={{ flex: 1 }}
          />
          <button 
            onClick={() => setScrollSpeed(Math.min(100, scrollSpeed + 1))}
            disabled={voiceTracking || scrollSpeed >= 100}
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--glass-border)', cursor: (voiceTracking || scrollSpeed >= 100) ? 'not-allowed' : 'pointer' }}
          >
            +
          </button>
        </div>
      </div>

      <div className="settings-group">
        <label>Theme</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div className="toggle-container">
        <span className="toggle-label" style={{ display: 'flex', flexDirection: 'column' }}>
          Colored Text
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Colorize sentences</span>
        </span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={coloredText}
            onChange={(e) => setColoredText(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="toggle-container">
        <span className="toggle-label" style={{ display: 'flex', flexDirection: 'column' }}>
          Voice Commands
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Say "Start" or "Stop"</span>
        </span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={voiceCommands}
            onChange={(e) => setVoiceCommands(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="toggle-container">
        <span className="toggle-label">Mirror Mode</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={mirrorMode}
            onChange={(e) => setMirrorMode(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="toggle-container">
        <span className="toggle-label" style={{ display: 'flex', flexDirection: 'column' }}>
          Voice Tracking
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Auto-scroll with voice</span>
        </span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={voiceTracking}
            onChange={(e) => setVoiceTracking(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>


      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button 
          onClick={() => {
            saveSettings();
            onClose();
          }}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: 'white', fontWeight: 600 }}
        >
          Save
        </button>
        <button 
          onClick={resetSettings}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', fontWeight: 600 }}
        >
          Reset
        </button>
      </div>

    </div>
  );
};
