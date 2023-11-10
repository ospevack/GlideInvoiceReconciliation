export default function MatchRow({
  DaybookInvoice,
  XeroInvoice,
  matchInvoice,
}) {
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
                <div className="text-sm">{DaybookInvoice?.date}</div>
              </div>
              <div className="w-1/2">
                <div className="text-sm">Invoice Total</div>
                <div className="text-sm">{DaybookInvoice?.Fees}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="basis-2/12 w-64 p-4 text-center">
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Match
        </button>
      </div>
      <div className="basis-5/12 bg-indigo-100 p-2 border border-black rounded">
        <div className="flex flex-col items-center">
          <div className="grow w-full border-b border-slate-400">
            <span className="text-base font-semibold">
              {XeroInvoice?.item.Contact.Name} (
              {parseFloat(+XeroInvoice?.score).toFixed(2)})
            </span>
          </div>
          <div className="grow w-full">
            <div className="flex items-start divide-x divide-slate-400 divide-dashed">
              <div className="w-1/2">
                <div className="text-sm">Invoice Number</div>
                <div className="text-sm">{XeroInvoice?.item.InvoiceNumber}</div>
                <div className="text-sm">Invoice Date</div>
                <div className="text-sm">{XeroInvoice?.item.DateString}</div>
              </div>
              <div className="w-1/2">
                <div className="text-sm">Invoice Total</div>
                <div className="text-sm">{XeroInvoice?.item.SubTotal}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
