import { useState, useRef, useEffect } from 'react';
import type { AppComponentProps } from '../../Applications';
import { Button } from '../../libs/shared/components';
import './spraaktester.css';

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

const getSpeechRecognitionCtor = (): (new () => SpeechRecognition) | null => {
  if ('webkitSpeechRecognition' in window) return window.webkitSpeechRecognition!;
  if (typeof SpeechRecognition !== 'undefined') return SpeechRecognition;
  return null;
};

export const SpeechTesterApp = (_props: AppComponentProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [apiSupported, setApiSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!getSpeechRecognitionCtor()) {
      setApiSupported(false);
      setError('Uw browser ondersteunt de Speech Recognition API niet. Gebruik Google Chrome voor de beste compatibiliteit.');
    }
  }, []);

  const startRecognition = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = 'nl-NL';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) setTranscript(prev => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let message: string;
      if (event.error === 'not-allowed') {
        message = 'Microfoon toegang geweigerd. Sta microfoon toegang toe in uw browserinstellingen en probeer opnieuw.';
      } else if (event.error === 'network') {
        message = 'Netwerkfout opgetreden. Controleer uw internetverbinding en probeer opnieuw.';
      } else if (event.error === 'no-speech') {
        message = 'Geen spraak gedetecteerd. Spreek duidelijk in de microfoon.';
      } else if (event.error === 'audio-capture') {
        message = 'Microfoon niet gevonden. Controleer of uw microfoon correct is aangesloten.';
      } else {
        message = `Fout: ${event.error}`;
      }
      setError(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimTranscript('');
  };

  const handleToggle = () => {
    if (isListening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  const hasTranscript = transcript.length > 0 || interimTranscript.length > 0;

  return (
    <div className="spraaktester">
      <div className="spraaktester-container">
        <h1 className="spraaktester-title">Spraak Tester</h1>
        <p className="spraaktester-subtitle">
          Test de browser Speech Recognition API (nl-NL)
        </p>

        <div className="spraaktester-button-wrapper">
          <Button
            type="button"
            buttonStyle="filled"
            onClick={handleToggle}
            disabled={!apiSupported}
            className={isListening ? 'spraaktester-btn-stop' : ''}
          >
            {isListening ? 'Stop Opname' : 'Start Test Opname'}
          </Button>
        </div>

        {isListening && (
          <div className="spraaktester-listening" role="status">
            <span className="spraaktester-pulse" aria-hidden="true" />
            <span>Aan het luisteren...</span>
          </div>
        )}

        {hasTranscript && (
          <div className="spraaktester-transcript-block" aria-live="polite">
            <span className="spraaktester-transcript-final">{transcript}</span>
            {interimTranscript && (
              <span className="spraaktester-transcript-interim">{interimTranscript}</span>
            )}
          </div>
        )}

        {error && (
          <div className="spraaktester-error" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
