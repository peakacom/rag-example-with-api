import _ from "lodash";

export const SPACEX_CHATBOT_INSTRUCTION =
  _.template(` You are a helpful chatbot which answers questions about given context. Context information is below.
---------------------
<%= context %>
---------------------
Given the context information and not prior knowledge, answer the query.
Query: <%= query %>
Answer: 
`);

export const VECTOR_LAUNCHES_VECTOR_SEARCH_SQL_TEMPLATE = _.template(`
 WITH vector_query AS (
  SELECT CAST(JSON_EXTRACT(metadata, '$.id') AS VARCHAR) AS launch_id,  CAST(JSON_EXTRACT(metadata, '$.text') AS VARCHAR) AS article_content FROM "pinecone"."main"."spacex-launches"
    WHERE  _q_search= 'query_vector(vector=[<%= vectors %>]; topK=<%= topK %>;)'
   )

  SELECT * FROM "vector_query" AS vq, "spacex"."public"."launches" AS l WHERE l.id = vq.launch_id
`);

export const SPACEX_CHATBOT_PARAMS = {
  temperature: 0,
  modelName: "gpt-4o",
  max_tokens: 2000,
};
