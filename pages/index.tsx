import type { NextPage } from "next";
import { useState } from "react";

import Buy from "../components/Buy";
import Sell from "../components/Sell";
import { classNames } from "../src/css";

const IndexPage: NextPage = () => {
  const [currentTab, setCurrentTab] = useState<string>("buy");

  return (
    <div className="md:m-5 flex flex-col justify-center">
      <nav className="mb-5 flex justify-center space-x-4">
        <a
          href="#"
          className={classNames(
            currentTab === "buy"
              ? "bg-gray-100"
              : "text-gray-500 hover:text-black",
            "px-3 py-2 font-medium text-sm rounded-md"
          )}
          onClick={() => setCurrentTab("buy")}
        >
          Buy
        </a>

        <a
          href="#"
          className={classNames(
            currentTab === "sell"
              ? "bg-gray-100"
              : "text-gray-500 hover:text-black",
            "px-3 py-2 font-medium text-sm rounded-md"
          )}
          onClick={() => setCurrentTab("sell")}
        >
          Sell
        </a>
      </nav>

      <div>{currentTab === "buy" ? <Buy /> : <Sell />}</div>
    </div>
  );
};

export default IndexPage;
