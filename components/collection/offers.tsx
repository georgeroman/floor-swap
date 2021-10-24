import { formatEther } from "@ethersproject/units";
import { useEthers } from "@usedapp/core";
import axios from "axios";
import { useState } from "react";
import useSWR from "swr";

import { Order, normalizeOrder } from "src/0x/exchange";
import { Collection, getSlug } from "src/collections";
import { activeChainId, getNetworkName } from "src/network";
import { fetcher, formatExpiration } from "src/utils";
import { EXCHANGE, TESTNET_COLLECTION } from "src/contracts";

import Modal from "components/Modal";
import Notification from "components/Notification";
import CollectionMakeOffer from "components/collection/make-offer";
import CollectionTakeOffer from "components/collection/take-offer";

type Props = {
  collection: Collection;
};

const CollectionOffers = ({ collection }: Props) => {
  const { account, chainId, library } = useEthers();

  const { data, error, mutate } = useSWR(
    `/api/collections/${getSlug(collection)}/orders`,
    fetcher
  );

  const [openNotification, setOpenNotification] = useState(false);
  const [message, setMessage] = useState("");
  const notify = (message: string) => {
    setMessage(message);
    setOpenNotification(true);
  };

  const [openMakeModal, setOpenMakeModal] = useState(false);

  const [openTakeModal, setOpenTakeModal] = useState(false);
  const [takenOrder, setTakenOrder] = useState<Order | undefined>();

  return (
    <>
      <Notification
        toggled={openNotification}
        setToggled={setOpenNotification}
        message={message!}
      />

      <Modal
        toggled={openMakeModal}
        setToggled={setOpenMakeModal}
        children={
          <CollectionMakeOffer
            collection={collection}
            onSuccess={() => {
              setOpenMakeModal(false);
              notify("Order successfully created");
              mutate();

              // Check all collection orders
              axios
                .post(`/api/collections/${getSlug(collection)}/check`)
                .then(mutate);
            }}
          />
        }
      />

      <Modal
        toggled={openTakeModal}
        setToggled={setOpenTakeModal}
        children={
          <CollectionTakeOffer
            collection={collection}
            order={takenOrder!}
            onSuccess={() => {
              setOpenTakeModal(false);
              notify("Trade executed successfully");

              // Check all collection orders
              axios
                .post(`/api/collections/${getSlug(collection)}/check`)
                .then(mutate);
            }}
          />
        }
      />

      <div className="flex flex-col justify-center">
        {account && (
          <div className="flex flex-col justify-center mb-5">
            {/* For testing purposes */}
            {activeChainId !== 1 && (
              <button
                className="mx-auto mb-2 inline-flex items-center text-sm font-medium hover:text-gray-600"
                onClick={async () => {
                  const signer = library?.getSigner()!;

                  const lowerBound = Number(collection.tokenIdRange[0]);
                  const upperBound = Number(collection.tokenIdRange[1]);
                  await TESTNET_COLLECTION(collection.address)
                    .connect(signer)
                    .mint(
                      Math.floor(
                        Math.random() * (upperBound - lowerBound + 1) +
                          lowerBound
                      )
                    );
                }}
              >
                Mint
              </button>
            )}

            <button
              type="button"
              className="mx-auto inline-flex items-center text-sm font-medium hover:text-gray-600"
              onClick={() => {
                if (!account) {
                  return notify("Connect your wallet");
                }

                if (!library) {
                  return notify("Could not connect to wallet");
                }

                if (chainId?.valueOf() !== activeChainId) {
                  return notify(
                    `Switch network to ${getNetworkName(activeChainId)}`
                  );
                }

                setOpenMakeModal(true);
              }}
            >
              <span>Make floor offer</span>
            </button>
          </div>
        )}

        <div className="flex justify-center">
          {error ? (
            <span className="text-xs">Could not fetch offers</span>
          ) : data ? (
            data.data?.orders?.length ? (
              <div className="flex flex-col">
                <div className="my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="hover:shadow-md overflow-hidden border border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium"
                            >
                              Maker
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium"
                            >
                              Price
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium"
                            >
                              Expiration
                            </th>
                            {account && (
                              <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Take</span>
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.data.orders.map((order: Order) => (
                            <tr key={order.salt}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <code className="text-sm">
                                  {order.makerAddress}
                                </code>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm">
                                  {formatEther(order.makerAssetAmount)} wETH
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm">
                                  {order.expirationTimeSeconds === "0"
                                    ? "never"
                                    : formatExpiration(
                                        order.expirationTimeSeconds
                                      )}
                                </span>
                              </td>
                              {account && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {account.toLowerCase() ===
                                    order.makerAddress.toLowerCase() && (
                                    <button
                                      type="button"
                                      className="mx-auto inline-flex items-center text-sm font-medium hover:text-gray-600"
                                      onClick={async () => {
                                        if (!account) {
                                          return notify("Connect your wallet");
                                        }

                                        if (!library) {
                                          return notify(
                                            "Could not connect to wallet"
                                          );
                                        }

                                        if (
                                          chainId?.valueOf() !== activeChainId
                                        ) {
                                          return notify(
                                            `Switch network to ${getNetworkName(
                                              activeChainId
                                            )}`
                                          );
                                        }

                                        const signer = library?.getSigner();
                                        if (!signer) {
                                          return notify(
                                            "Could not connect to wallet"
                                          );
                                        }

                                        try {
                                          const tx = await EXCHANGE.connect(
                                            signer
                                          ).cancelOrder(
                                            normalizeOrder(order as any)
                                          );
                                          await tx.wait();
                                        } catch (error) {
                                          console.error(error);

                                          return notify(
                                            "Could not cancel order"
                                          );
                                        }

                                        // Check all collection orders
                                        axios
                                          .post(
                                            `/api/collections/${getSlug(
                                              collection
                                            )}/check`
                                          )
                                          .then(mutate);

                                        return notify(
                                          "Order successfully cancelled"
                                        );
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  )}
                                  {account.toLowerCase() !==
                                    order.makerAddress.toLowerCase() && (
                                    <button
                                      type="button"
                                      className="mx-auto inline-flex items-center text-sm font-medium hover:text-gray-600 ml-3"
                                      onClick={() => {
                                        setTakenOrder(order);
                                        setOpenTakeModal(true);
                                      }}
                                    >
                                      Take
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-xs">
                There are no outstanding floor offers
              </span>
            )
          ) : (
            <span className="text-xs">Loading...</span>
          )}
        </div>
      </div>
    </>
  );
};

export default CollectionOffers;
