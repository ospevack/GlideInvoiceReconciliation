import { Fragment, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FilterLineNumbers({ label, value, setValue }) {
  return (
    <>
      <label
        htmlFor="lines"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label ?? "No Label"}
      </label>
      <div className="relative mt-2">
        <input
          type="number"
          name="lines"
          id="lines"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      </div>
    </>
  );
}
