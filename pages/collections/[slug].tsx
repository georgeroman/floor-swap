import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import { getAllCollections } from "../../src/collection";
import { classNames } from "../../src/utils";

import CollectionItems from "../../components/collection/items";
import CollectionOffers from "../../components/collection/offers";

const CollectionPage: NextPage = () => {
  const router = useRouter();

  const slug = router.query.slug as string;
  const collection = getAllCollections()[slug];

  const [tab, setTab] = useState("items");

  if (!collection) {
    return <h3 className="flex justify-center">Unkown collection</h3>;
  }

  return (
    <div>
      <div className="flex flex-col mx-auto md:w-1/2 text-center">
        <h1 className="text-xl">{collection.name}</h1>

        {collection.artist && (
          <span className="text-xs">by {collection.artist}</span>
        )}

        <span className="mt-4 text-sm font-light">
          {collection.description}
        </span>
      </div>

      <nav className="my-5 flex justify-center space-x-4">
        <button
          className={classNames(
            tab === "items" ? "bg-gray-100" : "text-gray-500 hover:text-black",
            "px-3 py-2 font-medium text-sm rounded-md"
          )}
          onClick={() => setTab("items")}
        >
          Items
        </button>

        <button
          className={classNames(
            tab === "offers" ? "bg-gray-100" : "text-gray-500 hover:text-black",
            "px-3 py-2 font-medium text-sm rounded-md"
          )}
          onClick={() => setTab("offers")}
        >
          Offers
        </button>
      </nav>

      <div>
        {tab === "items" ? (
          <CollectionItems collection={collection} />
        ) : (
          <CollectionOffers collection={collection} />
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
