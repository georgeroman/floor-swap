import type { NextPage } from "next";
import Link from "next/link";

import { getAllCollections } from "../src/collection";

const IndexPage: NextPage = () => {
  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {Object.entries(getAllCollections()).map(([slug, collection]) => (
        <li
          key={collection.name}
          className="col-span-1 flex flex-col text-center bg-white rounded-lg border divide-y divide-gray-700 hover:shadow-md"
        >
          <Link href={`/collections/${slug}`} passHref>
            <a>
              <div className="flex-1 flex flex-col p-8">
                <img
                  className="w-36 h-36 mx-auto object-scale-down"
                  src={`${collection.baseImageUrl}/${collection.tokenIdRange[0]}.png`}
                />

                <h3 className="mt-6 mx-auto text-sm font-medium">
                  <a
                    className="hover:text-gray-600"
                    href={collection.externalUrl}
                  >
                    {collection.name}
                  </a>
                </h3>

                {collection.artist && (
                  <p className="text-xs">by {collection.artist}</p>
                )}
              </div>
            </a>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default IndexPage;
