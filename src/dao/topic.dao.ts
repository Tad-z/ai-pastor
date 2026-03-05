import { Topic } from "../database/models/topic";

export const getDefaultTopics = async () => {
  return await Topic.find({ isDefault: true }).sort({ order: 1 }).exec();
};

export const getTopicBySlug = async (slug: string) => {
  return await Topic.findOne({ slug }).exec();
};
