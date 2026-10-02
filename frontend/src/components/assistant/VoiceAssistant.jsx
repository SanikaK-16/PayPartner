import { useRef, useState } from "react";
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Bot,
  Sparkles,
  Loader2,
  Square,
} from "lucide-react";

const VOICE_WEBHOOK =
  "https://sanikak123.app.n8n.cloud/webhook/voice-paypartner";

function VoiceAssistant({ onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const startListening = async () => {
    try {
      setError("");
      setResponse("");
      setTranscript("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        await sendVoiceToPayPartner(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();

      setIsListening(true);
    } catch (err) {
      console.error("Microphone error:", err);

      setError(
        "Microphone access was not available. Please allow microphone access and try again."
      );

      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (!mediaRecorderRef.current) return;

    setIsListening(false);
    setIsProcessing(true);

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsSpeaking(false);
    setIsProcessing(false);
  };

  const sendVoiceToPayPartner = async (audioBlob) => {
    try {
      const selectedMerchant = JSON.parse(
        localStorage.getItem("selectedMerchant") || "{}"
      );

      const formData = new FormData();

      formData.append("data", audioBlob, "voice.webm");

      if (selectedMerchant?.id) {
        formData.append("merchant_id", String(selectedMerchant.id));
      } else {
        formData.append("merchant_id", "1");
      }

      const res = await fetch(VOICE_WEBHOOK, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Voice request failed: ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();

        const answer =
          data.answer ||
          data.response ||
          data.message ||
          data.text ||
          "";

        if (data.transcript) {
          setTranscript(data.transcript);
        }

        if (answer) {
          setResponse(answer);
        }

        /*
         * Current n8n Voice Response format:
         *
         * {
         *   request_id: "...",
         *   audios: ["BASE64_WAV_AUDIO"]
         * }
         */
        const audioBase64 =
          data.audio ||
          data.audio_base64 ||
          data.audioContent ||
          data.tts_audio ||
          data.audios?.[0] ||
          null;

        if (audioBase64) {
          const audio = new Audio(
            `data:audio/wav;base64,${audioBase64}`
          );

          audioRef.current = audio;

          setIsProcessing(false);
          setIsSpeaking(true);

          audio.onended = () => {
            audioRef.current = null;
            setIsSpeaking(false);
          };

          audio.onerror = () => {
            audioRef.current = null;
            setIsSpeaking(false);
            setError("PayPartner's voice response could not be played.");
          };

          await audio.play();
        } else {
          setIsProcessing(false);

          if (!answer && !data.transcript) {
            setResponse(
              "PayPartner received your request but did not return a response."
            );
          }
        }
      } else {
        const text = await res.text();

        setIsProcessing(false);

        if (text) {
          setResponse(text);
        }
      }
    } catch (err) {
      console.error("Voice error:", err);

      setError(
        "I couldn't connect to PayPartner voice right now. Please try again."
      );

      setIsProcessing(false);
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (isProcessing) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
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
                  : isSpeaking
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isListening ? (
                <Mic size={34} strokeWidth={1.7} />
              ) : isSpeaking ? (
                <Volume2 size={34} strokeWidth={1.7} />
              ) : isProcessing ? (
                <Loader2
                  size={34}
                  strokeWidth={1.7}
                  className="animate-spin"
                />
              ) : (
                <Mic size={34} strokeWidth={1.7} />
              )}
            </div>

            <p className="mt-5 text-lg font-semibold text-navy">
              {isListening
                ? "Listening..."
                : isProcessing
                ? "Thinking..."
                : isSpeaking
                ? "PayPartner is speaking..."
                : "Tap to speak"}
            </p>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">
              {isListening
                ? "Tell PayPartner what you want to understand or act on."
                : isProcessing
                ? "PayPartner is processing your request."
                : isSpeaking
                ? "Tap the button below to stop the response."
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
          {(response || error) && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                error
                  ? "border-error/20 bg-error/5"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <Sparkles
                  size={18}
                  className={`mt-0.5 shrink-0 ${
                    error ? "text-error" : "text-primary"
                  }`}
                  strokeWidth={1.8}
                />

                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    {error ? "Voice Assistant" : "PayPartner"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text">
                    {error || response}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mic / Stop Button */}
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={toggleListening}
              disabled={isProcessing && !isSpeaking}
              className={`flex h-16 w-16 items-center justify-center rounded-full transition ${
                isProcessing && !isSpeaking
                  ? "cursor-not-allowed bg-text-secondary/40 text-white"
                  : isListening
                  ? "bg-error text-white hover:bg-error/90"
                  : isSpeaking
                  ? "bg-error text-white hover:bg-error/90"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
              aria-label={
                isListening
                  ? "Stop recording"
                  : isSpeaking
                  ? "Stop speaking"
                  : "Start recording"
              }
            >
              {isListening ? (
                <MicOff size={25} strokeWidth={1.8} />
              ) : isSpeaking ? (
                <Square size={22} strokeWidth={2} />
              ) : (
                <Mic size={25} strokeWidth={1.8} />
              )}
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-text-secondary">
            {isListening
              ? "Tap to stop"
              : isProcessing
              ? "Processing your request..."
              : isSpeaking
              ? "Tap to stop speaking"
              : "Tap the microphone to start"}
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