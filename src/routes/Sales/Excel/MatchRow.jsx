import { CheckCircleIcon } from "@heroicons/react/20/solid";

export default function MatchRow({
  DaybookInvoice,
  XeroInvoice,
  matchInvoice,
}) {
  function MatchGrade(Daybook, Xero) {
    let grade = 0;
    if (Daybook?.number == Xero?.item.InvoiceNumber) {
      grade += 1;
    }
    if (
      new Date(Daybook?.date).toLocaleDateString("en-GB") ==
      new Date(Xero?.item.DateString).toLocaleDateString("en-GB")
    ) {
      grade += 1;
    }
    if (+Daybook?.Fees + +Daybook?.disb == Xero?.item.SubTotal) {
      grade += 1;
    }
    if (grade == 0) {
      return "bg-red-100";
    }
    if (grade == 3) {
      return "bg-green-100";
    }
    return "bg-yellow-100";
  }
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="flex items-center py-2">
      <div className="basis-5/12 bg-indigo-100 p-2 border border-black rounded">
        <div className="flex flex-col items-center">
          <div className="grow w-full border-b border-slate-400">
            <span className="text-base font-semibold">
              {DaybookInvoice?.client}
            </span>
          </div>
          <div className="grow w-full">
            <div className="flex items-start divide-x divide-slate-400 divide-dashed">
              <div className="w-1/2">
                <div className="text-sm">Invoice Number</div>
                <div className="text-sm">{DaybookInvoice?.number}</div>
                <div className="text-sm">Invoice Date</div>
                <div className="text-sm">
                  {new Date(DaybookInvoice?.date).toLocaleDateString("en-GB")}
                </div>
              </div>
              <div className="w-1/2">
                <div className="text-sm">Invoice Total</div>
                <div className="text-sm">
                  {+DaybookInvoice?.Fees + +DaybookInvoice?.disb}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="basis-2/12 w-64 p-4 text-center">
        {DaybookInvoice?.xeroInvoiceId != null ? (
          <button
            type="button"
            className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            onClick={() => matchInvoice(DaybookInvoice, XeroInvoice, "unlink")}
          >
            Un-Match
          </button>
        ) : (
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => matchInvoice(DaybookInvoice, XeroInvoice, "link")}
          >
            Match
          </button>
        )}
      </div>
      <div
        className={classNames(
          "basis-5/12 p-2 border border-black rounded",
          MatchGrade(DaybookInvoice, XeroInvoice)
        )}
      >
        <div className="flex flex-col items-center">
          <div className="grow w-full border-b border-slate-400">
            <span className="text-base font-semibold">
              {XeroInvoice?.item.Contact.Name} ({XeroInvoice?.score})
            </span>
          </div>
          <div className="grow w-full">
            <div className="flex items-start divide-x divide-slate-400 divide-dashed">
              <div className="w-1/2">
                <div className="text-sm">Invoice Number</div>
                <div className="text-sm content-center">
                  <span>{XeroInvoice?.item.InvoiceNumber}</span>
                  {XeroInvoice?.item.InvoiceNumber ==
                    DaybookInvoice?.number && (
                    <span className="inline-block">
                      <CheckCircleIcon
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </div>
                <div className="text-sm">Invoice Date</div>
                <div className="text-sm">
                  {new Date(XeroInvoice?.item.DateString).toLocaleDateString(
                    "en-GB"
                  )}
                  {new Date(XeroInvoice?.item.DateString).toLocaleDateString(
                    "en-GB"
                  ) ==
                    new Date(DaybookInvoice?.date).toLocaleDateString(
                      "en-GB"
                    ) && (
                    <span className="inline-block">
                      <CheckCircleIcon
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </div>
              </div>
              <div className="w-1/2">
                <div className="text-sm">Invoice Total</div>
                <div className="text-sm">
                  {XeroInvoice?.item.SubTotal}
                  {XeroInvoice?.item.SubTotal ==
                    +DaybookInvoice?.Fees + +DaybookInvoice?.disb && (
                    <span className="inline-block">
                      <CheckCircleIcon
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
