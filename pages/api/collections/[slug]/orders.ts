import { AddressZero } from "@ethersproject/constants";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { buildRangeOrder } from "src/0x/broker";
import {
  Order,
  hashOrder,
  normalizeOrder,
  verifyOrderSignature,
} from "src/0x/exchange";
import { getAllCollections } from "src/collections";
import { now } from "src/utils";

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const collection = getAllCollections()[req.query.slug as string];
  if (!collection) {
    return res.status(404).json({ error: { message: "Collection not found" } });
  }

  // This mock order serves two purposes:
  // - easily filtering orders
  // - validating that all incoming orders are properly configured
  const mockOrder = buildRangeOrder(
    AddressZero,
    collection.address,
    collection.tokenIdRange,
    "0",
    "0"
  );

  try {
    if (req.method === "GET") {
      // Get all floor orders for the collection
      const orders = await prisma.zeroExV3Order.findMany({
        where: {
          makerAssetData: mockOrder.makerAssetData,
          takerAssetData: mockOrder.takerAssetData,
          expirationTimeSeconds: {
            gt: now(),
          },
        },
      });

      return res.json({ data: { orders } });
    } else if (req.method === "POST") {
      const order = normalizeOrder(req.body.order as Order);

      // Build an order that is known to be valid
      const validOrder = { ...mockOrder };
      validOrder.makerAddress = order.makerAddress;
      validOrder.makerAssetAmount = order.makerAssetAmount;
      validOrder.expirationTimeSeconds = order.expirationTimeSeconds;
      validOrder.salt = order.salt;

      // Make sure the hashes match
      if (hashOrder(validOrder) !== hashOrder(order)) {
        console.log("order invalid");
        return res.status(422).json({ error: { message: "Invalid order" } });
      }

      // Make sure the signature is valid
      if (!verifyOrderSignature(order, order.signature!)) {
        console.log("signature invalid");
        return res
          .status(422)
          .json({ error: { message: "Invalid signature" } });
      }

      await prisma.zeroExV3Order.create({
        data: {
          hash: hashOrder(order),
          ...order,
          signature: order.signature!,
        },
      });

      return res.json({ data: { order } });
    }
  } catch (error) {
    console.error(`Internal error: ${error}`);

    return res.status(500).json({ error: { message: "Internal error" } });
  }

  return res.status(501).json({ error: { message: "Invalid request method" } });
};
