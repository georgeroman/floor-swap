import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en);

// Time

export const formatExpiration = (expirationInSeconds: number | string) =>
  new TimeAgo("en-US").format(Number(expirationInSeconds) * 1000);

export const now = () => Math.floor(Date.now() / 1000);

// BigNumber

export const bn = (value: BigNumberish) => BigNumber.from(value);

// Network

export const fetcher = (url: string) =>
  fetch(url).then((response) => response.json());

// Helpers

export const join = (...values: string[]) => values.filter(Boolean).join(" ");
