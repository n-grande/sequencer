import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import * as Tone from 'tone';

interface Step {
  active: boolean;
  volume: number;
  pan: number;
  pitch: number;
}

interface Track {
  name: string;
  steps: Step[];
  sample: Tone.Player | null;
  volume: number;
  muted: boolean;
  solo: boolean;
  chokeGroup?: string;
}

// Retro color palette
const retroPanel = '#232323';
const retroAccent = '#ff9800';
const retroAccent2 = '#ff1744';
const retroAccent3 = '#ffd600';
const retroText = '#ffe082';
const retroStepActive = '#ff9800';
const retroStepInactive = '#333';
const retroStepBorder = '#444';
const retroFont = '"Share Tech Mono", "Fira Mono", monospace';

const playheadColor = '#f8f8e7'; // off-white

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
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: ${retroPanel};
  border-radius: 8px;
  border: 2px solid ${retroStepBorder};
  margin-top: 16px;
  position: relative;
`;

const TrackControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
  height: 38px;
  position: relative;
  z-index: 2;
  background: ${retroPanel};
  min-width: 120px;
  box-sizing: border-box;
  justify-content: flex-end;
`;

const TrackLabel = styled.div`
  color: ${retroText};
  font-family: ${retroFont};
  font-size: 18px;
  min-width: 30px;
  text-align: right;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: ${retroPanel};
  padding: 2px 4px;
  border-radius: 4px;
`;

const VolumeSlider = styled.input`
  width: 70px;
  -webkit-appearance: none;
  height: 4px;
  background: #222;
  border-radius: 2px;
  outline: none;
  margin: 0 4px;
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

const VolumeValue = styled.span`
  min-width: 32px;
  text-align: center;
  font-family: ${retroFont};
  color: ${retroText};
  font-size: 13px;
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  background: ${retroPanel};
  padding: 2px;
  border-radius: 4px;
`;

const MuteButton = styled.button`
  padding: 2px 10px;
  background: #222;
  color: ${retroText};
  border: 1.5px solid ${retroStepBorder};
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-family: ${retroFont};
  position: relative;
  z-index: 2;
  white-space: nowrap;
  &.muted {
    background: ${retroAccent2};
    color: #fff;
    border-color: ${retroAccent2};
  }
  &:hover {
    background: ${retroAccent};
    color: #222;
  }
`;

const SoloButton = styled.button`
  padding: 2px 10px;
  background: #222;
  color: ${retroText};
  border: 1.5px solid ${retroStepBorder};
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-family: ${retroFont};
  position: relative;
  z-index: 2;
  white-space: nowrap;
  &.soloed {
    background: ${retroAccent3};
    color: #222;
    border-color: ${retroAccent3};
  }
  &:hover {
    background: ${retroAccent};
    color: #222;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  align-items: center;
  justify-content: center;
`;

const PlayButton = styled.button`
  padding: 12px 32px;
  font-size: 20px;
  background: ${retroAccent};
  color: #222;
  border: 2px solid ${retroStepBorder};
  border-radius: 8px;
  font-family: ${retroFont};
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 8px #0008;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${retroAccent2};
    color: #fff;
  }
`;

const TempoControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${retroText};
  background: #222;
  padding: 10px 15px;
  border-radius: 4px;
  font-family: ${retroFont};
`;

const TempoInput = styled.input`
  width: 60px;
  padding: 5px;
  border: 1.5px solid ${retroStepBorder};
  border-radius: 4px;
  background: #181818;
  color: ${retroText};
  text-align: center;
  font-size: 16px;
  font-family: ${retroFont};
  &:focus {
    outline: none;
    border-color: ${retroAccent};
  }
`;

const TempoButton = styled.button`
  padding: 5px 10px;
  background: #232323;
  color: ${retroText};
  border: 1.5px solid ${retroStepBorder};
  border-radius: 4px;
  cursor: pointer;
  font-family: ${retroFont};
  transition: all 0.2s;
  &:hover {
    background: ${retroAccent};
    color: #222;
  }
`;

const SwingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${retroText};
  background: #222;
  padding: 10px 15px;
  border-radius: 4px;
  font-family: ${retroFont};
`;

const SwingSlider = styled.input`
  width: 100px;
  -webkit-appearance: none;
  height: 4px;
  background: #181818;
  border-radius: 2px;
  outline: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: ${retroAccent3};
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid ${retroStepBorder};
    transition: background 0.2s;
    &:hover {
      background: ${retroAccent};
    }
  }
