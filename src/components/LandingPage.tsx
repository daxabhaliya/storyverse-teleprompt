import React from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Mic } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setAppMode } = useAppContext();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      gap: '2rem',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          What would you like to do?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Choose an option to get started
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setAppMode('editor')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '3rem 2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '280px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = '#60a5fa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <div style={{ background: 'rgba(96, 165, 250, 0.2)', padding: '1.5rem', borderRadius: '50%', color: '#60a5fa' }}>
            <FileText size={48} />
          </div>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Start Teleprompter</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
            Write a script and read it while recording video or audio.
          </p>
        </button>

        <button
          onClick={() => setAppMode('recorder')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '3rem 2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '280px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: '50%', color: '#ef4444' }}>
            <Mic size={48} />
          </div>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Start Recording</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
            Just record some random sound or voice without a script.
          </p>
        </button>
      </div>
    </div>
  );
};
