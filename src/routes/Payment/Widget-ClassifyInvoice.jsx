import { useState, useEffect } from "react";

export default function WidClassifyInvoice({
  invoice,
  AddClassification,
  RemoveClassification,
}) {
  const [selection, setSelection] = useState(null);
  const [adjAmount, setAdjAmount] = useState(0);
  const [adjReason, setAdjReason] = useState("");
  const [adhocAmount, setAdhocAmount] = useState(0);
  const [adhocReason, setAdhocReason] = useState("");
  const [inv, setInv] = useState({});
  const [Description, setDescription] = useState("");

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  useEffect(() => {
    invoice.clas_status != null
      ? setInv(invoice)
      : setInv({
          clas_status: "none",
          clas_amount: invoice.clas_amount,
          clas_reason: invoice.clas_reason,
          daybook_id: invoice.daybook_id,
          adhoc_amount: invoice.adhoc_amount,
          adhoc_reason: invoice.adhoc_reason,
          clas_Description: invoice.Description,
        });
  }, [invoice]);

  useEffect(() => {
    setSelection(inv.clas_status);
    setAdjAmount(+inv.clas_amount);
    setAdjReason(inv.clas_reason);
    setAdhocAmount(+inv.adhoc_amount);
    setAdhocReason(inv.adhoc_reason);
    setDescription(inv.clas_Description);
  }, [inv]);

  const classify = () => {
    AddClassification({
      invoice_id: inv.daybook_id,
      status: selection,
      adj_amount: +adjAmount,
      adj_reason: adjReason,
      adhoc_amount: +adhocAmount,
      adhoc_reason: adhocReason,
      Description: Description,
    });
  };

  return (
    <div className="flex flex-row item-start w-full text-sm">
      <div className="basis-1/3">
        <select
          className={classNames(
            "w-full my-1 rounded text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300",
            invoice.clas_status != null ? "bg-gray-100" : "hover:bg-gray-50"
          )}
          onChange={(e) => setSelection(e.target.value)}
          value={selection}
          disabled={invoice.clas_status != null}
        >
          <option
            disabled
            value="none"
            className="text-gray-100"
            style={{ display: "none" }}
          >
            Excluded
          </option>
          <option value="include">Include</option>
          <option value="exclude">Exclude (Reason)</option>
          <option value="15percent">15%</option>
          <option value="adhoc">Adhoc</option>
        </select>
        {selection != "none" && (
          <textarea
            rows={5}
            placeholder="Invoice Description"
            onChange={(e) => setDescription(e.target.value)}
            value={Description}
            disabled={invoice.clas_status != null}
            className={classNames(
              "w-full my-1 rounded text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300",
              invoice.clas_status != null ? "bg-gray-100" : "hover:bg-gray-50"
            )}
          />
        )}
      </div>
      <div className="basis-1/3">
        {selection === "include" && (
          <div className="flex flex-col item-start w-full text-sm">
            <div>
              <input
                type="text"
                placeholder="Adj Amount"
                onChange={(e) => setAdjAmount(e.target.value)}
                value={adjAmount}
                disabled={invoice.clas_status != null}
                className={classNames(
                  "w-full mx-4 my-1 rounded text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300",
                  invoice.clas_status != null
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                )}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Adj Reason"
                onChange={(e) => setAdjReason(e.target.value)}
                disabled={invoice.clas_status != null}
                value={adjReason}
                className={classNames(
                  "w-full mx-4 my-1 rounded text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300",
                  invoice.clas_status != null
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                )}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Adhoc Amount"
                onChange={(e) => setAdhocAmount(e.target.value)}
                value={adhocAmount}
                disabled={invoice.clas_status != null}
                className={classNames(
                  "w-full mx-4 my-1 rounded text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300",
                  invoice.clas_status != null
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                )}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Adhoc Description"
                onChange={(e) => setAdhocReason(e.target.value)}
                disabled={invoice.clas_status != null}
                value={adhocReason}
                className={classNames(
                  "w-full mx-4 my-1 rounded text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300",
                  invoice.clas_status != null
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                )}
              />
            </div>
          </div>
        )}
        {selection === "exclude" && (
          <div className="flex flex-col item-start w-full text-sm">
            <div>
              <input
                type="text"
                placeholder="Reason"
                onChange={(e) => setAdjReason(e.target.value)}
                disabled={invoice.clas_status != null}
                value={adjReason}
                className={classNames(
                  "w-full mx-4 my-1 rounded text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300",
                  invoice.clas_status != null
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                )}
              />
            </div>
          </div>
        )}
      </div>
      <div className="basis-1/3 my-auto text-center">
        {invoice.clas_status == null ? (
          <button
            className="rounded bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={classify}
          >
            Classify
          </button>
        ) : (
          <button
            className="rounded bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => RemoveClassification(inv.daybook_id)}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
