export const dynamic = "force-dynamic";
import { SPACEX_CHATBOT_INSTRUCTION } from "@/config/config";
import { PeakaService } from "@/service/peaka.service";
import { openai } from "@ai-sdk/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { streamText } from "ai";

export async function POST(req: Request) {
  const request = await req.json();

  if (!request.prompt) return new Response("Missing query", { status: 400 });

  const prompt = request.prompt;
  const peakaService = PeakaService.instance;
  const embeddings = new OpenAIEmbeddings();
  const vectors = await embeddings.embedQuery(request.prompt);

  const launches = await peakaService.vectorSearch(vectors, 10);

  const result = await streamText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: SPACEX_CHATBOT_INSTRUCTION({
          context: JSON.stringify(launches),
          query: prompt,
        }),
      },
    ],
  });

  return result.toTextStreamResponse();
}
