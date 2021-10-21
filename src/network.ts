export const activeChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

export const getNetworkName = (chainId: number) => {
  switch (chainId) {
    case 1:
      return "mainnet";

    case 3:
      return "rinkeby";

    case 4:
      return "unsupported";
  }
};
