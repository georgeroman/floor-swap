import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

export const BROKER = new Contract(
  "0xd4690a51044db77d91d7aa8f7a3a5ad5da331af0",
  new Interface([])
);

export const ERC20_PROXY = new Contract(
  "0x95e6f48254609a6ee006f7d493c8e5fb97094cef",
  new Interface([])
);

export const EXCHANGE = new Contract(
  "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
  new Interface([])
);

export const RANGE_PROPERTY_VALIDATOR = new Contract(
  "0x1F9cEfbd982de43bE11F24c671E0504b31e36414",
  new Interface([])
);

export const WETH = new Contract(
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  new Interface(["function approve(address,uint256)"])
);
