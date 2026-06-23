import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  text: string;
  setText: (text: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  scrollSpeed: number;
  setScrollSpeed: (speed: number) => void;
  mirrorMode: boolean;
  setMirrorMode: (mirror: boolean) => void;
  theme: string;
  setTheme: (theme: string) => void;
  voiceTracking: boolean;
  setVoiceTracking: (track: boolean) => void;
  voiceCommands: boolean;
  setVoiceCommands: (commands: boolean) => void;
  coloredText: boolean;
  setColoredText: (colored: boolean) => void;
  saveSettings: () => void;
  resetSettings: () => void;
  history: string[];
  saveToHistory: (text: string) => void;
  removeFromHistory: (index: number) => void;
  appMode: 'landing' | 'editor' | 'recorder';
  setAppMode: (mode: 'landing' | 'editor' | 'recorder') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultSettings = {
    fontSize: 64,
    scrollSpeed: 1,
    mirrorMode: false,
    theme: 'dark',
    voiceTracking: false,
    voiceCommands: true,
    coloredText: false
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('teleprompterSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  };

  const initialSettings = loadSettings();

  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(initialSettings.fontSize);
  const [scrollSpeed, setScrollSpeed] = useState(initialSettings.scrollSpeed);
  const [mirrorMode, setMirrorMode] = useState(initialSettings.mirrorMode);
  const [theme, setTheme] = useState(initialSettings.theme);
  const [voiceTracking, setVoiceTracking] = useState(initialSettings.voiceTracking);
  const [voiceCommands, setVoiceCommands] = useState(initialSettings.voiceCommands);
  const [coloredText, setColoredText] = useState(initialSettings.coloredText);
  const [history, setHistory] = useState<string[]>([]);
  const [appMode, setAppMode] = useState<'landing' | 'editor' | 'recorder'>('landing');

  useEffect(() => {
    const savedHistory = localStorage.getItem('teleprompterHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const saveSettings = () => {
    const settings = {
      fontSize,
      scrollSpeed,
      mirrorMode,
      theme,
      voiceTracking,
      voiceCommands,
      coloredText
    };
    localStorage.setItem('teleprompterSettings', JSON.stringify(settings));
  };

  const saveToHistory = (newText: string) => {
    if (!newText.trim()) return;
    setHistory(prev => {
      const filtered = prev.filter(t => t !== newText);
      const updated = [newText, ...filtered].slice(0, 10);
      localStorage.setItem('teleprompterHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromHistory = (index: number) => {
    setHistory(prev => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem('teleprompterHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    setFontSize(defaultSettings.fontSize);
    setScrollSpeed(defaultSettings.scrollSpeed);
    setMirrorMode(defaultSettings.mirrorMode);
    setTheme(defaultSettings.theme);
    setVoiceTracking(defaultSettings.voiceTracking);
    setVoiceCommands(defaultSettings.voiceCommands);
    setColoredText(defaultSettings.coloredText);
  };

  return (
    <AppContext.Provider
      value={{
        text, setText,
        isPlaying, setIsPlaying,
        fontSize, setFontSize,
        scrollSpeed, setScrollSpeed,
        mirrorMode, setMirrorMode,
        theme, setTheme,
        voiceTracking, setVoiceTracking,
        voiceCommands, setVoiceCommands,
        coloredText, setColoredText,
        saveSettings, resetSettings,
        history, saveToHistory, removeFromHistory,
        appMode, setAppMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
