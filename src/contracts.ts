import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

import { activeChainId } from "src/network";

export const BROKER = new Contract(
  activeChainId === 1
    ? "0xd4690a51044db77d91d7aa8f7a3a5ad5da331af0"
    : "0x0dd2d6cabbd8ae7d2fe6840fa597a44b1a7e4747",
  new Interface([
    `
      function brokerTrade(
        uint256[] brokeredTokenIds,
        (
          address makerAddress,
          address takerAddress,
          address feeRecipientAddress,
          address senderAddress,
          uint256 makerAssetAmount,
          uint256 takerAssetAmount,
          uint256 makerFee,
          uint256 takerFee,
          uint256 expirationTimeSeconds,
          uint256 salt,
          bytes makerAssetData,
          bytes takerAssetData,
          bytes makerFeeAssetData,
          bytes takerFeeAssetData
        ) order,
        uint256 takerAssetFillAmount,
        bytes signature,
        bytes4 fillFunctionSelector,
        uint256[] ethFeeAmounts,
        address[] feeRecipients
      ) payable
    `,
  ])
);

export const DEV_UTILS = new Contract(
  activeChainId === 1
    ? "0x74134cf88b21383713e096a5ecf59e297dc7f547"
    : "0x46b5bc959e8a754c0256fff73bf34a52ad5cdfa9",
  new Interface([
    `
      function getOrderRelevantState(
        (
          address makerAddress,
          address takerAddress,
          address feeRecipientAddress,
          address senderAddress,
          uint256 makerAssetAmount,
          uint256 takerAssetAmount,
          uint256 makerFee,
          uint256 takerFee,
          uint256 expirationTimeSeconds,
          uint256 salt,
          bytes makerAssetData,
          bytes takerAssetData,
          bytes makerFeeAssetData,
          bytes takerFeeAssetData
        ) order,
        bytes signature
      ) returns (
        (uint8 orderStatus, bytes32 orderHash, uint256 orderTakerAssetFilledAmount) orderInfo,
        uint256 fillableTakerAssetAmount,
        bool isValidSignature
      )
    `,
    `
      function getTransferableAssetAmount(
        address ownerAddress,
        bytes assetData
      ) returns (uint256 transferableAssetAmount)
    `,
  ])
);

export const ERC20_PROXY = new Contract(
  activeChainId === 1
    ? "0x95e6f48254609a6ee006f7d493c8e5fb97094cef"
    : "0x070efeb7e5ffa3d1a59d03a219539551ae60ba43",
  new Interface([])
);

export const EXCHANGE = new Contract(
  activeChainId === 1
    ? "0x61935cbdd02287b511119ddb11aeb42f1593b7ef"
    : "0xf8becacec90bfc361c0a2c720839e08405a72f6d",
  new Interface([
    `
      function cancelOrder(
        (
          address makerAddress,
          address takerAddress,
          address feeRecipientAddress,
          address senderAddress,
          uint256 makerAssetAmount,
          uint256 takerAssetAmount,
          uint256 makerFee,
          uint256 takerFee,
          uint256 expirationTimeSeconds,
          uint256 salt,
          bytes makerAssetData,
          bytes takerAssetData,
          bytes makerFeeAssetData,
          bytes takerFeeAssetData
        ) order,
      )
    `,
  ])
);

export const MULTICALL = new Contract(
  activeChainId === 1
    ? "0xeefba1e63905ef1d7acba5a8513c70307c1ce441"
    : "0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821",
  new Interface([
    "function aggregate((address, bytes)[]) returns (uint256 blockNumber, bytes[] returnData)",
  ])
);

export const RANGE_PROPERTY_VALIDATOR = new Contract(
  activeChainId === 1
    ? "0x1F9cEfbd982de43bE11F24c671E0504b31e36414"
    : "0x4c0d3aFcA131bC9723E91f08C898ceaAf98953a0",
  new Interface([])
);

export const WETH = new Contract(
  activeChainId === 1
    ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    : "0xc778417e063141139fce010982780140aa0cd5ab",
  new Interface(["function approve(address spender, uint256 amount)"])
);

export const ERC721 = (address: string) =>
  new Contract(
    address,
    new Interface([
      "function balanceOf(address owner) view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
      "function isApprovedForAll(address owner, address operator) view returns (bool)",
      "function setApprovalForAll(address operator, bool isApproved)",
    ])
  );

export const TESTNET_COLLECTION = (address: string) =>
  new Contract(address, new Interface(["function mint(uint256 tokenId)"]));
