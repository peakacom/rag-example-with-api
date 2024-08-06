"use client";
import "@nlux/themes/nova.css";
import {
  AiChat,
  AiChatUI,
  ChatAdapter,
  StreamingAdapterObserver,
} from "@nlux/react";

export default function Chat() {
  const chatAdapter: ChatAdapter = {
    streamText: async (prompt: string, observer: StreamingAdapterObserver) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: prompt }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.status !== 200) {
        observer.error(new Error("Failed to connect to the server"));
        return;
      }

      if (!response.body) {
        return;
      }

      // Read a stream of server-sent events
      // and feed them to the observer as they are being generated
      const reader = response.body.getReader();
      const textDecoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        const content = textDecoder.decode(value);
        if (content) {
          observer.next(content);
        }
      }

      observer.complete();
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-3xl items-center justify-between font-mono text-sm lg:flex">
        <AiChat
          adapter={chatAdapter}
          displayOptions={{
            colorScheme: "dark",
            height: 1200,
          }}
          personaOptions={{
            assistant: {
              name: "Peaka Bot",
              avatar:
                "https://docs.nlkit.com/nlux/images/personas/harry-botter.png",
              tagline: "Making Magic With Peaka",
            },
          }}
          conversationOptions={{
            layout: "bubbles",
            conversationStarters: [
              {
                label: "Crew Dragon's Launches",
                prompt: "Give me information about Crew Dragon's launches.",
              },
              {
                label: "Turksat 5A Launch",
                prompt:
                  "Give me information about Turksat 5A launch done by SpaceX",
              },
              {
                label: "Most Expensive Crash",
                prompt:
                  "What is the most expensive rocket launch crash or accidents during Spacex Flights?",
              },
            ],
          }}
        >
          <AiChatUI.Greeting>
            <span className="rounded">
              <div className="flex flex-col justify-center items-center gap-5">
                <div>Hello! 👋</div>
                <div className="text-pretty w-2/3 text-center">
                  This is a rag pipeline is implemented with Peaka. The data is
                  fetched from SpaceX public API's by using Peaka's Rest Table
                  and uses Peaka's Pinecone connector to search for information
                  in vector database using sql. Then the results are sent to
                  OpenAI to generate the response.
                </div>

                <div className="text-pretty w-2/3 text-center">
                  Try by clicking sample prompts or get to the full code from{" "}
                  <a
                    href="https://github.com/peakacom/rag-example-with-api"
                    target="_blank"
                    className="underline"
                  >
                    Github
                  </a>
                </div>
              </div>
            </span>
          </AiChatUI.Greeting>
        </AiChat>
      </div>
    </main>
  );
}
