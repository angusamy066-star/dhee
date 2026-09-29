import React, { useState, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Send,
  Sparkles,
  Bot,
  User,
  AlertCircle,
} from 'lucide-react';

interface VoiceMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  audioBase64?: string | null;
  timestamp: string;
}

export const VoiceAssistant: React.FC = () => {
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello. I am your hands-free barnside veterinary assistant. You can speak or type symptom questions while working in the pens or pasture.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [species, setSpecies] = useState('cattle');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Quick Barnside Voice Prompts
  const quickBarnPrompts = [
    'Cow in pen 2 is drooling heavily and refusing grain. What should I check first?',
    'Sow has red blotches on ears and 41°C fever. Immediate containment steps?',
    'Broiler flock water consumption dropped 40% today with rales. Suspected disease?',
    'Sheep has pale white eyelid conjunctiva and swelling under jaw. Dosage advice?',
  ];

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    setErrorMsg(null);
    setInputText('');

    const userMsg: VoiceMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/voice-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          species,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to consult voice engine');
      }

      const data = await response.json();
      const botMsg: VoiceMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.replyText,
        audioBase64: data.audioBase64,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Automatically play spoken audio response if available
      if (data.audioBase64) {
        playBase64Audio(data.audioBase64);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error processing veterinary consultation');
    } finally {
      setIsProcessing(false);
    }
  };

  const playBase64Audio = (base64Data: string) => {
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
      audioPlayerRef.current = audio;
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play().catch((err) => {
        console.warn('Audio auto-play prevented:', err);
        setIsPlayingAudio(false);
      });
    } catch (e) {
      console.error('Audio playback error:', e);
      setIsPlayingAudio(false);
    }
  };

  const toggleRecording = () => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg(
        'Speech recognition is not supported in this browser. Please type your query or use a Web Speech compatible browser.'
      );
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error !== 'no-speech') {
          setErrorMsg(`Microphone error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech initialization error:', err);
      setIsRecording(false);
      setErrorMsg('Could not access microphone.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Live Voice & Audio Triage</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Hands-Free Barnside Voice Consultation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Designed for livestock managers, pasture riders, and veterinarians wearing gloves in the field. Speaks aloud diagnostic advice and triage steps.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-300">Species Context:</span>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="cattle">Cattle</option>
              <option value="swine">Swine</option>
              <option value="poultry">Poultry</option>
              <option value="sheep">Sheep</option>
              <option value="goat">Goat</option>
            </select>
          </div>
        </div>

        {/* Quick Voice Barn Prompts */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-400 self-center mr-1">Quick Tap:</span>
          {quickBarnPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(p)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 text-slate-300 transition-all text-left"
            >
              "{p.length > 55 ? p.slice(0, 55) + '...' : p}"
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Chat & Audio Stream Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-950 text-teal-300 border border-teal-700'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <p>{msg.text}</p>
                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-500'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.audioBase64 && (
                    <button
                      onClick={() => playBase64Audio(msg.audioBase64!)}
                      className="ml-3 flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Replay Spoken Audio</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Consulting veterinary knowledge engine & generating speech...</span>
            </div>
          )}
        </div>

        {/* Bottom Input & Voice Mic Trigger */}
        <div className="pt-4 border-t border-slate-800/80 mt-2 flex items-center gap-3">
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/60 ring-4 ring-rose-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950'
            }`}
            title={isRecording ? 'Click to Stop Speaking' : 'Click to Speak (Hands-Free)'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder={
                isRecording
                  ? 'Listening to microphone...'
                  : 'Speak into mic or type barn observation...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 pr-10"
            />
            <button
              onClick={() => handleSendQuery()}
              disabled={!inputText.trim() || isProcessing}
              className="absolute right-2 top-2 p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {isPlayingAudio && (
            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-teal-950/80 border border-teal-800 text-teal-300 text-xs shrink-0 animate-pulse">
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Speaking</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
