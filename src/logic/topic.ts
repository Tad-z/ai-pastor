import { response } from "../helpers/utility";
import { Response } from "../interface";
import { getDefaultTopics } from "../dao/topic.dao";
import { getCachedTopics, cacheTopics } from "../services/cache";

export const _getTopics = async (): Promise<Response> => {
  const cached = await getCachedTopics();
  if (cached) return response({ error: false, message: "Topics retrieved", data: cached });

  const topics = await getDefaultTopics();
  await cacheTopics(topics);
  return response({ error: false, message: "Topics retrieved", data: topics });
};
