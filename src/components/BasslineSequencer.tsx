import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import * as Tone from 'tone';

// Reuse the retro color palette from DrumSequencer
const retroPanel = '#232323';
const retroAccent = '#ff9800';
const retroAccent2 = '#ff1744';
const retroAccent3 = '#ffd600';
const retroText = '#ffe082';
const retroStepActive = '#ff9800';
const retroStepInactive = '#333';
const retroStepBorder = '#444';
const retroFont = '"Share Tech Mono", "Fira Mono", monospace';
const playheadColor = '#f8f8e7';

interface Step {
  note: number;
  velocity: number;
  slide: boolean;
  accent: boolean;
  octave: number;
}

interface BasslineSequencerProps {
  bpm: number;
  isPlaying: boolean;
  swing: number;
  currentStep: number;
}

// Update pitch grid constants
const PITCH_GRID = {
  NOTES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  OCTAVES: [1, 2, 3, 4], // We'll use octaves 1-4 for the bass range
};

const Panel = styled.div`
  background: linear-gradient(180deg, #232323 80%, #181818 100%);
  border: 3px solid ${retroAccent};
  border-radius: 12px;
  box-shadow: 0 4px 24px #000a;
  padding: 32px 32px 24px 32px;
  margin: 32px auto;
  max-width: 1100px;
`;

const SequencerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 4px;
  background: ${retroPanel};
  border-radius: 8px;
  border: 2px solid ${retroStepBorder};
  margin-top: 16px;
