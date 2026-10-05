import { getCollection, type CollectionEntry } from 'astro:content';

// Post jest widoczny, gdy ma published: true i jego data już minęła.
// Posty z przyszłą datą czekają na codzienny rebuild (.github/workflows/deploy.yml, schedule).
// W `astro dev` widać też zaplanowane — do podglądu przed publikacją.
export const isPostLive = ({ data }: CollectionEntry<'posts'>) =>
  data.published && (import.meta.env.DEV || data.date <= new Date());

export const getLivePosts = () => getCollection('posts', isPostLive);
