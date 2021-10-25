import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units";
import { useEthers, useTokenAllowance, useTokenBalance } from "@usedapp/core";
import axios from "axios";
import { useState } from "react";

import { buildRangeOrder } from "@/src/0x/broker";
import { signOrder } from "@/src/0x/exchange";
import { Collection, getSlug } from "@/src/collections";
import { ERC20_PROXY, WETH } from "@/src/contracts";
import { now } from "@/src/utils";

type Props = {
  collection: Collection;
  onSuccess: () => void;
};

const CollectionMakeOffer = ({ collection, onSuccess }: Props) => {
  const { account, library } = useEthers();

  const wethAllowance = useTokenAllowance(
    WETH.address,
    account,
    ERC20_PROXY.address
  );
  const wethBalance = useTokenBalance(WETH.address, account);

  const [price, setPrice] = useState("0");
  const [expiration, setExpiration] = useState("0");
  const [expirationUnit, setExpirationUnit] = useState("hours");

  const [error, setError] = useState("");
  const [step, setStep] = useState("Confirm");

  return (
    <div className="block">
      {error && (
        <div className="mb-2">
          <span className="text-xs text-red-700">Error: {error}</span>
        </div>
      )}

      <span className="text-xs">Price</span>
      <div className="relative flex">
        <div className="flex items-center">
          <span className="text-sm text-gray-600">wETH</span>
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

      <span className="text-xs">Expiration</span>
      <div className="relative flex">
        <div className="flex items-center">
          <select
            className="text-sm text-gray-600 h-full pl-0 pr-7 border-0 border-transparent focus:ring-0 "
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
          className="block w-full border-0 border-transparent focus:ring-0 sm:text-sm pl-0"
          placeholder="0"
          onChange={(event) => setExpiration(event.target.value)}
        />
      </div>

      <div className="mt-2">
        <button
          type="button"
          className="inline-flex items-center font-medium hover:text-gray-700"
          onClick={async () => {
            // Clear any outstanding errors
            setError("");

            const signer = library?.getSigner();
            if (!signer) {
              return setError("Could not connect to wallet");
            }

            let rawPrice: BigNumber;
            try {
              if (price === "") {
                rawPrice = parseEther("0");
              } else {
                rawPrice = parseEther(price);
              }

              if (rawPrice.lte(0)) {
                return setError("Price must be greater than zero");
              }
            } catch (error) {
              console.error(error);

              return setError("Invalid price");
            }

            if (!wethBalance) {
              return setError("Could not retrieve wETH balance");
            }
            if (wethBalance.lt(rawPrice)) {
              return setError("Insufficient wETH balance");
            }

            let rawExpiration: number;
            try {
              if (expiration === "") {
                rawExpiration = Number(0);
              } else {
                rawExpiration = Number(expiration);
              }

              if (expirationUnit === "hours") {
                rawExpiration *= 3600;
              } else if (expirationUnit === "days") {
                rawExpiration *= 3600 * 24;
              } else if (expirationUnit === "weeks") {
                rawExpiration *= 3600 * 24 * 7;
              }

              if (rawExpiration !== 0) {
                rawExpiration = now() + rawExpiration;
              }
            } catch (error) {
              console.error(error);

              return setError("Invalid expiration");
            }

            if (!wethAllowance) {
              return setError("Could not retrieve wETH allowance");
            }
            if (wethAllowance.lt(rawPrice)) {
              try {
                setStep("Waiting for allowance transaction");

                const tx = await WETH.connect(signer).approve(
                  ERC20_PROXY.address,
                  `0x${"f".repeat(64)}`
                );
                await tx.wait();
              } catch (error) {
                console.error(error);

                setStep("Confirm");
                return setError("Could not set wETH allowance");
              }
            }

            const order = buildRangeOrder(
              account!,
              collection.address,
              collection.tokenIdRange,
              rawPrice.toString(),
              rawExpiration.toString()
            );

            try {
              setStep("Waiting for signature");

              order.signature = await signOrder(signer, order);
            } catch (error) {
              console.error(error);

              setStep("Confirm");
              return setError("Could not get signature");
            }

            try {
              setStep("Relaying order");

              await axios.post(
                `/api/collections/${getSlug(collection)}/orders`,
                { order }
              );
            } catch (error) {
              console.error(error);

              setStep("Confirm");
              return setError("Could not relay order to the orderbook");
            }

            onSuccess();
          }}
        >
          <div className="flex flex-row align-middle text-sm">
            {step !== "Confirm" && (
              <div className="h-3 w-3 my-auto mr-2 spinner"></div>
            )}
            <span>{step}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default CollectionMakeOffer;
