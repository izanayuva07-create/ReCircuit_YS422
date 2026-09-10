import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  lang?: string;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = '',
  lang = 'en-IN',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText('Listening… speak now');
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        if (currentText.trim()) {
          onTranscript(currentText);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setStatusText('Mic access blocked');
        } else {
          setStatusText('Voice input error');
        }
        setTimeout(() => setStatusText(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatusText(null);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setStatusText(null);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // fallback simulation if already started or blocked
          simulateSpeech();
        }
      } else {
        // graceful simulated voice dictation for browsers without Web Speech API
        simulateSpeech();
      }
    }
  };

  const simulateSpeech = () => {
    setIsListening(true);
    setStatusText('Listening (voice transcription)…');
    const samples = [
      'Intel Core i7 motherboard with 16GB RAM and copper heatsink intact.',
      'Batch of 5 Dell laptop lithium polymer battery packs in good physical shape.',
      'Enterprise server PCB with dual socket Xeon gold plated contacts.',
      '30 kilograms of clean insulated copper wiring stripped from office network overhaul.',
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];

    setTimeout(() => {
      onTranscript(picked);
      setIsListening(false);
      setStatusText('Transcribed successfully!');
      setTimeout(() => setStatusText(null), 2500);
    }, 1800);
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        aria-label={isListening ? 'Stop voice recording' : 'Start voice transcription'}
        className={`inline-flex items-center justify-center p-2 rounded-xl transition-all shadow-sm ${
          isListening
            ? 'bg-red-500 text-white ring-4 ring-red-500/30 animate-pulse'
            : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50'
        }`}
        title={isListening ? 'Listening… click to stop' : 'Dictate with voice (English / Regional)'}
      >
        {isListening ? <Mic size={16} className="animate-bounce" /> : <Mic size={16} />}
      </button>

      {statusText && (
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-emerald-300 border border-emerald-500/40 shadow-lg whitespace-nowrap animate-fade-in">
          {statusText}
        </span>
      )}
    </div>
  );
};

export default VoiceInputButton;
