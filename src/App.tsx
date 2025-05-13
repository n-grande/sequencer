import styled from '@emotion/styled';
import DrumSequencer from './components/DrumSequencer';

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

function App() {
  return (
    <AppContainer>
      <Title>Drum Sequencer</Title>
      <DrumSequencer />
    </AppContainer>
  );
}

export default App;
