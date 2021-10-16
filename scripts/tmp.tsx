import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units";
import { useEthers, useTokenAllowance, useTokenBalance } from "@usedapp/core";
import axios from "axios";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import Notification from "../components/Notification";
import { buildRangeOrder } from "../src/0x/broker";
import { signOrder } from "../src/0x/exchange";
import collections from "../src/collection";
import { ERC20_PROXY, WETH } from "../src/contracts";

const BuyPage: NextPage = () => {
  const router = useRouter();
  const slug = router.query.slug as string;
  const collection = collections[slug];

  const { account, chainId, library } = useEthers();
  const tokenAllowance = useTokenAllowance(
    WETH.address,
    account,
    ERC20_PROXY.address
  );
  const tokenBalance = useTokenBalance(WETH.address, account);

  const [price, setPrice] = useState("0");
  const [expiration, setExpiration] = useState("0");
  const [expirationUnit, setExpirationUnit] = useState("hours");

  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const notify = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
  };

  if (!collection) {
    return <h3 className="flex justify-center">Unkown collection</h3>;
  }

  return (
    <>
      <Notification
        message={notificationMessage}
        show={showNotification}
        setShow={setShowNotification}
      />
      <div className="md:m-5 flex flex-col justify-center divide-y space-y-10">
        <div className="grid grid-cols-2 mx-20">
          <div className="flex justify-center pr-5">
            {collection.animationUrl && (
              <iframe
                className="h-64 w-full object-scale-down"
                src={collection.animationUrl}
              />
            )}
            {!collection.animationUrl && (
              <img
                className="h-64 w-full object-scale-down"
                src={collection.imageUrl}
              />
            )}
          </div>

          <div className="flex flex-col justify-center divide-y pl-5">
            <div className="pb-5">
              <a
                className="hover:text-gray-700 text-xl"
                href={collection.externalUrl}
              >
                {collection.name}
              </a>

              {collection.artist && (
                <p className="text-xs">by {collection.artist}</p>
              )}

              <p className="text-sm font-light mt-3">
                {collection.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 mx-40">
          <div className="flex-grow pt-5 pb-2">
            <span className="text-sm">
              Offer to buy any <span className="italic">{collection.name}</span>{" "}
              at a price of
            </span>

            <div className="relative flex">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">wETH</span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                className="block w-full border-0 border-transparent focus:ring-0 sm:text-sm"
                placeholder="0.00"
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>

            <span className="text-sm">expiring in</span>

            <div className="relative flex">
              <div className="flex items-center p-0">
                <select
                  className="h-full pl-0 pr-7 border-0 border-transparent focus:ring-0 text-sm text-gray-700"
                  value={expirationUnit}
                  onChange={(event) => setExpirationUnit(event.target.value)}
                >
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                </select>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                className="block w-full pl-0 border-0 border-transparent focus:ring-0 sm:text-sm"
                placeholder="0"
                onChange={(event) => setExpiration(event.target.value)}
              />
            </div>

            <div className="mt-5">
              <button
                type="button"
                className="inline-flex items-center font-medium hover:text-gray-700"
                onClick={async () => {
                  if (!account) {
                    return notify("Connect your wallet");
                  }
                  if (!library) {
                    return notify("Could not connect to network");
                  }
                  const signer = await library.getSigner();

                  if (chainId?.valueOf() != process.env.NEXT_PUBLIC_CHAIN_ID) {
                    return notify("Switch network to Mainnet");
                  }

                  let handledPrice: BigNumber;
                  try {
                    if (price === "") {
                      handledPrice = parseEther("0");
                    } else {
                      handledPrice = parseEther(price);
                    }

                    if (handledPrice.lte(0)) {
                      throw new Error("Price less than or equal to zero");
                    }
                  } catch {
                    return notify("Invalid price");
                  }

                  if (!tokenBalance) {
                    return notify("Could not retrieve wETH balance");
                  }
                  if (tokenBalance.lt(handledPrice)) {
                    return notify("Insufficient balance");
                  }

                  let handledExpiration: number;
                  try {
                    if (price === "") {
                      handledExpiration = Number(0);
                    } else {
                      handledExpiration = Number(expiration);
                    }

                    if (!Number.isInteger(handledExpiration)) {
                      throw new Error("Expiration not an integer");
                    }

                    if (expirationUnit === "hours") {
                      handledExpiration *= 3600;
                    } else if (expirationUnit === "days") {
                      handledExpiration *= 3600 * 24;
                    } else if (expirationUnit === "weeks") {
                      handledExpiration *= 3600 * 24 * 7;
                    }
                  } catch {
                    return notify("Invalid expiration");
                  }

                  if (!tokenAllowance) {
                    return notify("Could not retrieve wETH allowance");
                  }
                  if (tokenAllowance.lt(handledPrice)) {
                    const result = await WETH.connect(signer)
                      .approve(
                        ERC20_PROXY.address,
                        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                      )
                      .then((tx: TransactionResponse) => tx.wait())
                      .catch(() => null);
                    if (!result) {
                      return notify("Failed to set allowance");
                    }
                  }

                  const order = buildRangeOrder(
                    account,
                    collection.address,
                    collection.tokenIdRange,
                    price,
                    Math.floor(Date.now() / 3600) + handledExpiration
                  );

                  let signature: string;
                  try {
                    signature = await signOrder(signer, order);
                  } catch {
                    return notify("Could not get signature");
                  }

                  const result = await axios.post(
                    "https://api.0x.org/sra/v3/order",
                    {
                      ...order,
                      signature,
                    }
                  );
                }}
              >
                <span className="text-sm">Confirm</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyPage;
