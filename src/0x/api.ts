import axios from "axios";

import { Order, hashOrder } from "src/0x/exchange";
import { EXCHANGE } from "src/contracts";
import { activeChainId } from "src/network";

// Warning: 0x v3 APIs only work on mainnet

export const postOrder = async (order: Order) =>
  axios.post("https://api.0x.org/sra/v3/order", {
    exchangeAddress: EXCHANGE.address,
    chainId: activeChainId,
    ...order,
    signature: order.signature!,
  });

export const getOrder = async (order: Order) =>
  axios.get(`https://api.0x.org/sra/v3/order/${hashOrder(order)}`);
