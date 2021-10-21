import { defaultAbiCoder } from "@ethersproject/abi";
import { AddressZero } from "@ethersproject/constants";
import { randomBytes } from "@ethersproject/random";

import {
  Order,
  encodeErc1155AssetData,
  encodeErc20AssetData,
} from "src/0x/exchange";
import { BROKER, RANGE_PROPERTY_VALIDATOR, WETH } from "src/contracts";
import { bn } from "src/utils";

export const buildRangeOrder = (
  maker: string,
  contract: string,
  tokenIdRange: [string, string],
  price: string,
  expiration: string
) => {
  const order: Order = {
    makerAddress: maker,
    takerAddress: AddressZero,
    feeRecipientAddress: AddressZero,
    senderAddress: BROKER.address,
    makerAssetAmount: price.toString(),
    takerAssetAmount: "1",
    makerFee: "0",
    takerFee: "0",
    expirationTimeSeconds: expiration.toString(),
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
  };

  return order;
};
