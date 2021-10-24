import { JsonRpcProvider } from "@ethersproject/providers";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { normalizeOrder } from "src/0x/exchange";
import { DEV_UTILS } from "src/contracts";
import { activeChainId, getNetworkName } from "src/network";

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const hash = req.query.hash as string;

  try {
    const order = await prisma.zeroExV3Order.findUnique({
      where: { hash },
    });
    if (order) {
      const provider = new JsonRpcProvider(
        `https://eth-${getNetworkName(activeChainId)}.alchemyapi.io/v2/${
          process.env.ALCHEMY_KEY
        }`
      );

      const orderInfo = await DEV_UTILS.connect(
        provider
      ).callStatic.getOrderRelevantState(normalizeOrder(order as any), "0x01");
      if (orderInfo.orserStatus !== 3) {
        await prisma.zeroExV3Order.update({
          where: { hash },
          data: { fillable: false },
        });
      }

      return res.json({ data: { message: "Order checked" } });
    } else {
      return res.status(404).json({ error: { message: "Order not found" } });
    }
  } catch (error) {
    console.error(`Internal error: ${error}`);

    return res.status(500).json({ error: { message: "Internal error" } });
  }
};
