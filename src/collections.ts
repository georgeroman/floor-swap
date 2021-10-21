import { activeChainId } from "src/network";
import { bn } from "src/utils";

export type Collection = {
  address: string;
  name: string;
  description: string;
  tokenIdRange: [string, string];
  externalUrl: string;
  baseImageUrl: string;
  artist?: string;
  baseAnimationUrl?: string;
};

export const getAllCollections = () => {
  const collections = require(`../data/${activeChainId}/collections.json`);
  return collections as unknown as { [slug: string]: Collection };
};

export const getSlug = (collection: Collection) =>
  collection.name.toLowerCase().split(" ").join("-");

export const getTokenIdRange = (collection: Collection) => {
  const lowerBound = collection.tokenIdRange[0];
  const upperBound = collection.tokenIdRange[1];

  const tokenRange = [];
  for (let i = bn(lowerBound); i.lte(upperBound); i = i.add(1)) {
    tokenRange.push(i.toString());
  }
  return tokenRange;
};

export const getUserFriendlyTokenId = (
  collection: Collection,
  tokenId: string
) => {
  const lowerBound = collection.tokenIdRange[0];
  return bn(tokenId).sub(bn(lowerBound)).toString();
};
