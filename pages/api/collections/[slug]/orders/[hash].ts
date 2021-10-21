import { JsonRpcProvider } from "@ethersproject/providers";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { DEV_UTILS } from "src/contracts";

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const hash = req.query.hash as string;

  try {
    const order = await prisma.zeroExV3Order.findUnique({
      where: { hash },
    });
    if (order) {
      const provider = new JsonRpcProvider(
        `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`
      );

      console.log(order);
      const orderInfo = await DEV_UTILS.connect(
        provider
      ).callStatic.getOrderRelevantState(
        [
          order.makerAddress,
          order.takerAddress,
          order.feeRecipientAddress,
          order.senderAddress,
          order.makerAssetAmount.toString(),
          order.takerAssetAmount.toString(),
          order.makerFee.toString(),
          order.takerFee.toString(),
          order.expirationTimeSeconds.toString(),
          order.salt,
          order.makerAssetData,
          order.takerAssetData,
          order.makerFeeAssetData,
          order.takerFeeAssetData,
        ],
        "0x01"
      );
      console.log(orderInfo);

      return res.json({ data: { orderInfo } });
    } else {
      return res.status(404).json({ error: { message: "Order not found" } });
    }

    return;
  } catch (error) {
    console.error(`Internal error: ${error}`);

    return res.status(500).json({ error: { message: "Internal error" } });
  }
};
