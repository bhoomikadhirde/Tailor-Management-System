import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  Sparkles, 
  Keyboard, 
  CornerDownLeft, 
  Volume2, 
  VolumeX, 
  User, 
  Scissors,
  Check, 
  Cpu,
  RefreshCw
} from 'lucide-react';
import { Client } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  parsedAction?: {
    intent: string;
    clientId?: string;
    clientNameMatched?: string;
    clothingType?: string;
    measurements?: Record<string, number>;
    price?: number;
    speakResponse?: string;
  };
}

interface AtelierAssistantProps {
  clients: Client[];
  onDataUpdate: () => void; // Trigger root reload
}

export default function AtelierAssistant({ clients, onDataUpdate }: AtelierAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Greetings, master tailor. I am your Bespoke AI Assistant. You can speak to me or type naturally to check records, record fitting measurements, or place new garment orders.\n\nTry saying something like:\n• 'Set chest of Margaret Sterling to 37 and waist to 28'\n• 'Place a new Tuxedo order for Arthur Pendelton price 1500'\n• 'Check Arthur Pendelton's measurements'",
      timestamp: new Date()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  
  // Browser Web Speech Recognition Ref
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages list grows
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Setup webkitSpeechRecognition if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript) {
          handleSendCommand(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition isn't supported or active in your current browser session. Please type commands into the communication console below.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSendCommand = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = {
      id: 'msg_' + Date.now() + '_u',
      sender: 'user',
      text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/assistant/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text })
      });

      if (res.ok) {
        const parsed = await res.json();
        
        const assistantMsg: Message = {
          id: 'msg_' + Date.now() + '_a',
          sender: 'assistant',
          text: parsed.speakResponse || 'Instruction processed successfully.',
          timestamp: new Date(),
          parsedAction: parsed
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        
        // Speak back if synthesis is supported & enabled
        if (speechEnabled && window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(parsed.speakResponse || 'Instruction compiled.');
          u.rate = 1.0;
          u.pitch = 1.05;
          // Set to a soft female voice if available, or default
          const voices = window.speechSynthesis.getVoices();
          const elegantVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural'));
          if (elegantVoice) u.voice = elegantVoice;
          
          window.speechSynthesis.speak(u);
        }

        // Trigger parent state update so client measurements listings update!
        onDataUpdate();
      } else {
        const errorMsg: Message = {
          id: 'msg_' + Date.now() + '_err',
          sender: 'assistant',
          text: 'I apologize, there was an issue compiling your bespoke voice structure in our back-office database.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err) {
      const errorMsg: Message = {
        id: 'msg_' + Date.now() + '_err',
        sender: 'assistant',
        text: 'Network timeout connection. Please verify system logs.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Click suggestions triggers command
  const handleSuggestionClick = (sampleTxt: string) => {
    handleSendCommand(sampleTxt);
  };

  return (
    <div className="space-y-6 p-1 sm:p-2">
      {/* Brand Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-natural-border pb-5">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-natural-text uppercase">
            Atelier voice assistant
          </h2>
          <p className="text-xs text-natural-muted mt-1 max-w-2xl font-sans">
            Direct your sewing floor hand-free! Dictate measurements adjustments, issue draft sewing orders, and interrogate client profiles using advanced natural language processing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Audio readback toggle */}
          <button 
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`flex items-center gap-2 p-2 px-3 border rounded-xl text-xs font-mono transition-all uppercase tracking-wider cursor-pointer ${
              speechEnabled ? 'border-natural-accent bg-natural-panel text-natural-text' : 'border-natural-border bg-white text-natural-muted'
            }`}
          >
            {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span>Voice Speech: {speechEnabled ? 'Active' : 'Muted'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Interactive Speech Orb Column (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between p-6 bg-white border border-natural-border rounded-2xl relative shadow-xs overflow-hidden h-fit lg:sticky lg:top-4">
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-natural-accent" />
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-grid opacity-[0.06] pointer-events-none" />

          <div className="text-center space-y-4 relative z-10 pt-4">
            <h3 className="font-serif text-md font-bold tracking-tight text-natural-text uppercase">
              Bespoke Acoustics Orb
            </h3>
            <p className="text-[11px] text-natural-muted leading-relaxed max-w-xs mx-auto">
              Click the tailor's pincushion below and speak details naturally. The system handles names and dimensions with double-entry security.
            </p>
          </div>

          {/* Majestic Pulsating Microphone Orb */}
          <div className="my-10 flex flex-col items-center justify-center relative">
            
            {/* Pulsating circles */}
            <AnimatePresence>
              {isListening && (
                <>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                    className="absolute w-32 h-32 rounded-full border border-natural-accent"
                  />
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0.4 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut", delay: 0.5 }}
                    className="absolute w-32 h-32 rounded-full border border-dashed border-natural-accent"
                  />
                </>
              )}
            </AnimatePresence>

            {/* Pincushion Stitching Outer Ring */}
            <div className={`w-32 h-32 rounded-full flex items-center justify-center border-2 border-dashed transition-all duration-300 relative ${
              isListening ? 'border-natural-accent bg-natural-panel animate-spin-slow' : 'border-natural-border bg-natural-bg'
            }`}>
              {/* Inner button shadow circle */}
              <button
                type="button"
                onClick={toggleListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-md transform hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                  isListening ? 'bg-natural-accent text-white' : 'bg-white hover:bg-natural-panel text-natural-text border border-natural-border'
                }`}
              >
                {isListening ? (
                  <Mic className="h-10 w-10 animate-pulse" />
                ) : (
                  <MicOff className="h-10 w-10 text-natural-muted hover:text-natural-accent" />
                )}
              </button>
            </div>

            <span className={`text-[11px] font-mono font-bold tracking-widest mt-6 uppercase ${
              isListening ? 'text-natural-accent animate-pulse' : 'text-natural-muted'
            }`}>
              {isListening ? 'Listening for audio...' : 'Microphone Inactive'}
            </span>
          </div>

          {/* Quick instructions panel */}
          <div className="p-4 rounded-xl bg-natural-panel/60 border border-natural-border text-left space-y-2 pt-3">
            <h4 className="text-[10px] font-mono font-bold text-natural-accent uppercase tracking-wider">
              ◆ Sample Voice Transcripts
            </h4>
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleSuggestionClick("Set Margaret Sterling waists to 28 inches")}
                className="w-full text-left bg-white/75 hover:bg-white text-[10px] p-2 rounded-lg border border-natural-border/70 transition-all font-mono truncate"
              >
                "Set Margaret Sterling waist to 28 inches"
              </button>
              <button
                onClick={() => handleSuggestionClick("Create a new suit order for Arthur Pendelton price 850")}
                className="w-full text-left bg-white/75 hover:bg-white text-[10px] p-2 rounded-lg border border-natural-border/70 transition-all font-mono truncate"
              >
                "Create a new suit order for Arthur..."
              </button>
              <button
                onClick={() => handleSuggestionClick("Check Margaret Sterling's measurements")}
                className="w-full text-left bg-white/75 hover:bg-white text-[10px] p-2 rounded-lg border border-natural-border/70 transition-all font-mono truncate"
              >
                "Check Margaret Sterling's measurements"
              </button>
            </div>
          </div>
        </div>

        {/* Conversational Screen Column (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-[520px] lg:h-[620px] bg-white border border-natural-border rounded-2xl relative shadow-xs overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-natural-accent/10" />
          
          <div className="p-4 border-b border-natural-border bg-natural-bg/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4.5 w-4.5 text-natural-accent" />
              <span className="font-serif text-sm font-bold text-natural-text uppercase tracking-tight">Atelier Session Logs</span>
            </div>
            {isProcessing && (
              <div className="flex items-center gap-1.5 text-natural-accent text-xs font-mono">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Atelier AI compiling...</span>
              </div>
            )}
          </div>

          {/* Bubbles stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-grid/5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.sender === 'user' 
                    ? 'bg-natural-secondary border-natural-border text-white' 
                    : 'bg-natural-panel border-natural-border text-natural-accent'
                }`}>
                  {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
                </div>

                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm line-height-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-natural-secondary text-white rounded-tr-none'
                      : 'bg-natural-panel text-natural-text rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>

                  {/* If assistant returns structured side effect metadata */}
                  {msg.parsedAction && msg.parsedAction.intent !== 'UNKNOWN' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-natural-bg rounded-xl border border-natural-border/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-natural-accent uppercase tracking-wider flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          DATABASE ACTION: {msg.parsedAction.intent}
                        </span>
                        <span className="text-[9px] font-mono text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md border border-green-200 uppercase font-semibold flex items-center gap-0.5">
                          <Check className="h-3 w-3" />
                          Committed
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-natural-muted font-sans space-y-1">
                        <p>• <b className="text-natural-text">Client Account:</b> {msg.parsedAction.clientNameMatched || 'Selected Client'}</p>
                        {msg.parsedAction.clothingType && (
                          <p>• <b className="text-natural-text">Custom Garment:</b> {msg.parsedAction.clothingType} (Price: ₹{msg.parsedAction.price})</p>
                        )}
                        {msg.parsedAction.measurements && Object.keys(msg.parsedAction.measurements).length > 0 && (
                          <div className="pt-0.5">
                            <p className="font-mono text-[9px] text-natural-accent uppercase font-bold mt-1">◆ Applied Adjustments:</p>
                            <div className="grid grid-cols-2 gap-1 mt-1 font-mono text-[10px] bg-white/60 p-2 rounded-lg border border-natural-border/40">
                              {Object.entries(msg.parsedAction.measurements).map(([k, v]) => (
                                <span key={k} className="text-natural-text">
                                  {k}: <b className="text-natural-accent">{v}"</b>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  
                  <span className="block text-[9px] font-mono text-natural-muted/60 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {/* Typing manual interface for both option support */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCommand(inputText);
            }}
            className="p-4 bg-natural-panel/40 border-t border-natural-border flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-natural-muted/70" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type command manually (e.g. 'update waist of Margaret to 29')..."
                className="w-full bg-white border border-natural-border focus:border-natural-accent pl-10 pr-4 py-2.5 rounded-xl text-xs text-natural-text focus:outline-none placeholder-natural-muted/60 font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-3 bg-natural-accent hover:bg-natural-accent/90 text-white rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
