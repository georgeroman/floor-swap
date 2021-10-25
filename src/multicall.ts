import { Interface } from "@ethersproject/abi";
import { Provider } from "@ethersproject/abstract-provider";

import { MULTICALL } from "@/src/contracts";

type Call = {
  target: string;
  method: string;
  args: any[];
};

const multicall = async (
  provider: Provider,
  callsInterface: Interface,
  calls: Call[]
) => {
  const rawResults = await MULTICALL.connect(provider).callStatic.aggregate(
    calls.map(({ target, method, args }) => {
      return [target, callsInterface.encodeFunctionData(method, args)];
    })
  );

  return (rawResults[1] as string[]).map((rawReturnValue, i) =>
    callsInterface.decodeFunctionResult(calls[i].method, rawReturnValue)
  );
};

export default multicall;
