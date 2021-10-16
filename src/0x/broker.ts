import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumberish } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { randomBytes } from "@ethersproject/random";

import { BROKER, EXCHANGE, RANGE_PROPERTY_VALIDATOR, WETH } from "../contracts";
import { bn, now } from "../utils";
import {
  Order,
  encodeErc1155AssetData,
  encodeErc20AssetData,
} from "./exchange";

export const buildRangeOrder = (
  maker: string,
  contract: string,
  tokenIdRange: [BigNumberish, BigNumberish],
  price: BigNumberish,
  expiration: number
) => {
  const order: Order = {
    exchangeAddress: EXCHANGE.address,
    makerAddress: maker,
    takerAddress: AddressZero,
    feeRecipientAddress: AddressZero,
    senderAddress: AddressZero,
    makerAssetAmount: price.toString(),
    takerAssetAmount: "1",
    makerFee: "0",
    takerFee: "0",
    expirationTimeSeconds: (now() + expiration).toString(),
    salt: bn(randomBytes(32)).toString(),
    makerAssetData: encodeErc20AssetData(WETH.address),
    takerAssetData: encodeErc1155AssetData(
      BROKER.address,
      [],
      [1],
      defaultAbiCoder.encode(
        ["address", "address", "bytes"],
        [
          contract,
          RANGE_PROPERTY_VALIDATOR.address,
          defaultAbiCoder.encode(["uint256", "uint256"], tokenIdRange),
        ]
      )
    ),
    makerFeeAssetData: "0x",
    takerFeeAssetData: "0x",
    chainId: 1,
  };

  return order;
};
