export default function InvRow({
  DaybookInvoice,
  XeroInvoice,
  reconcilingItems,
}) {
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  const formatCurrency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });
  function sumReconcilingItems(recItem) {
    if (recItem?.length == 1) {
      return +recItem[0].adjusting_amount;
    } else if (recItem == null) {
      return 0;
    } else {
      return recItem?.reduce((a, b) => +a + +b.adjusting_amount, 0);
    }
  }
  function calcDifference() {
    if (DaybookInvoice.type == "Invoice") {
      return (
        (+XeroInvoice?.SubTotal || 0) -
        +DaybookInvoice.Fees -
        +DaybookInvoice.disb -
        sumReconcilingItems(reconcilingItems)
      );
    } else {
      return (
        (+XeroInvoice?.SubTotal / -1 || 0) -
        +DaybookInvoice.Fees -
        +DaybookInvoice.disb -
        sumReconcilingItems(reconcilingItems)
      );
    }
  }
  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="flex flex-col h-[104px] my-2 p-1 bg-green-100 border border-slate-400 rounded">
            <div className="h-11 border-b border-slate-400">
              <div className="text-base text-gray-600 font-bold">
                {DaybookInvoice.client}
              </div>
              <div className="text-sm text-gray-600">
                ({DaybookInvoice.id}) {DaybookInvoice.number} -{" "}
                {new Date(DaybookInvoice?.date).toLocaleDateString("en-GB")}
              </div>
            </div>
            <div className="text-xl text-center my-3 h-7">
              {formatCurrency.format(
                +DaybookInvoice.Fees + +DaybookInvoice.disb
              )}
            </div>
          </div>
        </div>
        {DaybookInvoice.cancelled == 1 ? (
          <div className="col-span-3">
            <div className="flex flex-col my-2 p-1 h-[104px] bg-slate-100 border border-slate-400 rounded place-content-center">
              <div className="text-xl text-bold text-center text-slate-600">
                Cancelled
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              {XeroInvoice == null ? (
                <div className="flex flex-col my-2 p-1 h-[104px] bg-ingido-100 border border-slate-400 rounded place-content-center">
                  <div className="text-xl text-bold text-center text-slate-600">
                    No Xero Invoice
                  </div>
                </div>
              ) : (
                <div className="flex flex-col my-2 p-1 h-[104px] bg-blue-100 border border-slate-400 rounded">
                  <div className="h-11 border-b border-slate-400">
                    <div className="text-base text-gray-600 font-bold">
                      {XeroInvoice?.Contact.Name}
                    </div>
                    <div className="text-sm text-gray-600">
                      ({XeroInvoice?.Contact.ContactNumber}){" "}
                      {DaybookInvoice.type == "Invoice"
                        ? XeroInvoice?.InvoiceNumber
                        : XeroInvoice?.CreditNoteNumber}{" "}
                      -{" "}
                      {new Date(XeroInvoice?.DateString).toLocaleDateString(
                        "en-GB"
                      )}
                    </div>
                  </div>
                  <div className="text-xl text-center my-3 h-7">
                    {DaybookInvoice.type == "Invoice"
                      ? formatCurrency.format(+XeroInvoice?.SubTotal)
                      : formatCurrency.format(+XeroInvoice?.SubTotal / -1)}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-col h-[104px] my-2 p-1 bg-orange-100 border border-slate-400 rounded">
                <div className="h-11 border-b border-slate-400">
                  <div className="h-4 text-base text-gray-600 font-bold">
                    {reconcilingItems?.length ?? 0} Reconciling Items
                  </div>
                  <div className="h-4 min-h-16 text-sm text-gray-600"></div>
                </div>
                <div className="h-7 my-3 text-xl text-center">
                  {formatCurrency.format(sumReconcilingItems(reconcilingItems))}
                </div>
              </div>
            </div>
            <div>
              <div
                className={classNames(
                  "flex flex-col my-2 p-1 h-[104px] bg-grey-100 border border-slate-400 rounded place-content-center",
                  calcDifference() != 0 ? "bg-red-200" : "bg-grey-100"
                )}
              >
                <div className="text-xl text-bold text-center text-slate-600">
                  {formatCurrency.format(calcDifference())}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
