import { useEthers } from "@usedapp/core";
import axios from "axios";
import { useEffect, useState } from "react";
import LazyLoad from "react-lazyload";

import { hashOrder, Order, prepareOrderSignature } from "src/0x/exchange";
import { Collection, getUserFriendlyTokenId, getSlug } from "src/collections";
import { BROKER, ERC721 } from "src/contracts";
import multicall from "src/multicall";
import { activeChainId } from "src/network";
import { bn } from "src/utils";

type Props = {
  collection: Collection;
  order: Order;
  onSuccess: () => void;
};

const CollectionTakeOrder = ({ collection, order, onSuccess }: Props) => {
  const { account, library } = useEthers();

  const [tokenList, setTokenList] = useState<string[]>([]);
  const [tokenListInitialized, setTokenListInitialized] = useState(false);

  const [error, setError] = useState("");
  const [step, setStep] = useState("Select token");

  useEffect(() => {
    const doAsyncWork = async () => {
      const signer = library?.getSigner()!;
      const contract = ERC721(collection.address);

      let tokenIds: string[] = [];

      let balance = (
        await contract.connect(signer.provider).balanceOf(account)
      ).toNumber();

      // On-chain read might timeout if we try to read too much data
      // so we need to cap the number of calls we do at once
      const MAX_COUNT = 100;
      while (balance > 0) {
        const data = await multicall(
          signer.provider,
          contract.interface,
          // We assume all collections are ERC721 enumerable
          [...Array(Math.min(balance, MAX_COUNT))].map((_, i) => ({
            target: contract.address,
            method: "tokenOfOwnerByIndex",
            args: [account, tokenIds.length + i],
          }))
        );

        tokenIds = [...tokenIds, ...data.map((tokenId) => tokenId.toString())];
        balance -= MAX_COUNT;
      }

      // Sort the tokens by their ids
      tokenIds.sort((a, b) => (bn(a).lte(bn(b)) ? -1 : 1));

      setTokenList(tokenIds);
      setTokenListInitialized(true);
    };

    doAsyncWork();
  }, []);

  return (
    <div className="block max-h-full">
      {!tokenListInitialized && <span>Loading...</span>}

      {tokenListInitialized && tokenList.length === 0 && (
        <span>You have no tokens available for selling</span>
      )}

      {tokenListInitialized && tokenList.length > 0 && (
        <>
          {error && (
            <div className="mb-2">
              <span className="text-xs text-red-700">Error: {error}</span>
            </div>
          )}

          <div className="flex flex-row align-middle text-sm">
            {step !== "Select token" && (
              <div className="h-3 w-3 my-auto mr-2 spinner"></div>
            )}
            <span>{step}</span>
          </div>

          <ul
            role="list"
            className="grid grid-cols-2 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-7 overflow-auto"
            style={{ maxHeight: "70vh" }}
          >
            {tokenList.map((tokenId) => (
              <li
                key={tokenId}
                className="col-span-1 flex flex-col text-center bg-white rounded-lg border divide-y divide-gray-200 hover:shadow-md"
              >
                <button
                  onClick={async () => {
                    // Clear any outstanding errors
                    setError("");

                    const signer = library?.getSigner();
                    if (!signer) {
                      return setError("Could not connect to wallet");
                    }

                    const contract = ERC721(collection.address);

                    let isApproved: boolean;
                    try {
                      isApproved = await contract
                        .connect(signer)
                        .isApprovedForAll(account, BROKER.address);
                    } catch (error) {
                      console.error(error);

                      return setError(
                        "Could not retrieve collection allowance"
                      );
                    }

                    if (!isApproved) {
                      try {
                        setStep("Waiting for allowance transaction");

                        const tx = await contract
                          .connect(signer)
                          .setApprovalForAll(BROKER.address, true);
                        await tx.wait();
                      } catch (error) {
                        console.error(error);

                        setStep("Select token");
                        return setError("Could not set collection allowance");
                      }
                    }

                    try {
                      setStep("Waiting for fill transaction");

                      const tx = BROKER.connect(signer).brokerTrade(
                        [tokenId],
                        [
                          order.makerAddress,
                          order.takerAddress,
                          order.feeRecipientAddress,
                          order.senderAddress,
                          order.makerAssetAmount,
                          order.takerAssetAmount,
                          order.makerFee,
                          order.takerFee,
                          order.expirationTimeSeconds,
                          order.salt,
                          order.makerAssetData,
                          order.takerAssetData,
                          order.makerFeeAssetData,
                          order.takerFeeAssetData,
                        ],
                        order.takerAssetAmount,
                        prepareOrderSignature(order.signature!),
                        "0x9b44d556",
                        [],
                        [],
                        // Mainnet fees are set to 0, Rinkeby fees are still on
                        activeChainId !== 1
                          ? { value: "1000000000000000" }
                          : undefined
                      );
                      await tx.wait();
                    } catch (error) {
                      console.error(error);

                      setStep("Select token");
                      return setError("Could not execute trade");
                    }

                    try {
                      setStep("Bookkeeping");

                      await axios.post(
                        `/api/collections/${getSlug(
                          collection
                        )}/orders/${hashOrder(order)}`
                      );
                    } catch (error) {
                      console.error(error);

                      setStep("Confirm");
                      return setError("Could not relay order to the orderbook");
                    }

                    onSuccess();
                  }}
                >
                  <div className="flex-1 flex flex-col p-4">
                    <LazyLoad height="9rem">
                      <img
                        className="w-24 h-24 flex-shrink-0 mx-auto object-scale-down"
                        src={`${collection.baseImageUrl}/${tokenId}.png`}
                      />
                    </LazyLoad>

                    <h3 className="mt-4 text-sm font-medium mx-auto">
                      <span>
                        #{getUserFriendlyTokenId(collection, tokenId)}
                      </span>
                    </h3>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default CollectionTakeOrder;
