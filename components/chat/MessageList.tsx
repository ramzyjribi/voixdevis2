"use client";

import type { ChatMessage } from "@/domain/quoteTypes";
import { Bot, UserRound } from "lucide-react";

type MessageListProps = {
  messages: ChatMessage[];
  isProcessing: boolean;
};

const roleStyles: Record<ChatMessage["role"], string> = {
  assistant: "border-zinc-200 bg-white text-zinc-900",
  user: "border-emerald-700 bg-emerald-700 text-white",
  system: "border-zinc-200 bg-zinc-100 text-zinc-800",
};

export function MessageList({ messages, isProcessing }: MessageListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 py-4">
      {messages.length === 0 ? (
        <div className="mt-auto rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm text-zinc-600">
          Nouveau devis pret. Je vous ecoute pour le client ou le premier
          article.
        </div>
      ) : null}

      {messages.map((message) => (
        <article
          key={message.id}
          className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.role !== "user" ? (
            <span className="mt-1 flex size-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
              <Bot className="size-4" />
            </span>
          ) : null}
          <div
            className={`max-w-[82%] rounded-lg border px-3 py-2 text-sm leading-6 ${roleStyles[message.role]}`}
          >
            {message.content}
          </div>
          {message.role === "user" ? (
            <span className="mt-1 flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <UserRound className="size-4" />
            </span>
          ) : null}
        </article>
      ))}

      {isProcessing ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
          Traitement
        </div>
      ) : null}
    </div>
  );
}
