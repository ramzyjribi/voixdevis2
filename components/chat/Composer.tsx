"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResetQuoteDialog } from "@/components/quote/ResetQuoteDialog";
import { useAiConversation } from "@/hooks/useAiConversation";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { mergeSpeechSegments } from "@/hooks/speechTranscript";
import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { VoiceRecorder } from "./VoiceRecorder";

const mergeDictation = (current: string, dictatedText: string): string => {
  const trimmedCurrent = current.trimEnd();
  const trimmedDictation = dictatedText.trim();

  if (!trimmedDictation) {
    return current;
  }

  return trimmedCurrent
    ? `${trimmedCurrent} ${trimmedDictation}`
    : trimmedDictation;
};

export function Composer() {
  const [text, setText] = useState("");
  const dictationBaseRef = useRef("");
  const {
    isSending,
    isResetConfirmationOpen,
    sendMessage,
    confirmReset,
    cancelReset,
  } = useAiConversation();
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  } = useSpeechRecognition();

  useEffect(() => {
    const dictatedText = mergeSpeechSegments(transcript, interimTranscript);

    if (dictatedText || isListening) {
      setText(mergeDictation(dictationBaseRef.current, dictatedText));
    }
  }, [interimTranscript, isListening, transcript]);

  const handleStart = () => {
    dictationBaseRef.current = text;
    start();
  };

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = event.target.value;

    if (isListening) {
      reset();
    }

    dictationBaseRef.current = nextText;
    setText(nextText);
  };

  const submitMessage = () => {
    const content = text.trim();

    if (!content || isSending) {
      return;
    }

    stop();
    reset();
    dictationBaseRef.current = "";
    setText("");
    void sendMessage(content);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <>
      <form className="border-t bg-white p-3" onSubmit={handleSubmit}>
        <div className="flex items-end gap-2">
          <VoiceRecorder
            isSupported={isSupported}
            isListening={isListening}
            error={error}
            onStart={handleStart}
            onStop={stop}
          />
          <Textarea
            aria-label="Message"
            className="max-h-36 min-h-11 resize-none"
            placeholder="Dicter ou ecrire le chantier"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            size="icon-lg"
            aria-label="Envoyer"
            disabled={!text.trim() || isSending}
          >
            <SendHorizontal />
          </Button>
        </div>
      </form>
      <ResetQuoteDialog
        open={isResetConfirmationOpen}
        onConfirm={confirmReset}
        onCancel={cancelReset}
      />
    </>
  );
}
