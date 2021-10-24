import { JsonRpcProvider } from "@ethersproject/providers";
import { PrismaClient } from "@prisma/client";

import { normalizeOrder } from "src/0x/exchange";
import { DEV_UTILS } from "src/contracts";
import { activeChainId, getNetworkName } from "src/network";
import multicall from "src/multicall";
import { bn } from "src/utils";

const prisma = new PrismaClient();

// TODO: Add generic checking via an abstract provider and a passed list of orders
const checkOrders = async (orderFilter: any) => {
  try {
    const provider = new JsonRpcProvider(
      `https://eth-${getNetworkName(activeChainId)}.alchemyapi.io/v2/${
        process.env.ALCHEMY_KEY
      }`
    );

    const orders = await prisma.zeroExV3Order.findMany({
      where: orderFilter,
    });

    let numOrders = orders.length;
    let numCheckedOrders = 0;

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
                normalizeOrder(orders[numCheckedOrders + i] as any),
                "0x01",
              ],
            },
            // Get maker asset status
            {
              target: DEV_UTILS.address,
              method: "getTransferableAssetAmount",
              args: [
                orders[numCheckedOrders + i].makerAddress,
                orders[numCheckedOrders + i].makerAssetData,
              ],
            },
          ])
          .flat(2)
      );

      for (let i = 0; i < data.length; i += 2) {
        const order = orders[numCheckedOrders + i / 2];

        let fillable = true;
        if (data[i].orderInfo.orderStatus !== 3) {
          // In this case, the order was either cancelled or filled
          fillable = false;
        } else if (
          bn(data[i + 1].transferableAssetAmount).lt(
            order.makerAssetAmount.toString()
          )
        ) {
          // In this case, the maker doesn't have the necessary assets
          fillable = false;
        }

        if (!fillable) {
          await prisma.zeroExV3Order.update({
            where: {
              hash: order.hash,
            },
            data: {
              fillable: false,
            },
          });
        }
      }

      numOrders -= data.length;
      numCheckedOrders += data.length;
    }
  } catch (error) {
    console.error(`Internal error: ${error}`);
  }
};

export default checkOrders;
