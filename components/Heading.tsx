import { useEthers } from "@usedapp/core";
import Link from "next/link";

const Heading = () => {
  const { account, activateBrowserWallet, deactivate } = useEthers();

  return (
    <div className="md:flex md:items-center md:justify-between md:m-5">
      <div className="flex-1 min-w-0">
        <Link href="/" passHref>
          <a>
            <h2 className="text-2xl font-bold leading-7 sm:text-3xl sm:truncate">
              🧹 Floor Swap
            </h2>
          </a>
        </Link>
        <p>NFT floor orders powered by 0x</p>
      </div>

      <div className="mt-4 flex md:mt-0 md:ml-4">
        {account && (
          <code className="inline-flex items-center text-sm">
            {account.slice(0, 6) + "..." + account.slice(-2)}
          </code>
        )}

        <button
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm font-medium hover:text-gray-700"
          onClick={() => (account ? deactivate() : activateBrowserWallet())}
        >
          {account ? <span>Disconnect</span> : <span>Connect wallet</span>}
        </button>
      </div>
    </div>
  );
};

export default Heading;
