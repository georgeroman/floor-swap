import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

export const BROKER = new Contract(
  process.env.NEXT_PUBLIC_CHAIN_ID === "1"
    ? "0xd4690a51044db77d91d7aa8f7a3a5ad5da331af0"
    : "0x4022e3982f326455f0905de3dbc4449999baf2dc",
  new Interface([])
);

export const ERC20_PROXY = new Contract(
  process.env.NEXT_PUBLIC_CHAIN_ID === "1"
    ? "0x95e6f48254609a6ee006f7d493c8e5fb97094cef"
    : "0xf1ec7d0ba42f15fb5c9e3adbe86431973e44764c",
  new Interface([])
);

export const EXCHANGE = new Contract(
  process.env.NEXT_PUBLIC_CHAIN_ID === "1"
    ? "0x61935cbdd02287b511119ddb11aeb42f1593b7ef"
    : "0x5d8c9ba74607d2cbc4176882a42d4ace891c1c00",
  new Interface([])
);

export const RANGE_PROPERTY_VALIDATOR = new Contract(
  process.env.NEXT_PUBLIC_CHAIN_ID === "1"
    ? "0xFeDDc963f92752139a33eB8Cf12A8cc591eEEE6b"
    : "0xFeDDc963f92752139a33eB8Cf12A8cc591eEEE6b",
  new Interface([])
);

export const WETH = new Contract(
  process.env.NEXT_PUBLIC_CHAIN_ID === "1"
    ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    : "0x0a180a76e4466bf68a7f86fb029bed3cccfaaac5",
  new Interface(["function approve(address,uint256)"])
);
