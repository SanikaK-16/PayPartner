import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Bot,
  Sparkles,
} from "lucide-react";

function VoiceAssistant({ onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      setTranscript(finalText || interimText);

      if (finalText) {
        setResponse(
          "I heard your request. I'll use your business data and configured policies to provide the relevant recommendation."
        );
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setResponse(
        "Voice input is not supported in this browser. Please use a browser with speech recognition support."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    setTranscript("");
    setResponse("");

    try {
      recognitionRef.current.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/30 px-5 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot size={21} strokeWidth={1.8} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-navy">
                Voice with PayPartner
              </h2>

              <p className="mt-0.5 text-xs text-text-secondary">
                Ask about your business naturally
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-navy"
            aria-label="Close voice assistant"
          >
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        {/* Main */}
        <div className="px-6 py-8">
          <div className="text-center">
            <div
              className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full transition ${
                isListening
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isListening ? (
                <Mic size={34} strokeWidth={1.7} />
              ) : (
                <Mic size={34} strokeWidth={1.7} />
              )}
            </div>

            <p className="mt-5 text-lg font-semibold text-navy">
              {isListening ? "Listening..." : "Tap to speak"}
            </p>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">
              {isListening
                ? "Tell PayPartner what you want to understand or act on."
                : "Ask about sales, failed payments, customers, or business opportunities."}
            </p>
          </div>

          {/* Transcript */}
          <div className="mt-7 min-h-24 rounded-xl border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <Volume2
                size={18}
                className="mt-0.5 shrink-0 text-text-secondary"
                strokeWidth={1.8}
              />

              <div className="min-w-0">
                <p className="text-xs font-medium text-text-secondary">
                  You said
                </p>

                <p className="mt-1 text-sm leading-6 text-navy">
                  {transcript || "Your spoken request will appear here."}
                </p>
              </div>
            </div>
          </div>

          {/* Response */}
          {response && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Sparkles
                  size={18}
                  className="mt-0.5 shrink-0 text-primary"
                  strokeWidth={1.8}
                />

                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    PayPartner
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text">
                    {response}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mic Button */}
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={toggleListening}
              className={`flex h-16 w-16 items-center justify-center rounded-full transition ${
                isListening
                  ? "bg-error text-white hover:bg-error/90"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? (
                <MicOff size={25} strokeWidth={1.8} />
              ) : (
                <Mic size={25} strokeWidth={1.8} />
              )}
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-text-secondary">
            {isListening ? "Tap to stop" : "Tap the microphone to start"}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-background/60 px-6 py-4">
          <p className="text-center text-xs text-text-secondary">
            Recommendations remain within your configured business policies.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;