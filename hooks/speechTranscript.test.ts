import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSpeechTranscription,
  mergeSpeechSegments,
} from "./speechTranscript.ts";

test("mergeSpeechSegments collapses cumulative mobile transcripts", () => {
  const transcript = [
    "un",
    "un devis",
    "un devis a",
    "un devis a Monsieur",
    "un devis a monsieur dupont",
  ].reduce(mergeSpeechSegments, "");

  assert.equal(transcript, "un devis a monsieur dupont");
});

test("mergeSpeechSegments keeps distinct chunks and removes overlap", () => {
  assert.equal(
    mergeSpeechSegments("un devis a", "a Monsieur Dupont"),
    "un devis a Monsieur Dupont",
  );
  assert.equal(
    mergeSpeechSegments("remplacement du mitigeur", "du mitigeur cuisine"),
    "remplacement du mitigeur cuisine",
  );
});

test("buildSpeechTranscription separates final and interim results without duplicates", () => {
  const transcription = buildSpeechTranscription([
    { isFinal: true, transcript: "un" },
    { isFinal: true, transcript: "un devis" },
    { isFinal: false, transcript: "un devis a Monsieur Dupont" },
  ]);

  assert.deepEqual(transcription, {
    finalText: "un devis",
    interimText: "un devis a Monsieur Dupont",
  });
  assert.equal(
    mergeSpeechSegments(
      transcription.finalText,
      transcription.interimText,
    ),
    "un devis a Monsieur Dupont",
  );
});
