import {
  GeminiApiError,
  GeminiConfigurationError,
  GeminiModelError,
  requestGeminiToolCalls,
} from "@/ai/geminiClient";
import type { AiRouteError } from "@/ai/types";
import {
  clarificationSchema,
  nonEmptyStringSchema,
  quoteSchema,
} from "@/domain/validation";
import { z } from "zod";

export const runtime = "nodejs";

const aiRequestSchema = z
  .object({
    message: nonEmptyStringSchema,
    quote: quoteSchema,
    clarification: clarificationSchema.optional(),
  })
  .strict();

const jsonError = (error: AiRouteError, status: number): Response =>
  Response.json(error, { status });

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError({ error: "Requete invalide." }, 400);
  }

  const parsedBody = aiRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return jsonError(
      {
        error: "Message ou devis invalide.",
        issues: parsedBody.error.issues.map((issue) => issue.message),
      },
      400,
    );
  }

  try {
    const response = await requestGeminiToolCalls({
      quote: parsedBody.data.quote,
      userMessage: parsedBody.data.message,
      clarification: parsedBody.data.clarification,
    });

    return Response.json(response);
  } catch (error) {
    if (error instanceof GeminiConfigurationError) {
      return jsonError({ error: "Cle Gemini manquante." }, 503);
    }

    if (error instanceof GeminiApiError) {
      console.error("Gemini API request failed", {
        status: error.status,
        model: process.env.GEMINI_MODEL?.trim() || "default",
        message: error.message.slice(0, 600),
      });

      if (error.status === 429) {
        const retryAfterSeconds = error.retryAfterSeconds;
        const retryMessage = retryAfterSeconds
          ? `Quota Gemini atteint. Reessayez dans ${retryAfterSeconds} secondes.`
          : "Quota Gemini atteint. Reessayez plus tard.";

        return Response.json(
          { error: retryMessage },
          {
            status: 429,
            headers: retryAfterSeconds
              ? { "Retry-After": String(retryAfterSeconds) }
              : undefined,
          },
        );
      }

      if (error.status === 401 || error.status === 403) {
        return jsonError({ error: "Cle Gemini invalide ou non autorisee." }, 503);
      }

      if (error.status === 404) {
        return jsonError({ error: "Modele Gemini indisponible." }, 503);
      }

      if (error.status === 400) {
        return jsonError({ error: "Requete Gemini rejetee." }, 502);
      }

      return jsonError({ error: "Gemini temporairement indisponible." }, 502);
    }

    if (error instanceof GeminiModelError) {
      return jsonError({ error: "Gemini n'a pas produit d'action valide." }, 502);
    }

    return jsonError({ error: "Erreur IA temporaire." }, 502);
  }
}