`;

const StepButton = styled.button<{ active: boolean; current: boolean }>`
  width: 38px;
  height: 38px;
  border: 2px solid ${retroStepBorder};
  border-radius: 6px;
  background: ${({ active }) => (active ? retroStepActive : retroStepInactive)};
  color: #222;
  font-family: ${retroFont};
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 2px 4px #0006;
  transition: box-shadow 0.2s, border 0.2s;
  outline: none;
  position: relative;
  z-index: 1;
  ${({ current }) =>
    current
      ? `
    box-shadow: 0 0 0 4px ${playheadColor}, 0 2px 4px #0006;
    border: 2.5px solid ${playheadColor};
  `
      : ''}
  &:hover {
    border: 2px solid ${retroAccent};
    background: ${retroAccent3};
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  align-items: center;
  justify-content: center;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${retroPanel};
  padding: 16px;
  border-radius: 8px;
  border: 2px solid ${retroStepBorder};
`;

const ControlLabel = styled.label`
  color: ${retroText};
  font-family: ${retroFont};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Slider = styled.input`
  width: 150px;
  -webkit-appearance: none;
  height: 4px;
  background: #222;
  border-radius: 2px;
  outline: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    background: ${retroAccent};
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid ${retroStepBorder};
    transition: background 0.2s;
    &:hover {
      background: ${retroAccent2};
    }
  }
`;

const SlideButton = styled.button<{ active: boolean, current: boolean }>`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ active }) => (active ? retroAccent : retroStepBorder)};
  border: none;
  cursor: pointer;
  &:hover {
    background: ${retroAccent2};
  }
`;

// Add new styled components for the pitch grid
const PitchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 4px;
  background: ${retroPanel};
  border-radius: 8px;
  border: 2px solid ${retroStepBorder};
  padding: 8px;
  margin-top: 16px;
`;

const PitchButton = styled.button<{ active: boolean; isCurrent: boolean }>`
  width: 38px;
  height: 38px;
  border: 2px solid ${retroStepBorder};
  border-radius: 6px;
  background: ${({ active }) => (active ? retroStepActive : retroStepInactive)};
  color: ${({ active }) => (active ? '#222' : retroText)};
  font-family: ${retroFont};
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 4px #0006;
  transition: box-shadow 0.2s, border 0.2s;
  outline: none;
  position: relative;
  z-index: 1;
  ${({ isCurrent }) =>
    isCurrent
      ? `
    box-shadow: 0 0 0 4px ${playheadColor}, 0 2px 4px #0006;
    border: 2.5px solid ${playheadColor};
  `
      : ''}
  &:hover {
    border: 2px solid ${retroAccent};
    background: ${retroAccent3};
  }
`;

const OctaveControl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
`;

const OctaveButton = styled.button<{ active: boolean }>`
  width: 24px;
  height: 24px;
  padding: 0;
  background: ${({ active }) => (active ? retroAccent : retroStepInactive)};
  color: ${({ active }) => (active ? '#222' : retroText)};
  border: 2px solid ${retroStepBorder};
  border-radius: 4px;
  font-family: ${retroFont};
  font-size: 12px;
  cursor: pointer;
  &:hover {
    background: ${retroAccent3};
    color: #222;
  }
`;

const NoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Add new styled component for the clear button
const ClearButton = styled.button`
  padding: 8px 16px;
  background: ${retroAccent2};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: ${retroFont};
  margin-left: 16px;
  &:hover {
    background: ${retroAccent};
  }
`;

const BasslineSequencer: React.FC<BasslineSequencerProps> = ({ 
  bpm, 
  isPlaying, 
  swing,
  currentStep 
}) => {
  // Initialize steps with all notes off (velocity: 0)
  const [steps, setSteps] = useState<Step[]>(Array(16).fill({ 
    note: 0, 
    velocity: 0, // Changed from 0.7 to 0
    slide: false, 
    accent: false,
    octave: 2
  }));
  const [filterCutoff, setFilterCutoff] = useState(1000);
  const [filterResonance, setFilterResonance] = useState(0);
  const [decay, setDecay] = useState(0.2);
  const [envelopeMod, setEnvelopeMod] = useState(0.5);
  const [selectedPitch, setSelectedPitch] = useState<number | null>(null);
  const [noteOctaves, setNoteOctaves] = useState<{ [key: number]: number }>({});

  const synthRef = useRef<Tone.MonoSynth | null>(null);
  const sequencerRef = useRef<Tone.Sequence | null>(null);

  // Initialize synth
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Create a simple synth
        synthRef.current = new Tone.MonoSynth({
          oscillator: {
            type: 'sawtooth'
          },
          envelope: {
            attack: 0.01,
            decay: decay,
            sustain: 0.1,
            release: 0.1
          },
          filter: {
            frequency: filterCutoff,
            type: 'lowpass',
            Q: filterResonance
          }
        }).toDestination();

        // Test the synth
        synthRef.current.triggerAttackRelease("C2", "8n");
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initializeAudio();

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  // Update filter parameters
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.filter.frequency.value = filterCutoff;
      synthRef.current.filter.Q.value = filterResonance;
    }
  }, [filterCutoff, filterResonance]);

  // Update decay parameter
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.envelope.decay = decay;
    }
  }, [decay]);

  // Update sequencer with swing
  useEffect(() => {
    if (!isPlaying) {
      if (sequencerRef.current) {
        sequencerRef.current.stop();
        sequencerRef.current.dispose();
        sequencerRef.current = null;
      }
      return;
    }

    const newSequencer = new Tone.Sequence(
      (time, step) => {
        const currentStep = steps[step];
        if (currentStep.velocity > 0 && synthRef.current) {
          const note = 36 + currentStep.note;
          const noteName = Tone.Frequency(note, "midi").toNote();
          
          if (currentStep.slide) {
            synthRef.current.portamento = 0.1;
          } else {
            synthRef.current.portamento = 0;
          }

          synthRef.current.triggerAttackRelease(
            noteName,
            "16n",
            time,
            currentStep.velocity
          );
        }
      },
      [...Array(16).keys()],
      '16n'
    );

    newSequencer.start(0);
    sequencerRef.current = newSequencer;

    return () => {
      if (newSequencer) {
        newSequencer.stop();
        newSequencer.dispose();
      }
    };
  }, [isPlaying, steps, swing]);

  const handlePitchClick = (noteIndex: number) => {
    setSelectedPitch(noteIndex);
  };

  const handleOctaveChange = (noteIndex: number, octave: number) => {
    setNoteOctaves(prev => ({
      ...prev,
      [noteIndex]: octave
    }));
  };

  const handleNoteClick = (index: number) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      note: selectedPitch !== null ? selectedPitch : 0,
      octave: noteOctaves[selectedPitch || 0] || 2, // Default to octave 2 if not set
      velocity: newSteps[index].velocity > 0 ? 0 : 0.7
    };
    setSteps(newSteps);
  };

  const handleSlideToggle = (index: number) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      slide: !newSteps[index].slide
    };
    setSteps(newSteps);
  };

  // Add a test function
  const testSynth = () => {
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease("C2", "8n");
    }
  };

  const clearSequencer = () => {
    setSteps(Array(16).fill({ 
      note: 0, 
      velocity: 0,
      slide: false, 
      accent: false,
      octave: 2
    }));
  };

  return (
    <Panel>
      <ControlsContainer>
        <ControlGroup>
          <ControlLabel>
            Cutoff:
            <Slider
              type="range"
              min="20"
              max="20000"
              value={filterCutoff}
              onChange={(e) => setFilterCutoff(Number(e.target.value))}
            />
          </ControlLabel>
          <ControlLabel>
            Resonance:
            <Slider
              type="range"
              min="0"
              max="20"
              value={filterResonance}
              onChange={(e) => setFilterResonance(Number(e.target.value))}
            />
          </ControlLabel>
        </ControlGroup>
        <ControlGroup>
          <ControlLabel>
            Decay:
            <Slider
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={decay}
              onChange={(e) => setDecay(Number(e.target.value))}
            />
          </ControlLabel>
          <ControlLabel>
            Envelope Mod:
            <Slider
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={envelopeMod}
              onChange={(e) => setEnvelopeMod(Number(e.target.value))}
            />
          </ControlLabel>
        </ControlGroup>
        <button onClick={testSynth} style={{ 
          padding: '8px 16px',
          background: retroAccent,
          color: '#222',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: retroFont
        }}>
          Test Synth
        </button>
        <ClearButton onClick={clearSequencer}>
          Clear Bassline
        </ClearButton>
      </ControlsContainer>

      <PitchGrid>
        {PITCH_GRID.NOTES.map((note, index) => (
          <NoteContainer key={note}>
            <PitchButton
              active={selectedPitch === index}
              isCurrent={false}
              onClick={() => setSelectedPitch(index)}
            >
              {note}
            </PitchButton>
            <OctaveControl>
              {PITCH_GRID.OCTAVES.map((octave) => (
                <OctaveButton
                  key={octave}
                  active={noteOctaves[index] === octave}
                  onClick={() => handleOctaveChange(index, octave)}
                >
                  {octave}
                </OctaveButton>
              ))}
            </OctaveControl>
          </NoteContainer>
        ))}
      </PitchGrid>
      
      <SequencerGrid>
        {steps.map((step, index) => (
          <StepButton
            key={index}
            active={step.velocity > 0}
            current={currentStep === index}
            onClick={() => handleNoteClick(index)}
          >
            {PITCH_GRID.NOTES[step.note]}
            {step.octave}
            <SlideButton
              active={step.slide}
              current={currentStep === index}
              onClick={() => handleSlideToggle(index)}
            />
          </StepButton>
        ))}
      </SequencerGrid>
    </Panel>
  );
};

export default BasslineSequencer; 