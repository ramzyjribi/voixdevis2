export type SpeechResultSegment = {
  isFinal: boolean;
  transcript: string;
};

const normalizeWhitespace = (value: string): string =>
  value.replace(/\s+/g, " ").trim();

const comparableWord = (word: string): string =>
  word
    .toLocaleLowerCase("fr-FR")
    .replace(/[.,!?;:()[\]{}"']/g, "");

export const mergeSpeechSegments = (
  currentText: string,
  incomingText: string,
): string => {
  const current = normalizeWhitespace(currentText);
  const incoming = normalizeWhitespace(incomingText);

  if (!current) {
    return incoming;
  }

  if (!incoming) {
    return current;
  }

  const normalizedCurrent = current.toLocaleLowerCase("fr-FR");
  const normalizedIncoming = incoming.toLocaleLowerCase("fr-FR");

  if (normalizedIncoming === normalizedCurrent) {
    return current;
  }

  if (normalizedIncoming.startsWith(`${normalizedCurrent} `)) {
    return incoming;
  }

  if (normalizedCurrent.endsWith(` ${normalizedIncoming}`)) {
    return current;
  }

  const currentWords = current.split(" ");
  const incomingWords = incoming.split(" ");
  const maximumOverlap = Math.min(currentWords.length, incomingWords.length);

  for (let overlap = maximumOverlap; overlap > 0; overlap -= 1) {
    const currentSuffix = currentWords
      .slice(-overlap)
      .map(comparableWord)
      .join(" ");
    const incomingPrefix = incomingWords
      .slice(0, overlap)
      .map(comparableWord)
      .join(" ");

    if (currentSuffix === incomingPrefix) {
      return normalizeWhitespace(
        [...currentWords, ...incomingWords.slice(overlap)].join(" "),
      );
    }
  }

  return `${current} ${incoming}`;
};

export const buildSpeechTranscription = (
  results: readonly SpeechResultSegment[],
): { finalText: string; interimText: string } =>
  results.reduce(
    (transcription, result) => {
      if (result.isFinal) {
        return {
          ...transcription,
          finalText: mergeSpeechSegments(
            transcription.finalText,
            result.transcript,
          ),
        };
      }

      return {
        ...transcription,
        interimText: mergeSpeechSegments(
          transcription.interimText,
          result.transcript,
        ),
      };
    },
    { finalText: "", interimText: "" },
  );
