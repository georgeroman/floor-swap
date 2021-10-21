import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { useEthers } from "@usedapp/core";
import Link from "next/link";
import { Fragment } from "react";

const Heading = () => {
  const { account, activateBrowserWallet, deactivate } = useEthers();

  return (
    <div className="flex items-center justify-between mx-5 my-5">
      <Link href="/" passHref>
        <a>
          <h3 className="text-2xl font-bold leading-7">Floor Swap</h3>
        </a>
      </Link>

      <div className="flex align-center">
        {account && (
          <Popover>
            {() => (
              <>
                <Popover.Button className="inline-flex items-center font-medium hover:text-gray-600">
                  <code className="inline-flex items-center text-sm">
                    {account.slice(0, 6) + "..." + account.slice(-3)}
                  </code>
                  <ChevronDownIcon className="ml-2 h-5 w-5" />
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute right-0 z-10 mt-3 px-2 w-48 max-w-xs">
                    <div className="rounded-lg shadow-md ring-1 ring-black ring-opacity-5 overflow-hidden">
                      <div className="block relative gap-3 bg-white gap-4 p-4">
                        <button
                          type="button"
                          className="text-sm font-medium hover:text-gray-600"
                          onClick={() => deactivate()}
                        >
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        )}

        {!account && (
          <button
            type="button"
            className="inline-flex items-center text-sm font-medium hover:text-gray-600"
            onClick={() => activateBrowserWallet()}
          >
            <span>Connect wallet</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Heading;
