import useSWRInfinite from "swr/infinite";
import { buildRangeOrder } from "../../src/0x/broker";

import { Collection } from "../../src/collection";
import { fetcher } from "../../src/utils";

type Props = {
  collection: Collection;
};

const CollectionOffers = ({ collection }: Props) => {
  const PAGE_SIZE = 20;

  const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite(
    (index) => {
      const mockRangeOrder = buildRangeOrder(
        collection.address,
        collection.address,
        collection.tokenIdRange,
        0,
        0
      );
      const orderSearchParams = new URLSearchParams({
        page: String(index + 1),
        pageSize: String(PAGE_SIZE),
        // maker: "0x8B5E4dB198FfC7f69f8F11F6592f682717dF1D92".toLowerCase(),
        makerAssetData: mockRangeOrder.makerAssetData,
        takerAssetData: mockRangeOrder.takerAssetData,
        // feeRecipientAddress: mockRangeOrder.feeRecipientAddress,
        // takerAddress: mockRangeOrder.takerAddress,
      });
      return `https://api.0x.org/sra/v3/orders?${orderSearchParams.toString()}`;
    },
    fetcher
  );

  const orders = data ? [].concat(...data.map((x) => x.records)) : [];
  console.log(orders);
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);
  const isRefreshing = isValidating && data && data.length === size;

  if (orders.length === 0) {
    return <p>No orders</p>;
  }

  return <div>Offers</div>;
};

export default CollectionOffers;

// const Sell = () => {
//   const PAGE_SIZE = 20;
//   const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite(
//     (index) =>
//       `https://api.0x.org/sra/v3/orders?page=${index + 1}&perPage=${PAGE_SIZE}`,
//     fetcher
//   );

//   console.log(data);

//   const orders = data ? [].concat(...data.map((x) => x.records)) : [];
//   const isLoadingInitialData = !data && !error;
//   const isLoadingMore =
//     isLoadingInitialData ||
//     (size > 0 && data && typeof data[size - 1] === "undefined");
//   const isEmpty = data?.[0]?.length === 0;
//   const isReachingEnd =
//     isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);
//   const isRefreshing = isValidating && data && data.length === size;

//   if (orders.length === 0) {
//     return <p>No orders</p>;
//   }

//   console.log(orders);

//   return (
//     <div>
//       {orders.map((order) => (
//         <li
//           key={(order as any).metaData.orderHash}
//           className="col-span-1 flex flex-col text-center bg-white rounded-lg border divide-y divide-gray-200 hover:shadow-md"
//         >
//           <span>{JSON.stringify((order as any).order, null, 2)}</span>
//         </li>
//       ))}
//       <button onClick={() => setSize(size + 1)}>Load more</button>
//     </div>
//   );
// };

// export default Sell;
