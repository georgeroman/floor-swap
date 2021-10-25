import { defaultAbiCoder } from "@ethersproject/abi";
import { TypedDataSigner } from "@ethersproject/abstract-signer";
import { BigNumberish } from "@ethersproject/bignumber";
import { hexConcat, hexlify, splitSignature } from "@ethersproject/bytes";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { verifyTypedData } from "@ethersproject/wallet";

import { EXCHANGE } from "@/src/contracts";
import { activeChainId } from "@/src/network";

const EIP712_DOMAIN = {
  name: "0x Protocol",
  version: "3.0.0",
  chainId: activeChainId,
  verifyingContract: EXCHANGE.address,
};

const EIP712_TYPES = {
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

export type Order = {
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
  signature?: string;
};

export const signOrder = async (
  signer: TypedDataSigner,
  order: Order
): Promise<string> => {
  const rawSignature = await signer._signTypedData(
    EIP712_DOMAIN,
    EIP712_TYPES,
    order
  );

  return rawSignature;
};

export const hashOrder = (order: Order): string =>
  _TypedDataEncoder.hash(EIP712_DOMAIN, EIP712_TYPES, order);

export const normalizeOrder = (order: Order): Order => {
  return {
    makerAddress: order.makerAddress.toLowerCase(),
    takerAddress: order.takerAddress.toLowerCase(),
    feeRecipientAddress: order.feeRecipientAddress.toLowerCase(),
    senderAddress: order.senderAddress.toLowerCase(),
    makerAssetAmount: order.makerAssetAmount.toString(),
    takerAssetAmount: order.takerAssetAmount.toString(),
    makerFee: order.makerFee.toString(),
    takerFee: order.takerFee.toString(),
    expirationTimeSeconds: order.expirationTimeSeconds.toString(),
    salt: order.salt.toString(),
    makerAssetData: order.makerAssetData.toLowerCase(),
    takerAssetData: order.takerAssetData.toLowerCase(),
    makerFeeAssetData: order.makerFeeAssetData.toLowerCase(),
    takerFeeAssetData: order.takerFeeAssetData.toLowerCase(),
    signature: order.signature?.toLowerCase(),
  };
};

export const prepareOrderSignature = (rawSignature: string) => {
  // Append the signature type (eg. "0x02" for EIP712 signatures)
  // at the end of the signature since this is what 0x expects
  const signature = splitSignature(rawSignature);
  return hexConcat([hexlify(signature.v), signature.r, signature.s, "0x02"]);
};

export const verifyOrderSignature = (order: Order, signature: string) => {
  try {
    const maker = order.makerAddress.toLowerCase();
    const signer = verifyTypedData(
      EIP712_DOMAIN,
      EIP712_TYPES,
      order,
      signature
    );

    return maker.toLowerCase() === signer.toLowerCase();
  } catch {
    return false;
  }
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