`;

const SwingValue = styled.span`
  min-width: 40px;
  text-align: center;
  font-family: ${retroFont};
  color: ${retroText};
`;

const TapTempoButton = styled.button`
  padding: 10px 20px;
  background: #232323;
  color: ${retroText};
  border: 2px solid ${retroStepBorder};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-family: ${retroFont};
  &:hover {
    background: ${retroAccent};
    color: #222;
  }
  &:active {
    background: ${retroAccent2};
    color: #fff;
  }
`;

const StepLED = styled.div<{ current: boolean }>`
  width: 14px;
  height: 14px;
  margin: 0 auto 4px auto;
  border-radius: 50%;
  background: ${({ current }) =>
    current ? playheadColor : '#222'};
  box-shadow: ${({ current }) =>
    current ? `0 0 12px 4px ${playheadColor}, 0 0 2px 1px #fff2` : '0 0 2px 1px #111'};
  border: 2px solid #111;
  transition: background 0.15s, box-shadow 0.15s;
`;

const StepCell = styled.div<{ barColor?: string; isBarStart: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 0;
  background: ${({ barColor }) => barColor || 'transparent'};
  border-left: ${({ isBarStart }) => (isBarStart ? '3px solid #ff9800' : 'none')};
  border-radius: ${({ isBarStart }) => (isBarStart ? '6px 0 0 6px' : '0')};
`;

const TrackRow = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(16, 1fr);
  gap: 4px;
  position: relative;
  z-index: 1;
  height: 38px;
  background: ${retroPanel};
`;

const StepButton = styled.button<{ active: boolean; current: boolean }>`
  width: 38px;
  height: 38px;
  border: 2px solid ${retroStepBorder};
  border-radius: 6px;
  background: ${({ active }) =>
    active ? retroStepActive : retroStepInactive};
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

