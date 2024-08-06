import { VECTOR_LAUNCHES_VECTOR_SEARCH_SQL_TEMPLATE } from "@/config/config";
import { SpacexLaunchInfo } from "@/types/types";
import { connectToPeaka, Peaka, QueryData } from "@peaka/client";

export class PeakaService {
  private connection: Peaka;

  private constructor() {
    this.connection = connectToPeaka(process.env.PEAKA_API_KEY ?? "");
  }

  static #instance: PeakaService;

  public static get instance(): PeakaService {
    if (!PeakaService.#instance) {
      PeakaService.#instance = new PeakaService();
    }

    return PeakaService.#instance;
  }

  public async getAllSpacexLaunches(): Promise<SpacexLaunchInfo[]> {
    const iter = await this.connection.query(
      'SELECT id, name, links_article FROM "spacex"."public"."launches"'
    );

    const launches: SpacexLaunchInfo[] = [];
    const data: QueryData[] = await iter
      .map((r) => r.data ?? [])
      .fold<QueryData[]>([], (row, acc) => [...acc, ...row]);

    for (const queryData of data) {
      const launch: SpacexLaunchInfo = {
        id: queryData[0],
        name: queryData[1],
        links_article: queryData[2],
      };

      launches.push(launch);
    }

    return launches;
  }

  public async vectorSearch(
    vectors: number[],
    topK: number
  ): Promise<QueryData[]> {
    const iter = await this.connection.query(
      VECTOR_LAUNCHES_VECTOR_SEARCH_SQL_TEMPLATE({ vectors, topK })
    );

    const data: QueryData[] = await iter
      .map((r) => r.data ?? [])
      .fold<QueryData[]>([], (row, acc) => [...acc, ...row]);

    return data;
  }
}
