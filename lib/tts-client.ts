/**
 * Text-to-speech via ElevenLabs. Requires ELEVENLABS_API_KEY.
 * Free tier is ~10,000 characters/month — plenty for demos, so text is
 * capped defensively to keep a single request from burning the whole quota.
 */

const ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-speech";
// "Rachel" — a default, natural-sounding ElevenLabs voice. Override via env if desired.
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

const MAX_CHARS = 2500;

export async function textToSpeech(text: string, voiceId: string = DEFAULT_VOICE_ID): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  const clipped = text.slice(0, MAX_CHARS);

  const res = await fetch(`${ELEVENLABS_URL}/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: clipped,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ElevenLabs error ${res.status}: ${body.slice(0, 300)}`);
  }

  return res.arrayBuffer();
}
