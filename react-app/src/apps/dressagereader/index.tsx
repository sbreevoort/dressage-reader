import { useState, useEffect, useRef } from 'react';
import { Button } from '../../libs/shared/components/Button/Button';
import './DressageReader.css';

interface DressageTest {
  id: string;
  title: string;
  steps: string[];
}

const SELF_NARRATION_VALUE = '__self__';

const DRESSAGE_TESTS: DressageTest[] = [
	{
		"id": "B18",
		"title": "Proef B18",
		"steps": [
			"A-X-C: Binnenkomen in arbeidsdraf",
			"C: Rechterhand",
			"M-F: Gebroken lijn 5 meter",
			"K-X-M: Van hand veranderen en enkele passen de draf verruimen",
			"H-K: Gebroken lijn 5 meter",
			"Tussen A en F: Arbeidsgalop links aanspringen",
			"B-E-B: Grote volte",
			"Tussen M en C: Overgang arbeidsdraf",
			"E-F: Van hand veranderen",
			"Tussen A en K: Arbeidsgalop rechts aanspringen",
			"E-B-E: Grote volte",
			"Tussen H en C: Overgang arbeidsdraf",
			"Tussen M en B: Overgang arbeidsstap",
			"B-K: Van hand veranderen en enkele passen de stap verruimen",
			"K-A: Arbeidsstap",
			"Tussen A en F: Overgang arbeidsdraf",
			"B-E-B: Grote volte en na enkele drafpassen het paard de hals laten strekken",
			"Tussen B en M: Teugels op maat maken",
			"C-X: Halve grote volte links",
			"X-B: Rechtuit",
			"B: Rechterhand",
			"B-F-A: Arbeidsdraf",
			"A: Afwenden",
			"Tussen D en X: Arbeidsstap",
			"Tussen X en G: Halthouden en groeten",
			"In stap de rijbaan verlaten"
		]
	},
	{
		"id": "B19",
		"title": "Proef B19",
		"steps": [
			"A-X-C: Binnenkomen in arbeidsdraf",
			"C: Linkerhand",
			"E: Afwenden",
			"E-B: Arbeidsdraf",
			"B: Rechterhand",
			"K-X-M: Van hand veranderen en enkele passen de draf verruimen",
			"C-X-C: Grote volte en na enkele drafpassen het paard de hals laten strekken",
			"Tussen C en H: Teugels op maat maken",
			"E-F: Van hand veranderen",
			"A-X-A: Grote volte",
			"Op de volte tussen X en A: Arbeidsgalop rechts aanspringen",
			"E-B-E: Grote volte",
			"Tussen H en C: Overgang arbeidsdraf",
			"Tussen M en B: Overgang arbeidsstap",
			"B-K: Van hand veranderen en enkele passen de stap verruimen",
			"Tussen K en A: Overgang arbeidsdraf",
			"A-X-A: Grote volte",
			"Op de volte tussen X en A: Arbeidsgalop links aanspringen",
			"B-E-B: Grote volte",
			"Tussen M en C: Overgang arbeidsdraf",
			"H-X-F: Van hand veranderen en enkele passen de draf verruimen",
			"A: Afwenden",
			"Tussen A en D: Overgang arbeidsstap",
			"Tussen X en G: Halthouden en groeten",
			"In stap de rijbaan verlaten"
		]
	}, 
  {
    id: 'B20',
    title: 'Proef B20',
    steps: [
      'A-X-C: Binnenkomen in arbeidsdraf',
      'C: Linkerhand',
      'H-K: Gebroken lijn 5 meter',
      'F-X-H: Van hand veranderen en enkele passen de draf verruimen',
      'M-F: Gebroken lijn 5 meter',
      'E-B-E: Grote volte en na enkele drafpassen het paard de hals laten strekken',
      'Tussen E en H: Teugels op maat maken',
      'B-E-B: Grote volte',
      'Op de volte tussen E en B: Arbeidsgalop rechts aanspringen',
      'A-X-A: Grote volte',
      'Tussen A en K: Overgang arbeidsdraf',
      'E-M: Van hand veranderen',
      'C-X-C: Grote volte',
      'Op de volte tussen X en C: Arbeidsgalop links aanspringen',
      'E-B-E: Grote volte',
      'Tussen E en K: Overgang arbeidsdraf',
      'Tussen A en F: Overgang arbeidsstap',
      'F-B: Arbeidsstap',
      'B: Afwenden',
      'E: Rechterhand',
      'Tussen E en H: Overgang arbeidsdraf',
      'M-X-K: Van hand veranderen en enkele passen de draf verruimen',
      'A: Afwenden',
      'Tussen D-X: Overgang arbeidsstap',
      'Tussen X-G: Halthouden en groeten',
      'In stap de rijbaan verlaten',
    ],
  },
  {
    id: 'B21',
    title: 'Proef B21',
    steps: [
      'A-X-C: Binnenkomen in arbeidsdraf',
      'C: Rechterhand',
      'M-X-K: Van hand veranderen en enkele passen de draf verruimen',
      'Tussen A en F: Overgang arbeidsstap',
      'F-E: Van hand veranderen en enkele passen de stap verruimen',
      'Tussen E en H: Overgang arbeidsdraf',
      'C-X-C: Grote volte',
      'Op de volte tussen X en C: Arbeidsgalop rechts aanspringen',
      'B-E-B: Grote volte',
      'Tussen F en A: Overgang arbeidsdraf',
      'K-B: Van hand veranderen',
      'C-X-C: Grote volte',
      'Op de volte tussen X en C: Arbeidsgalop links aanspringen',
      'E-B-E: Grote volte',
      'Tussen K en A: Overgang arbeidsdraf',
      'B-E-B: Grote volte en na enkele drafpassen het paard de hals laten strekken',
      'Tussen B en M: Teugels op maat maken',
      'C: Afwenden',
      'A: Rechterhand',
      'K-X-M: Van hand veranderen en enkele passen de draf verruimen',
      'E: Afwenden',
      'B: Rechterhand',
      'A: Afwenden',
      'Tussen D en X: Overgang arbeidsstap',
      'Tussen X en G: Halthouden en groeten',
      'In stap de rijbaan verlaten',
    ],
  },
];

