import React, { useState } from 'react'
import { Settings, History } from 'lucide-react'
import { AppProvider, useAppContext } from './context/AppContext'
import { Editor } from './components/Editor'
import { Teleprompter } from './components/Teleprompter'
import { SettingsPanel } from './components/SettingsPanel'
import { HistoryPanel } from './components/HistoryPanel'
import './App.css'

function MainApp() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const { isPlaying, setIsPlaying } = useAppContext()

  return (
    <div className="app-container">
      <header className="header glass">
        <h1>StoryVerse Teleprompter</h1>
        <div className="header-actions">
          <button 
            className={`icon-btn ${historyOpen ? 'active' : ''}`}
            onClick={() => {
              setHistoryOpen(!historyOpen);
              if (settingsOpen) setSettingsOpen(false);
            }}
            title="History"
          >
            <History size={20} />
          </button>
          <button 
            className={`icon-btn ${settingsOpen ? 'active' : ''}`}
            onClick={() => {
              setSettingsOpen(!settingsOpen);
              if (historyOpen) setHistoryOpen(false);
            }}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="main-content">
        <Editor />
        <HistoryPanel isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
        <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        {isPlaying && <Teleprompter />}
      </main>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  )
}

export default App
