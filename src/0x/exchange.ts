import { defaultAbiCoder } from "@ethersproject/abi";
import { TypedDataSigner } from "@ethersproject/abstract-signer";
import { BigNumberish } from "@ethersproject/bignumber";
import { hexConcat, hexlify, splitSignature } from "@ethersproject/bytes";

import { EXCHANGE } from "../contracts";

export type Order = {
  exchangeAddress: string;
  makerAddress: string;
  takerAddress: string;
  feeRecipientAddress: string;
  senderAddress: string;
  makerAssetAmount: string;
  takerAssetAmount: string;
  makerFee: string;
  takerFee: string;
  expirationTimeSeconds: string;
  salt: string;
  makerAssetData: string;
  takerAssetData: string;
  makerFeeAssetData: string;
  takerFeeAssetData: string;
  chainId: number;
};

export const signOrder = async (
  signer: TypedDataSigner,
  order: Order
): Promise<string> => {
  const domain = {
    name: "0x Protocol",
    version: "3.0.0",
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
    verifyingContract: EXCHANGE.address,
  };

  const types = {
    Order: [
      { name: "makerAddress", type: "address" },
      { name: "takerAddress", type: "address" },
      { name: "feeRecipientAddress", type: "address" },
      { name: "senderAddress", type: "address" },
      { name: "makerAssetAmount", type: "uint256" },
      { name: "takerAssetAmount", type: "uint256" },
      { name: "makerFee", type: "uint256" },
      { name: "takerFee", type: "uint256" },
      { name: "expirationTimeSeconds", type: "uint256" },
      { name: "salt", type: "uint256" },
      { name: "makerAssetData", type: "bytes" },
      { name: "takerAssetData", type: "bytes" },
      { name: "makerFeeAssetData", type: "bytes" },
      { name: "takerFeeAssetData", type: "bytes" },
    ],
  };

  const rawSignature = await signer._signTypedData(domain, types, order);
  const signature = splitSignature(rawSignature);
  return hexConcat([hexlify(signature.v), signature.r, signature.s, "0x02"]);
};

export const encodeErc1155AssetData = (
  tokenAddress: string,
  tokenIds: BigNumberish[],
  values: BigNumberish[],
  callbackData: string
) =>
  hexConcat([
    "0xa7cb5fb7",
    defaultAbiCoder.encode(
      ["address", "uint256[]", "uint256[]", "bytes"],
      [tokenAddress, tokenIds, values, callbackData]
    ),
  ]);

export const encodeErc20AssetData = (tokenAddress: string) =>
  hexConcat([
    "0xf47261b0",
    defaultAbiCoder.encode(["address"], [tokenAddress]),
  ]);

export const encodeErc721AssetData = (
  tokenAddress: string,
  tokenId: BigNumberish
) =>
  hexConcat([
    "0x02571792",
    defaultAbiCoder.encode(["address", "uint256"], [tokenAddress, tokenId]),
  ]);