export const DressageReaderApp = () => {
  const [selectedTest, setSelectedTest] = useState<DressageTest | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSelfNarration, setIsSelfNarration] = useState(false);
  const activeStepRef = useRef<HTMLLIElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.includes('nl'));
      if (voices.length > 0) {
        setAvailableVoices(voices);
        setSelectedVoice((prev) => {
          if (prev) return prev;
          const googleVoice = voices.find((v) => v.name.toLowerCase().includes('google'));
          return googleVoice ?? voices[0];
        });
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    activeStepRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [currentStepIndex]);

  const cancelActiveUtterance = () => {
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current = null;
    }
    window.speechSynthesis.cancel();
  };

  const handleSelectTest = (test: DressageTest) => {
    cancelActiveUtterance();
    setSelectedTest(test);
    setCurrentStepIndex(0);
    setIsFinished(false);
  };

  const handleVoorlezen = () => {
    if (!selectedTest) return;
    cancelActiveUtterance();

    const advanceStep = () => {
      if (currentStepIndex < selectedTest.steps.length - 1) {
        setCurrentStepIndex((i) => i + 1);
      } else {
        setIsFinished(true);
      }
    };

    if (!isSelfNarration) {
      const utterance = new SpeechSynthesisUtterance(selectedTest.steps[currentStepIndex]);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.lang = 'nl-NL';
      utterance.onend = () => {
        utteranceRef.current = null;
        advanceStep();
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      advanceStep();
    }
  };

  const handleVorigeStap = () => {
    cancelActiveUtterance();
    if (currentStepIndex > 0) setCurrentStepIndex((i) => i - 1);
  };

  const handleReset = () => {
    cancelActiveUtterance();
    setCurrentStepIndex(0);
    setIsFinished(false);
  };

  const selectValue = isSelfNarration ? SELF_NARRATION_VALUE : (selectedVoice?.name ?? '');

  return (
    <div className="dr">
      <header className="dr__header">
        <span className="dr__header-icon" aria-hidden="true">🐴</span>
        <h1 className="dr__header-title">Dressuur Voorlezer</h1>
      </header>

      <div className="dr__controls">
        <div className="dr__chips">
          {DRESSAGE_TESTS.map((test) => (
            <button
              key={test.id}
              type="button"
              className={`dr__chip${selectedTest?.id === test.id ? ' dr__chip--active' : ''}`}
              onClick={() => handleSelectTest(test)}
            >
              {test.title}
            </button>
          ))}
        </div>

        <div className="dr__voice-row">
          <label className="dr__voice-label" htmlFor="voice-select">Stem</label>
          <select
            id="voice-select"
            className="dr__voice-select"
            value={selectValue}
            onChange={(e) => {
              if (e.target.value === SELF_NARRATION_VALUE) {
                setSelectedVoice(null);
                setIsSelfNarration(true);
              } else {
                const voice = availableVoices.find((v) => v.name === e.target.value) ?? null;
                setSelectedVoice(voice);
                setIsSelfNarration(false);
              }
            }}
          >
            {availableVoices.map((v) => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
            <option value={SELF_NARRATION_VALUE}>Zelf voorlezen</option>
          </select>
        </div>
      </div>

      <main className="dr__main">
        {!selectedTest ? (
          <div className="dr__welcome">
            <span className="dr__welcome-icon" role="img" aria-label="paard">🐴</span>
            <p>Kies een proef hierboven om te beginnen.</p>
          </div>
        ) : (
          <>
            <p className="dr__progress">
              {isFinished ? 'Klaar! 🎉' : `Stap ${currentStepIndex + 1} van ${selectedTest.steps.length}`}
            </p>
            <ol className="dr__steps">
              {selectedTest.steps.map((step, index) => (
                <li
                  key={index}
                  ref={index === currentStepIndex ? activeStepRef : null}
                  className={[
                    'dr__step',
                    index === currentStepIndex && 'dr__step--active',
                    index < currentStepIndex && 'dr__step--done',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step}
                </li>
              ))}
            </ol>
          </>
        )}
      </main>

      <footer className="dr__footer">
        <Button
          type="button"
          buttonStyle="ghost"
          className="dr__btn"
          onClick={handleVorigeStap}
          disabled={!selectedTest || currentStepIndex === 0}
        >
          ← Vorige
        </Button>
        <Button
          type="button"
          buttonStyle="filled"
          className="dr__btn dr__btn--primary"
          onClick={handleVoorlezen}
          disabled={!selectedTest || isFinished}
        >
          {isSelfNarration ? 'Volgende →' : '▶ Voorlezen'}
        </Button>
        <Button
          type="button"
          buttonStyle="ghost"
          className="dr__btn"
          onClick={handleReset}
          disabled={!selectedTest}
        >
          ↺ Reset
        </Button>
      </footer>
    </div>
  );
};
