import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AppComponentProps } from '../../Applications';
import { Button } from '../../libs/shared/components';
import { analyzeIntake } from '../../libs/shared/utils/intakeApi';
import type { CandidateData } from '../../libs/shared/utils/intakeApi';
import './intakeassistent.css';

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

const EMPTY_FORM: CandidateData = {
  Voornaam: '',
  Achternaam: '',
  Functie: '',
  Uren: '',
  Regio: '',
  Samenvatting: '',
};

interface SavedCandidate extends CandidateData {
  id: number;
}

export const IntakeAssistentApp = (_props: AppComponentProps) => {
  const [transcription, setTranscription] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [apiSupported, setApiSupported] = useState(true);
  const [candidateForm, setCandidateForm] = useState<CandidateData>(EMPTY_FORM);
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (!getSpeechRecognitionCtor()) {
      setApiSupported(false);
      setSpeechError('Uw browser ondersteunt de Speech Recognition API niet. Gebruik Google Chrome voor de beste compatibiliteit.');
    }
  }, []);

  const { mutate: analyzeText, isPending: isAnalyzing, error: analyzeError } = useMutation({
    mutationFn: analyzeIntake,
    onSuccess: (data) => {
      setCandidateForm(data);
    },
  });

  const startRecording = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = 'nl-NL';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setSpeechError('');
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
      if (final) setTranscription((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let message: string;
      if (event.error === 'not-allowed') {
        message = 'Microfoon toegang geweigerd. Sta microfoon toegang toe in uw browserinstellingen.';
      } else if (event.error === 'network') {
        message = 'Netwerkfout opgetreden. Controleer uw internetverbinding.';
      } else if (event.error === 'no-speech') {
        message = 'Geen spraak gedetecteerd. Spreek duidelijk in de microfoon.';
      } else if (event.error === 'audio-capture') {
        message = 'Microfoon niet gevonden. Controleer uw microfoonaansluiting.';
      } else {
        message = `Fout: ${event.error}`;
      }
      setSpeechError(message);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
    setInterimTranscript('');
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFieldChange = (field: keyof CandidateData, value: string) => {
    setCandidateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCandidate = () => {
    const candidate: SavedCandidate = { ...candidateForm, id: nextId.current++ };
    setSavedCandidates((prev) => [...prev, candidate]);
    setCandidateForm(EMPTY_FORM);
    setTranscription('');
  };

  const handleExportJson = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `kandidaat_intakes_${dateStr}.json`;
    const blob = new Blob([JSON.stringify(savedCandidates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isFormFilled = Object.values(candidateForm).some((v) => v.trim() !== '');
  const transcriptionText = transcription + interimTranscript;

  return (
    <div className="intake">
      <h1 className="intake__title">Intake Assistent</h1>
      <p className="intake__subtitle">
        Dicteer uw kandidaatsamenvatting via spraak of typ handmatig. De AI analyseert de tekst en vult automatisch het formulier in.
      </p>

      <div className="intake__columns">
        {/* Input column */}
        <div className="intake__column">
          <h2 className="intake__section-title">Spraakopname &amp; Transcriptie</h2>

          <div className="intake__record-row">
            <Button
              type="button"
              buttonStyle="filled"
              onClick={handleToggleRecording}
              disabled={!apiSupported}
              className={isRecording ? 'intake__btn-stop' : ''}
            >
              {isRecording ? 'Stop Opname' : 'Start Opname'}
            </Button>
            {isRecording && (
              <div className="intake__listening" role="status">
                <span className="intake__pulse" aria-hidden="true" />
                <span>Aan het luisteren...</span>
              </div>
            )}
          </div>

          {speechError && (
            <div className="intake__error" role="alert">
              {speechError}
            </div>
          )}

          <label htmlFor="intake-transcription" className="intake__label">
            Transcriptie
          </label>
          <textarea
            id="intake-transcription"
            className="intake__textarea"
            value={transcriptionText}
            onChange={(e) => {
              setTranscription(e.target.value);
              setInterimTranscript('');
            }}
            placeholder="Spreek of typ hier de kandidaatinformatie..."
            rows={8}
          />

          <div className="intake__action-row">
            <Button
              type="button"
              buttonStyle="filled"
              isLoading={isAnalyzing}
              disabled={transcriptionText.trim() === '' || isAnalyzing}
              onClick={() => analyzeText(transcriptionText)}
            >
              Analyseer Intake
            </Button>
          </div>

          {analyzeError && (
            <div className="intake__error" role="alert">
              {(analyzeError as Error).message}
            </div>
          )}
        </div>

        {/* Output column */}
        <div className="intake__column">
          <h2 className="intake__section-title">Kandidaatgegevens</h2>

          <div className="intake__form">
            {(
              [
                ['Voornaam', 'Voornaam'],
                ['Achternaam', 'Achternaam'],
                ['Functie', 'Functietitel'],
                ['Uren', 'Uren per week'],
                ['Regio', 'Regio / Stad'],
              ] as [keyof CandidateData, string][]
            ).map(([field, label]) => (
              <div key={field} className="intake__field">
                <label htmlFor={`intake-${field}`} className="intake__label">
                  {label}
                </label>
                <input
                  id={`intake-${field}`}
                  type="text"
                  className="intake__input"
                  value={candidateForm[field]}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  placeholder={label}
                />
              </div>
            ))}

            <div className="intake__field intake__field--full">
              <label htmlFor="intake-Samenvatting" className="intake__label">
                Samenvatting
              </label>
              <textarea
                id="intake-Samenvatting"
                className="intake__textarea intake__textarea--short"
                value={candidateForm.Samenvatting}
                onChange={(e) => handleFieldChange('Samenvatting', e.target.value)}
                placeholder="Professionele samenvatting van de kandidaat..."
                rows={4}
              />
            </div>

            <div className="intake__action-row">
              <Button
                type="button"
                buttonStyle="filled"
                disabled={!isFormFilled}
                onClick={handleSaveCandidate}
              >
                Kandidaat Opslaan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent intakes table */}
      <div className="intake__table-section">
        <div className="intake__table-header">
          <h2 className="intake__section-title">Recente Intakes</h2>
          {savedCandidates.length > 0 && (
            <Button type="button" buttonStyle="ghost" onClick={handleExportJson}>
              Exporteer naar JSON
            </Button>
          )}
        </div>

        {savedCandidates.length === 0 ? (
          <p className="intake__empty">Nog geen kandidaten opgeslagen.</p>
        ) : (
          <div className="intake__table-wrapper">
            <table className="intake__table">
              <thead>
                <tr>
                  <th>Voornaam</th>
                  <th>Achternaam</th>
                  <th>Functie</th>
                  <th>Uren</th>
                  <th>Regio</th>
                </tr>
              </thead>
              <tbody>
                {savedCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.Voornaam || '—'}</td>
                    <td>{candidate.Achternaam || '—'}</td>
                    <td>{candidate.Functie || '—'}</td>
                    <td>{candidate.Uren || '—'}</td>
                    <td>{candidate.Regio || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
