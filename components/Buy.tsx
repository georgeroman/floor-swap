import Link from "next/link";

import collections from "../src/collections";

const Buy = () => {
  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {Object.entries(collections).map(([slug, collection]) => (
        <li
          key={collection.address}
          className="col-span-1 flex flex-col text-center bg-white rounded-lg border divide-y divide-gray-200 hover:shadow-md"
        >
          <Link href={`/collections/${slug}/buy`} scroll={false} passHref>
            <a>
              <div className="flex-1 flex flex-col p-8">
                <img
                  className="w-36 h-36 flex-shrink-0 mx-auto object-scale-down"
                  src={collection.imageUrl}
                  alt=""
                />
                <h3 className="mt-6 text-sm font-medium mx-auto">
                  {collection.externalUrl ? (
                    <a
                      className="hover:text-gray-700"
                      href={collection.externalUrl}
                    >
                      {collection.name}
                    </a>
                  ) : (
                    <span>{collection.name}</span>
                  )}
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

export default Buy;
