import React from 'react';
import { Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Editor: React.FC = () => {
  const { text, setText, setIsPlaying, saveToHistory } = useAppContext();

  return (
    <div className="editor-container glass" style={{ margin: 'auto', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Add Your Story</h2>
      <textarea
        className="editor-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your story/script here to get started..."
        style={{ flex: 1, padding: '1rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', fontSize: '1.1rem' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => {
            saveToHistory(text);
            window.history.pushState({ isTeleprompter: true }, '');
            setIsPlaying(true);
          }}
          disabled={!text.trim()}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '1rem 2rem', borderRadius: '8px', 
            background: text.trim() ? 'var(--accent)' : 'var(--bg-secondary)',
            color: text.trim() ? 'white' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '1.1rem',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          <Play size={20} fill={text.trim() ? "white" : "none"} />
          Start Teleprompter
        </button>
      </div>
    </div>
  );
};
