export type Collection = {
  slug: string;
  address: string;
  name: string;
  description: string;
  imageUrl: string;
  tokenIdRange: [string, string];
  animationUrl?: string;
  externalUrl?: string;
  artist?: string;
};
