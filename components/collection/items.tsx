import { useState } from "react";
import LazyLoad from "react-lazyload";

import {
  Collection,
  getTokenIdRange,
  getUserFriendlyTokenId,
} from "src/collections";

import Modal from "components/Modal";

type Props = {
  collection: Collection;
};

const CollectionItems = ({ collection }: Props) => {
  const [openTokenModal, setOpenTokenModal] = useState(false);
  const [tokenId, setTokenId] = useState(collection.tokenIdRange[0]);

  return (
    <>
      <Modal
        toggled={openTokenModal}
        setToggled={setOpenTokenModal}
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
        {getTokenIdRange(collection).map((tokenId) => (
          <li
            key={tokenId}
            className="col-span-1 flex flex-col text-center bg-white rounded-lg border divide-y divide-gray-200 hover:shadow-md"
          >
            <button
              onClick={() => {
                setTokenId(tokenId);
                setOpenTokenModal(true);
              }}
            >
              <div className="flex-1 flex flex-col p-8">
                <LazyLoad height="9rem">
                  <img
                    className="w-36 h-36 flex-shrink-0 mx-auto object-scale-down"
                    src={`${collection.baseImageUrl}/${tokenId}.png`}
                  />
                </LazyLoad>

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
