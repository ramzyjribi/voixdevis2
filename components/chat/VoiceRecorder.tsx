"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mic, MicOff } from "lucide-react";

type VoiceRecorderProps = {
  isSupported: boolean;
  isListening: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
};

export function VoiceRecorder({
  isSupported,
  isListening,
  error,
  onStart,
  onStop,
}: VoiceRecorderProps) {
  const label = isListening ? "Arreter la dictee" : "Demarrer la dictee";

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-lg"
              variant={isListening ? "secondary" : "outline"}
              aria-label={label}
              disabled={!isSupported}
              onClick={isListening ? onStop : onStart}
            >
              {isListening ? <MicOff /> : <Mic />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isSupported ? label : "Micro indisponible"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
