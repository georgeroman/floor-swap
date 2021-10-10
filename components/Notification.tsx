import { Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";
import { Fragment, useEffect, useRef } from "react";

type Props = {
  message: string;
  show: boolean;
  setShow: (show: boolean) => void;
};

const Notification = ({ message, show, setShow }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkIfClickedOutside = (event: any) => {
      if (show && ref.current && !ref.current.contains(event.target)) {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [show]);

  return (
    <div
      ref={ref}
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
        <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center">
                <div className="w-0 flex-1 flex justify-between">
                  <p className="w-0 flex-1 text-sm font-medium text-gray-900">
                    {message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 border-0"
                    onClick={() => {
                      setShow(false);
                    }}
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default Notification;
