export const dynamic = "force-dynamic";
import { PeakaService } from "@/service/peaka.service";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { compile } from "html-to-text";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function GET() {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const pineconeIndex = pc.index(process.env.PINECONE_INDEX!);
  await pineconeIndex.deleteAll();

  const peakaService = PeakaService.instance;

  const launches = await peakaService.getAllSpacexLaunches();

  const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;
  const splitter = new RecursiveCharacterTextSplitter({});

  const docs: Document[] = [];
  for (const launch of launches) {
    const url = launch.links_article;

    if (url) {
      const loader = new RecursiveUrlLoader(url, {
        extractor: compiledConvert,
        maxDepth: 0,
      });

      const urlDocs = await loader.load();
      if (urlDocs.length === 0) continue;

      const output = await splitter.createDocuments([urlDocs[0].pageContent]);

      for (const text of output) {
        docs.push(
          new Document({
            metadata: {
              id: launch.id,
              name: launch.name,
              link: launch.links_article,
            },
            pageContent: text.pageContent,
          })
        );
      }
    }
  }

  await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
    pineconeIndex,
    maxConcurrency: 5,
  });

  return NextResponse.json({ success: true });
}
