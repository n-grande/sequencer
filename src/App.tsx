import styled from '@emotion/styled';
import DrumSequencer from './components/DrumSequencer';
import BasslineSequencer from './components/BasslineSequencer';
import { useState, useEffect } from 'react';
import * as Tone from 'tone';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #121212;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: white;
  margin-bottom: 20px;
`;

const PlayButton = styled.button`
  padding: 12px 32px;
  font-size: 20px;
  background: #ff9800;
  color: #222;
  border: 2px solid #444;
  border-radius: 8px;
  font-family: "Share Tech Mono", "Fira Mono", monospace;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 8px #0008;
  transition: background 0.2s, color 0.2s;
  margin-bottom: 20px;
  
  &:hover {
    background: #ff1744;
    color: #fff;
  }
`;

const ClearAllButton = styled.button`
  padding: 12px 32px;
  font-size: 20px;
  background: #ff1744;
  color: #fff;
  border: 2px solid #444;
  border-radius: 8px;
  font-family: "Share Tech Mono", "Fira Mono", monospace;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 8px #0008;
  transition: background 0.2s, color 0.2s;
  margin-bottom: 20px;
  
  &:hover {
    background: #ff9800;
    color: #222;
  }
`;

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Create a shared sequencer for timing
  useEffect(() => {
    if (!isPlaying) {
      setCurrentStep(0);
      return;
    }

    const sequencer = new Tone.Sequence(
      (time, step) => {
        setCurrentStep(step);
      },
      [...Array(16).keys()],
      '16n'
    );

    sequencer.start(0);

    return () => {
      sequencer.stop();
      sequencer.dispose();
    };
  }, [isPlaying]);

  const togglePlay = async () => {
    try {
      if (!isPlaying) {
        await Tone.start();
        await Tone.Transport.start();
        setIsPlaying(true);
      } else {
        await Tone.Transport.stop();
        setIsPlaying(false);
        setCurrentStep(0);
      }
    } catch (error) {
      console.error('Error toggling play state:', error);
      setIsPlaying(false);
      setCurrentStep(0);
    }
  };

  return (
    <AppContainer>
      <Title>Sequencer</Title>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <PlayButton onClick={togglePlay}>
          {isPlaying ? 'Stop' : 'Play'}
        </PlayButton>
        <ClearAllButton onClick={() => {
          // We'll implement this functionality later
          console.log('Clear all clicked');
        }}>
          Clear All
        </ClearAllButton>
      </div>
      <DrumSequencer />
      <BasslineSequencer 
        bpm={bpm} 
        isPlaying={isPlaying} 
        swing={swing}
        currentStep={currentStep}
      />
    </AppContainer>
  );
}

export default App;
