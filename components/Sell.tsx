import Link from "next/link";
import useSWRInfinite from "swr/infinite";

import collections from "../src/collections";
import fetcher from "../src/fetcher";

const Sell = () => {
  const PAGE_SIZE = 20;
  const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite(
    (index) =>
      `https://api.0x.org/sra/v3/orders?page=${index + 1}&perPage=${PAGE_SIZE}`,
    fetcher
  );

  console.log(data);

  const orders = data ? [].concat(...data.map((x) => x.records)) : [];
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

  console.log(orders);

  return (
    <div>
      {orders.map((order) => (
        <li
          key={(order as any).metaData.orderHash}
          className="col-span-1 flex flex-col text-center bg-white rounded-lg border divide-y divide-gray-200 hover:shadow-md"
        >
          <span>{JSON.stringify((order as any).order, null, 2)}</span>
        </li>
      ))}
      <button onClick={() => setSize(size + 1)}>Load more</button>
    </div>
  );
};

export default Sell;
