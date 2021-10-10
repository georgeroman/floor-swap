import { DAppProvider } from "@usedapp/core";
import type { AppProps } from "next/app";
import Head from "next/head";

import Heading from "../components/Heading";

import "../styles/globals.css";

const AppWrapper = ({ Component, pageProps }: AppProps) => {
  return (
    <DAppProvider config={{}}>
      <Head>
        <title>Floor Swap</title>
        <meta name="description" content="NFT floor orders powered by 0x" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Heading />

      <Component {...pageProps} />
    </DAppProvider>
  );
};

export default AppWrapper;
