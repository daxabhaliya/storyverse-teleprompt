import React from 'react';
import { X, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose }) => {
  const { history, setText, setIsPlaying, removeFromHistory } = useAppContext();

  return (
    <div className={`history-panel glass ${isOpen ? 'open' : ''}`}>
      <div className="settings-header">
        <h2>Recent Stories</h2>
        <button className="icon-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', flex: 1, overflowY: 'auto' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
            No recent stories yet.
          </div>
        ) : (
          history.map((story, index) => (
            <div 
              key={index}
              className="glass"
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '1rem', borderRadius: '8px', cursor: 'pointer',
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                transition: 'all 0.2s'
              }}
              onClick={() => {
                setText(story);
                window.history.pushState({ isTeleprompter: true }, '');
                setIsPlaying(true);
                onClose();
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-alpha)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              <div style={{ flex: 1, overflow: 'hidden', color: 'var(--text-primary)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {story.substring(0, 30)}...
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {story.substring(30, 80)}...
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                  <Play size={16} fill="currentColor" />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(index);
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem' }}
                  title="Delete"
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