const DrumSequencer: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([
    {
      name: 'K',
      steps: Array(16).fill({ active: false, volume: 1, pan: 0, pitch: 0 }),
      sample: null,
      volume: 1,
      muted: false,
      solo: false
    },
    {
      name: 'C',
      steps: Array(16).fill({ active: false, volume: 1, pan: 0, pitch: 0 }),
      sample: null,
      volume: 1,
      muted: false,
      solo: false
    },
    {
      name: 'H',
      steps: Array(16).fill({ active: false, volume: 1, pan: 0, pitch: 0 }),
      sample: null,
      volume: 1,
      muted: false,
      solo: false,
      chokeGroup: 'hihat'
    },
    {
      name: 'OH',
      steps: Array(16).fill({ active: false, volume: 1, pan: 0, pitch: 0 }),
      sample: null,
      volume: 1,
      muted: false,
      solo: false,
      chokeGroup: 'hihat'
    }
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [sequencer, setSequencer] = useState<Tone.Sequence | null>(null);
  const [swing, setSwing] = useState(0); // 0-100%

  useEffect(() => {
    // Initialize Tone.js
    Tone.start();
    
    // Load samples
    const loadSamples = async () => {
      try {
        const kickPlayer = new Tone.Player({
          url: '/samples/Kick.wav',
          onload: () => {
            console.log('Kick loaded successfully');
            // Test play the kick
            kickPlayer.start();
          },
          onerror: (error) => console.error('Error loading kick:', error)
        }).toDestination();

        const clapPlayer = new Tone.Player({
          url: '/samples/clap.wav',
          onload: () => {
            console.log('Clap loaded successfully');
            // Test play the clap
            clapPlayer.start();
          },
          onerror: (error) => console.error('Error loading clap:', error)
        }).toDestination();

        const hihatPlayer = new Tone.Player({
          url: '/samples/hihat.wav',
          onload: () => {
            console.log('Hi-hat loaded successfully');
            // Test play the hi-hat
            hihatPlayer.start();
          },
          onerror: (error) => console.error('Error loading hi-hat:', error)
        }).toDestination();

        const openHihatPlayer = new Tone.Player({
          url: '/samples/openhihat.wav',
          onload: () => {
            console.log('Open Hi-hat loaded successfully');
            openHihatPlayer.start();
          },
          onerror: (error) => console.error('Error loading open hi-hat:', error)
        }).toDestination();

        setTracks(prev => prev.map((track, i) => ({
          ...track,
          sample: [kickPlayer, clapPlayer, hihatPlayer, openHihatPlayer][i]
        })));
      } catch (error) {
        console.error('Error in loadSamples:', error);
      }
    };

    loadSamples();
  }, []);

  // Update tempo when it changes
  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  // Update sequencer logic with swing
  useEffect(() => {
    if (!isPlaying) {
      if (sequencer) {
        sequencer.stop();
        sequencer.dispose();
        setSequencer(null);
      }
      return;
    }

    const anySoloed = tracks.some(track => track.solo);

    // Create new sequencer with swing
    const newSequencer = new Tone.Sequence(
      (time, step) => {
        setCurrentStep(step);
        
        // Apply swing to even-numbered steps
        const swingTime = step % 2 === 1 ? 
          time + (swing / 100) * Tone.Time('16n').toSeconds() : 
          time;
        
        // Choke group logic: collect which choke groups are triggered this step
        const triggeredChokeGroups = new Set<string>();
        tracks.forEach((track) => {
          const shouldPlay = anySoloed ? track.solo : !track.muted;
          if (shouldPlay && track.steps[step].active && track.chokeGroup) {
            triggeredChokeGroups.add(track.chokeGroup);
          }
        });

        // Play active steps with error handling, skip muted, handle solo, handle choke
        tracks.forEach((track) => {
          const shouldPlay = anySoloed ? track.solo : !track.muted;
          if (shouldPlay && track.steps[step].active && track.sample) {
            // If this track is in a choke group, stop all other samples in the same group
            if (track.chokeGroup && triggeredChokeGroups.has(track.chokeGroup)) {
              tracks.forEach((otherTrack) => {
                if (
                  otherTrack.chokeGroup === track.chokeGroup &&
                  otherTrack.sample
                ) {
                  otherTrack.sample.stop();
                }
              });
            }
            try {
              track.sample.start(swingTime);
              console.log(`Playing ${track.name} at step ${step}`);
            } catch (error) {
              console.error(`Error playing ${track.name} at step ${step}:`, error);
            }
          }
        });
      },
      [...Array(16).keys()],
      '16n'
    );

    // Start the sequencer
    newSequencer.start(0);
    setSequencer(newSequencer);

    // Cleanup
    return () => {
      if (newSequencer) {
        newSequencer.stop();
        newSequencer.dispose();
      }
    };
  }, [isPlaying, tracks, swing]);

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    setTracks(prev => prev.map((track, i) => {
      if (i === trackIndex) {
        const newSteps = [...track.steps];
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          active: !newSteps[stepIndex].active
        };
        return { ...track, steps: newSteps };
      }
      return track;
    }));
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value);
    if (!isNaN(newTempo) && newTempo >= 50 && newTempo <= 200) {
      setTempo(newTempo);
    }
  };

  const togglePlay = async () => {
    try {
      if (Tone.Transport.state === 'started') {
        await Tone.Transport.stop();
        setIsPlaying(false);
        setCurrentStep(0);
      } else {
        await Tone.start();
        await Tone.Transport.start();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play state:', error);
      setIsPlaying(false);
      setCurrentStep(0);
    }
  };

  const adjustTempo = (amount: number) => {
    const newTempo = Math.min(Math.max(tempo + amount, 50), 200);
    setTempo(newTempo);
  };

  const handleTapTempo = () => {
    const now = Date.now();
    const newTapTimes = [...tapTimes, now];
    
    // Keep only the last 4 taps
    if (newTapTimes.length > 4) {
      newTapTimes.shift();
    }
    
    setTapTimes(newTapTimes);
    setLastTapTime(now);

    // Calculate tempo if we have at least 2 taps
    if (newTapTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < newTapTimes.length; i++) {
        intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
      }
      
      // Calculate average interval
      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      
      // Convert to BPM (60000ms = 1 minute)
      const newTempo = Math.round(60000 / averageInterval);
      
      // Ensure tempo is within bounds
      if (newTempo >= 50 && newTempo <= 200) {
        setTempo(newTempo);
      }
    }
  };

  // Clear tap times after 2 seconds of inactivity
  useEffect(() => {
    if (lastTapTime === 0) return;

    const timeout = setTimeout(() => {
      setTapTimes([]);
      setLastTapTime(0);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [lastTapTime]);

  const handleSwingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSwing = parseInt(e.target.value);
    setSwing(newSwing);
  };

  const handleVolumeChange = (trackIndex: number, value: number) => {
    setTracks(prev => prev.map((track, i) => {
      if (i === trackIndex && track.sample) {
        track.sample.volume.value = Tone.gainToDb(value);
        return { ...track, volume: value };
      }
      return track;
    }));
  };

  const handleMute = (trackIndex: number) => {
    setTracks(prev => prev.map((track, i) =>
      i === trackIndex ? { ...track, muted: !track.muted } : track
    ));
  };

  const handleSolo = (trackIndex: number, e?: React.MouseEvent<HTMLButtonElement>) => {
    setTracks(prev => {
      const isShift = e?.shiftKey;
      if (isShift) {
        // Toggle solo for this track only, allow multiple soloed
        return prev.map((track, i) =>
          i === trackIndex ? { ...track, solo: !track.solo } : track
        );
      } else {
        // Solo only this track, unsolo all others (or unsolo all if already soloed)
        const isSoloing = !prev[trackIndex].solo;
        if (isSoloing) {
          return prev.map((track, i) => ({ ...track, solo: i === trackIndex }));
        } else {
          return prev.map(track => ({ ...track, solo: false }));
        }
      }
    });
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (sequencer) {
        sequencer.stop();
        sequencer.dispose();
      }
      Tone.Transport.stop();
      tracks.forEach(track => {
        if (track.sample) {
          track.sample.stop();
          track.sample.dispose();
        }
      });
    };
  }, []);

  const clearDrumSequencer = () => {
    setTracks(prev => prev.map(track => ({
      ...track,
      steps: Array(16).fill({ active: false, volume: 1, pan: 0, pitch: 0 })
    })));
  };

  return (
    <Panel>
      <ControlsContainer>
        <PlayButton onClick={togglePlay}>
          {isPlaying ? 'Stop' : 'Play'}
        </PlayButton>
        <TempoControl>
          <label>Tempo:</label>
          <TempoButton onClick={() => adjustTempo(-1)}>-</TempoButton>
          <TempoInput
            type="number"
            min="50"
            max="200"
            value={tempo}
            onChange={handleTempoChange}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                adjustTempo(1);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                adjustTempo(-1);
              }
            }}
          />
          <TempoButton onClick={() => adjustTempo(1)}>+</TempoButton>
          <span>BPM</span>
        </TempoControl>
        <SwingControl>
          <label>Swing:</label>
          <SwingSlider
            type="range"
            min="0"
            max="50"
            value={swing}
            onChange={handleSwingChange}
          />
          <SwingValue>{swing}%</SwingValue>
        </SwingControl>
        <TapTempoButton
          onClick={handleTapTempo}
          style={{
            background: tapTimes.length > 0 ? retroAccent : '#232323',
            color: tapTimes.length > 0 ? '#222' : retroText,
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          Tap Tempo
        </TapTempoButton>
        <ClearButton onClick={clearDrumSequencer}>
          Clear Drums
        </ClearButton>
      </ControlsContainer>
      
      <SequencerGrid>
        {tracks.map((track, trackIndex) => (
          <TrackRow key={track.name}>
            <TrackControls>
              <TrackLabel>{track.name}</TrackLabel>
              <VolumeSlider
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={track.volume}
                onChange={(e) => handleVolumeChange(trackIndex, parseFloat(e.target.value))}
              />
              <VolumeValue>{Math.round(track.volume * 100)}%</VolumeValue>
              <ControlsGroup>
                <MuteButton
                  className={track.muted ? 'muted' : ''}
                  onClick={() => handleMute(trackIndex)}
                >
                  MUTE
                </MuteButton>
                <SoloButton
                  className={track.solo ? 'soloed' : ''}
                  onClick={(e) => handleSolo(trackIndex, e)}
                >
                  SOLO
                </SoloButton>
              </ControlsGroup>
            </TrackControls>
            {track.steps.map((step, stepIndex) => (
              <StepButton
                key={stepIndex}
                active={step.active}
                current={currentStep === stepIndex}
                onClick={() => toggleStep(trackIndex, stepIndex)}
              />
            ))}
          </TrackRow>
        ))}
      </SequencerGrid>
    </Panel>
  );
};

export default DrumSequencer; 