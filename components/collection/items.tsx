import { useState } from "react";

import {
  Collection,
  getCollectionTokenRange,
  getUserFriendlyTokenId,
} from "../../src/collection";

import Modal from "../Modal";

type Props = {
  collection: Collection;
};

const CollectionItems = ({ collection }: Props) => {
  const [open, setOpen] = useState(false);
  const [tokenId, setTokenId] = useState(collection.tokenIdRange[0]);

  return (
    <>
      <Modal
        open={open}
        setOpen={setOpen}
        children={
          <div>
            <div className="h-96 mx-auto">
              {collection.baseAnimationUrl && (
                <iframe
                  className="h-full w-full object-cover"
                  src={`${collection.baseAnimationUrl}/${tokenId}`}
                />
              )}

              {!collection.baseAnimationUrl && (
                <img
                  className="h-full w-full object-cover"
                  src={`${collection.baseImageUrl}/${tokenId}.png`}
                />
              )}
            </div>

            <div className="flex w-full justify-center mt-5">
              <span className="text-sm font-medium">
                #{getUserFriendlyTokenId(collection, tokenId)}
              </span>
            </div>
          </div>
        }
      />

      <ul
        role="list"
        className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-7"
      >
        {getCollectionTokenRange(collection).map((tokenId) => (
          <li
            key={tokenId}
            className="col-span-1 flex flex-col text-center bg-white rounded-lg border divide-y divide-gray-200 hover:shadow-md"
          >
            <button
              onClick={() => {
                setOpen(true);
                setTokenId(tokenId);
              }}
            >
              <div className="flex-1 flex flex-col p-8">
                <img
                  className="w-36 h-36 flex-shrink-0 mx-auto object-scale-down"
                  src={`${collection.baseImageUrl}/${tokenId}.png`}
                />
                <h3 className="mt-6 text-sm font-medium mx-auto">
                  <span>#{getUserFriendlyTokenId(collection, tokenId)}</span>
                </h3>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default CollectionItems;
