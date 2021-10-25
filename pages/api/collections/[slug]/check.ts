import { AddressZero } from "@ethersproject/constants";
import { JsonRpcProvider } from "@ethersproject/providers";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { buildRangeOrder } from "@/src/0x/broker";
import { checkOrders } from "@/src/0x/checker";
import { normalizeOrder } from "@/src/0x/exchange";
import { getAllCollections } from "@/src/collections";
import { activeChainId, getNetworkName } from "@/src/network";
import { now } from "@/src/utils";

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const collection = getAllCollections()[req.query.slug as string];
  if (!collection) {
    return res.status(404).json({ error: { message: "Collection not found" } });
  }

  // This mock order is used to easily filter orders by collection
  const mockOrder = buildRangeOrder(
    AddressZero,
    collection.address,
    collection.tokenIdRange,
    "0",
    "0"
  );

  try {
    if (req.method === "POST") {
      const orders = await prisma.zeroExV3Order.findMany({
        where: {
          makerAssetData: mockOrder.makerAssetData,
          takerAssetData: mockOrder.takerAssetData,
          expirationTimeSeconds: {
            gt: now(),
          },
          fillable: true,
        },
      });

      const provider = new JsonRpcProvider(
        `https://eth-${getNetworkName(activeChainId)}.alchemyapi.io/v2/${
          process.env.ALCHEMY_KEY
        }`
      );

      const ordersFillability = await checkOrders(
        provider,
        orders.map((order) => normalizeOrder(order as any))
      );

      for (let i = 0; i < orders.length; i++) {
        if (!ordersFillability[i]) {
          await prisma.zeroExV3Order.update({
            where: {
              hash: orders[i].hash,
            },
            data: {
              fillable: false,
            },
          });
        }
      }

      return res.json({ data: { message: "Orders checked" } });
    }
  } catch (error) {
    console.error(`Internal error: ${error}`);

    return res.status(500).json({ error: { message: "Internal error" } });
  }

  return res.status(501).json({ error: { message: "Invalid request method" } });
};
