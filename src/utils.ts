import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export const bn = (value: BigNumberish) => BigNumber.from(value);

export const now = () => Math.floor(Date.now() / 1000);

export const fetcher = (url: string) =>
  fetch(url).then((response) => response.json());

export const classNames = (...classes: string[]) =>
  classes.filter(Boolean).join(" ");
