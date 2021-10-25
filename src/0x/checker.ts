import { JsonRpcProvider } from "@ethersproject/providers";

import { Order, normalizeOrder } from "@/src/0x/exchange";
import { DEV_UTILS } from "@/src/contracts";
import multicall from "@/src/multicall";
import { bn } from "@/src/utils";

export const checkOrders = async (
  provider: JsonRpcProvider,
  orders: Order[]
) => {
  let numOrders = orders.length;
  let numHandledOrders = 0;
  let ordersFillability: boolean[] = [];

  // On-chain read might timeout if we try to read too much data
  // so we need to cap the number of calls we do at once
  const MAX_COUNT = 100;
  while (numOrders > 0) {
    const data = await multicall(
      provider,
      DEV_UTILS.interface,
      [...Array(Math.min(numOrders, MAX_COUNT))]
        .map((_, i) => [
          // Get fillability status
          {
            target: DEV_UTILS.address,
            method: "getOrderRelevantState",
            args: [
              normalizeOrder(orders[ordersFillability.length + i] as any),
              "0x01",
            ],
          },
          // Get maker asset status
          {
            target: DEV_UTILS.address,
            method: "getTransferableAssetAmount",
            args: [
              orders[ordersFillability.length + i].makerAddress,
              orders[ordersFillability.length + i].makerAssetData,
            ],
          },
        ])
        .flat(2)
    );

    for (let i = 0; i < data.length; i += 2) {
      const order = orders[numHandledOrders + i / 2];

      const orderStatus = data[i].orderInfo.orderStatus;
      const transferableAssetAmount = data[i + 1].transferableAssetAmount;

      if (orderStatus !== 3) {
        // In this case, the order was either cancelled or filled
        ordersFillability.push(false);
      } else if (bn(transferableAssetAmount).lt(order.makerAssetAmount)) {
        // In this case, the maker doesn't hold the necessary assets anymore
        ordersFillability.push(false);
      } else {
        // Otherwise, the order is fillable
        ordersFillability.push(true);
      }
    }

    numOrders -= data.length / 2;
    numHandledOrders += data.length / 2;
  }

  return ordersFillability;
};
