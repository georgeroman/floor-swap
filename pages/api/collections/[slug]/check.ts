import { AddressZero } from "@ethersproject/constants";
import type { NextApiRequest, NextApiResponse } from "next";

import { buildRangeOrder } from "src/0x/broker";
import checkOrders from "src/0x/checker";
import { getAllCollections } from "src/collections";
import { now } from "src/utils";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const collection = getAllCollections()[req.query.slug as string];
  if (!collection) {
    return res.status(404).json({ error: { message: "Collection not found" } });
  }

  // This mock order is used to easily filter orders
  const mockOrder = buildRangeOrder(
    AddressZero,
    collection.address,
    collection.tokenIdRange,
    "0",
    "0"
  );

  try {
    if (req.method === "POST") {
      await checkOrders({
        makerAssetData: mockOrder.makerAssetData,
        takerAssetData: mockOrder.takerAssetData,
        expirationTimeSeconds: {
          gt: now(),
        },
        fillable: true,
      });

      return res.json({ data: { message: "Orders checked" } });
    }
  } catch (error) {
    console.error(`Internal error: ${error}`);

    return res.status(500).json({ error: { message: "Internal error" } });
  }

  return res.status(501).json({ error: { message: "Invalid request method" } });
};
