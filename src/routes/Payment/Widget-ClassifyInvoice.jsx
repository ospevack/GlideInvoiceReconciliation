import { useState, useEffect } from "react";

export default function WidClassifyInvoice({ invoice, AddClassification }) {
  const [selection, setSelection] = useState("");

  return (
    <div className="flex flex-row item-start w-full text-sm">
      <div className="basis-1/2 bg-red-400">
        <select
          className="w-full"
          onChange={(e) => setSelection(e.target.value)}
        >
          <option
            disabled
            selected
            value
            className="text-gray-100"
            style={{ display: "none" }}
          >
            Excluded
          </option>
          <option value="include">Include</option>
          <option value="exclude">Exclude (Reason)</option>
          <option value="15percent">15%</option>
        </select>
      </div>
      <div className="basis-1/2 bg-green-400">
        {selection === "include" && (
          <div className="flex flex-col item-start w-full text-sm">
            <div>
              <input type="text" placeholder="Adj Amount" className="w-full" />
            </div>
            <div>
              <input type="text" placeholder="Adj Reason" className="w-full" />
            </div>
          </div>
        )}
        {selection === "exclude" && (
          <div className="flex flex-col item-start w-full text-sm">
            <div>
              <input type="text" placeholder="Reason" className="w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
