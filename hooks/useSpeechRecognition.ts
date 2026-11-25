"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildSpeechTranscription,
  mergeSpeechSegments,
  type SpeechResultSegment,
} from "./speechTranscript.ts";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = {
  error?: string;
  message?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const resolveSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const browserWindow = window as WindowWithSpeechRecognition;

  return (
    browserWindow.SpeechRecognition ??
    browserWindow.webkitSpeechRecognition ??
    null
  );
};

export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const commitInterimOnEndRef = useRef(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supportCheckId = window.setTimeout(() => {
      setIsSupported(Boolean(resolveSpeechRecognition()));
    }, 0);

    return () => {
      window.clearTimeout(supportCheckId);
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    const recognition = recognitionRef.current;

    recognitionRef.current = null;
    commitInterimOnEndRef.current = false;
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    recognition?.abort();
    setIsListening(false);
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    const Recognition = resolveSpeechRecognition();

    if (!Recognition) {
      setIsSupported(false);
      setError("Micro indisponible sur ce navigateur.");
      return;
    }

    const previousRecognition = recognitionRef.current;

    recognitionRef.current = null;
    commitInterimOnEndRef.current = false;
    previousRecognition?.abort();

    const recognition = new Recognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) {
        return;
      }

      const results: SpeechResultSegment[] = [];

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];

        results.push({
          isFinal: result.isFinal,
          transcript: result[0]?.transcript ?? "",
        });
      }

      const nextTranscript = buildSpeechTranscription(results);

      finalTranscriptRef.current = nextTranscript.finalText;
      interimTranscriptRef.current = nextTranscript.interimText;
      setTranscript(nextTranscript.finalText);
      setInterimTranscript(nextTranscript.interimText);
    };
    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) {
        return;
      }

      setError(
        event.error === "not-allowed"
          ? "Acces micro refuse."
          : event.message || "Dictee interrompue.",
      );
      setIsListening(false);
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) {
        return;
      }

      if (
        commitInterimOnEndRef.current &&
        interimTranscriptRef.current
      ) {
        const committedTranscript = mergeSpeechSegments(
          finalTranscriptRef.current,
          interimTranscriptRef.current,
        );

        finalTranscriptRef.current = committedTranscript;
        setTranscript(committedTranscript);
      }

      recognitionRef.current = null;
      commitInterimOnEndRef.current = false;
      interimTranscriptRef.current = "";
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    commitInterimOnEndRef.current = true;
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    setIsListening(true);

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      commitInterimOnEndRef.current = false;
      setIsListening(false);
      setError("Impossible de demarrer le micro.");
    }
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  };
}
