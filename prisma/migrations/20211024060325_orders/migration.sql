-- CreateTable
CREATE TABLE "ZeroExV3Order" (
    "hash" TEXT NOT NULL,
    "makerAddress" TEXT NOT NULL,
    "takerAddress" TEXT NOT NULL,
    "feeRecipientAddress" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "makerAssetAmount" DECIMAL(78,0) NOT NULL,
    "takerAssetAmount" DECIMAL(78,0) NOT NULL,
    "makerFee" DECIMAL(78,0) NOT NULL,
    "takerFee" DECIMAL(78,0) NOT NULL,
    "expirationTimeSeconds" DECIMAL(78,0) NOT NULL,
    "salt" TEXT NOT NULL,
    "makerAssetData" TEXT NOT NULL,
    "takerAssetData" TEXT NOT NULL,
    "makerFeeAssetData" TEXT NOT NULL,
    "takerFeeAssetData" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "fillable" BOOLEAN NOT NULL,

    CONSTRAINT "ZeroExV3Order_pkey" PRIMARY KEY ("hash")
);
