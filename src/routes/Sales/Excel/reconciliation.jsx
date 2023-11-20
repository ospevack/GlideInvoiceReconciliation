import Navbar from "../../../components/navbar";
import CompListBox from "./Component-List";
import CompMatch from "./Component-Matched";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import axios from "axios";
import SalesSubNav from "../../../components/SalesSubNav";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SalesReconciliation() {
  const [invoices, setInvoices] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState("All");
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [xeroInvoices, setXeroInvoices] = useState([]);
  const [xeroFilteredInvoices, setXeroFilteredInvoices] = useState([]);
  const [xeroFilteredCreditNotes, setXeroFilteredCreditNotes] = useState([]);
  const [xeroCreditNotes, setXeroCreditNotes] = useState([]);
  const [reconcilingItems, setReconcilingItems] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [daybookDifferences, setDaybookDifferences] = useState([]);
  const [futureInvoices, setFutureInvoices] = useState([]);
  const [currentDifferences, setCurrentDifferences] = useState([]);
  const [notPosted, setNotPosted] = useState([]);
  const [notPostedCredits, setNotPostedCredits] = useState([]);

  function sumInvoiceTotal(invoices) {
    return invoices.reduce((total, invoice) => {
      return total + +invoice.Fees + +invoice.disb + +invoice.adjustment;
    }, 0);
  }
  function sumXeroTotal(invoices) {
    return invoices.reduce((total, invoice) => {
      return total + +invoice.SubTotal;
    }, 0);
  }
  function sumDaybookDifferencesTotal(invoices) {
    return invoices.reduce((total, invoice) => {
      return total + +invoice.difference;
    }, 0);
  }
  function sumReconcilingDifference(invoices) {
    return invoices.reduce((total, invoice) => {
      /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
      return total + invoice.adjusting_amount;
    }, 0);
  }

  const DateLookups = [
    {
      id: 1,
      sheet: "Nov-21",
      StartDate: "2021-11-01T00:00:00.000Z",
      EndDate: "2021-11-30T00:00:00.000Z",
    },
    {
      id: 2,
      sheet: "Dec-21",

      StartDate: "2021-12-01T00:00:00.000Z",
      EndDate: "2021-12-31T00:00:00.000Z",
    },
    {
      id: 3,
      sheet: "Jan-22",
      StartDate: "2022-01-01T00:00:00.000Z",
      EndDate: "2022-01-31T00:00:00.000Z",
    },
    {
      id: 4,
      sheet: "Feb-22",
      StartDate: "2022-02-01T00:00:00.000Z",
      EndDate: "2022-02-28T00:00:00.000Z",
    },
    {
      id: 5,
      sheet: "mar-22",
      StartDate: "2022-03-01T00:00:00.000Z",
      EndDate: "2022-03-31T00:00:00.000Z",
    },
    {
      id: 6,
      sheet: "Apr-22",
      StartDate: "2022-04-01T00:00:00.000Z",
      EndDate: "2022-04-30T00:00:00.000Z",
    },
    {
      id: 7,
      sheet: "May-22",
      StartDate: "2022-05-01T00:00:00.000Z",
      EndDate: "2022-05-31T00:00:00.000Z",
    },
    {
      id: 8,
      sheet: "Jun-22",
      StartDate: "2022-06-01T00:00:00.000Z",
      EndDate: "2022-06-30T00:00:00.000Z",
    },
    {
      id: 9,
      sheet: "Jul-22",
      StartDate: "2022-07-01T00:00:00.000Z",
      EndDate: "2022-07-31T00:00:00.000Z",
    },
    {
      id: 10,
      sheet: "Aug-22",
      StartDate: "2022-08-01T00:00:00.000Z",
      EndDate: "2022-08-31T00:00:00.000Z",
    },
    {
      id: 11,
      sheet: "Sept-22",
      StartDate: "2022-09-01T00:00:00.000Z",
      EndDate: "2022-09-30T00:00:00.000Z",
    },
    {
      id: 12,
      sheet: "Oct-22",
      StartDate: "2022-10-01T00:00:00.000Z",
      EndDate: "2022-10-31T00:00:00.000Z",
    },
    {
      id: 13,
      sheet: "Nov-22",
      StartDate: "2022-11-01T00:00:00.000Z",
      EndDate: "2022-11-30T00:00:00.000Z",
    },
    {
      id: 14,
      sheet: "Dec-22",
      StartDate: "2022-12-01T00:00:00.000Z",
      EndDate: "2022-12-31T00:00:00.000Z",
    },
    {
      id: 15,
      sheet: "Jan-23",
      StartDate: "2023-01-01T00:00:00.000Z",
      EndDate: "2023-01-31T00:00:00.000Z",
    },
    {
      id: 16,
      sheet: "Feb-23",
      StartDate: "2023-02-01T00:00:00.000Z",
      EndDate: "2023-02-28T00:00:00.000Z",
    },
    {
      id: 17,
      sheet: "Mar-23",
      StartDate: "2023-03-01T00:00:00.000Z",
      EndDate: "2023-03-31T00:00:00.000Z",
    },
    {
      id: 18,
      sheet: "Apr-23",
      StartDate: "2023-04-01T00:00:00.000Z",
      EndDate: "2023-04-30T00:00:00.000Z",
    },
    {
      id: 19,
      sheet: "May-23",
      StartDate: "2023-05-01T00:00:00.000Z",
      EndDate: "2023-05-31T00:00:00.000Z",
    },
    {
      id: 20,
      sheet: "Jun-23",
      StartDate: "2023-06-01T00:00:00.000Z",
      EndDate: "2023-06-30T00:00:00.000Z",
    },
    {
      id: 21,
      sheet: "Jul-23",
      StartDate: "2023-07-01T00:00:00.000Z",
      EndDate: "2023-07-31T00:00:00.000Z",
    },
    {
      id: 22,
      sheet: "Aug-23",
      StartDate: "2023-08-01T00:00:00.000Z",
      EndDate: "2023-08-31T00:00:00.000Z",
    },
    {
      id: 23,
      sheet: "Sept-23",
      StartDate: "2023-09-01T00:00:00.000Z",
      EndDate: "2023-09-30T00:00:00.000Z",
    },
    {
      id: 24,
      sheet: "Oct-23",
      StartDate: "2023-10-01T00:00:00.000Z",
      EndDate: "2023-10-31T00:00:00.000Z",
    },
  ];
  useEffect(() => {
    axios
      .get("/api/daybook/invoices")
      .then((response) => {
        setInvoices(response.data);
        setSheets([...new Set(response.data.map((item) => item.sheet))]);
        //setSelectedSheets([
        //  ...new Set(response.data.map((item) => item.sheet)),
        //]);
      })
      .catch((error) => {
        console.log(error);
      });
    axios
      .get("/api/xero/sales/invoices", {
        params: { where: 'Type=="ACCREC"' },
      })
      .then((response) => {
        setXeroInvoices(
          response.data.Invoices.filter(
            (item) => item.Status == "PAID" || item.Status == "AUTHORISED"
          )
          //response.data.Invoices
        );
      });
    axios
      .get("/api/xero/sales/CreditNotes", {
        params: { where: 'Type=="ACCRECCREDIT"' },
      })
      .then((response) => {
        setXeroCreditNotes(
          response.data.CreditNotes.filter(
            (item) => item.Status == "PAID" || item.Status == "AUTHORISED"
          )
          //response.data.Invoices
        );
      });
    axios.get("/api/reconciliation/items").then((response) => {
      setReconcilingItems(response.data);
    });
  }, []);
  useEffect(() => {
    filterInvoices();
    filterXeroInvoices();
    filterXeroCreditNotes();
    console.log(
      new Date(Math.max(...selectedDates.map((e) => new Date(e.EndDate))))
    );
  }, [selectedSheets, selectedMatch, invoices]);

  useEffect(() => {
    filterCurrentDifferences();
  }, [xeroFilteredInvoices, xeroFilteredCreditNotes]);

  useEffect(() => {
    //this is effectively our reconciliation function

    //look at daybook differences first
    var dbDiff = [];
    //invoices
    filteredInvoices.map((invoice) => {
      var xeroInvoice = xeroInvoices?.find(
        (xeroInvoice) => xeroInvoice.InvoiceID == invoice.xeroInvoiceId
      );
      if (
        +invoice.Fees + +invoice.disb + +invoice.adjustment !=
          +xeroInvoice?.SubTotal &&
        invoice.cancelled == 0 &&
        invoice.type == "Invoice" &&
        reconcilingItems?.find((x) => x.invoice_id == invoice.id) == null
      ) {
        dbDiff.push({
          id: invoice.id,
          date: invoice.date,
          client: invoice.client,
          number: invoice.number,
          Fees: invoice.Fees,
          disb: invoice.disb,
          xeroSubTotal: xeroInvoice?.SubTotal,
          difference:
            +invoice.Fees + +invoice.disb - (+xeroInvoice?.SubTotal || 0),
        });
      }
    });
    //credit notes
    filteredInvoices.map((invoice) => {
      var xeroCreditNote = xeroCreditNotes?.find(
        (xeroCreditNote) =>
          xeroCreditNote.CreditNoteID == invoice.xeroCreditNoteId
      );
      if (
        +invoice.Fees + +invoice.disb + +invoice.adjustment !=
          +xeroCreditNote?.SubTotal &&
        invoice.cancelled == 0 &&
        invoice.type == "Credit Note"
      ) {
        dbDiff.push({
          id: invoice.id,
          date: invoice.date,
          client: invoice.client,
          number: invoice.number,
          Fees: invoice.Fees,
          disb: invoice.disb,
          xeroSubTotal: xeroCreditNote?.SubTotal,
          difference:
            +invoice.Fees + +invoice.disb - (+xeroCreditNote?.SubTotal || 0),
        });
      }
    });
    setDaybookDifferences(dbDiff);

    //next lets get all daybook invoices that feature in the future months (but we need to take Xero values, as we have adjusted the daybook differences to all invoices, above.)
    var futInvs = filteredInvoices.filter(
      (invoice) =>
        invoice.cancelled == 0 &&
        xeroFilteredInvoices.find(
          (xeroInvoice) => xeroInvoice.InvoiceID == invoice.xeroInvoiceId
        ) == null &&
        xeroFilteredCreditNotes.find(
          (xeroCreditNote) =>
            xeroCreditNote.CreditNoteID == invoice.xeroCreditNoteId
        ) == null
    );
    //console.log(futInvs);
    setFutureInvoices(
      xeroInvoices.filter((invoice) =>
        futInvs.find((x) => invoice.InvoiceID == x.xeroInvoiceId)
      )
    );

    //get the invoices not posted to DB
    setNotPosted(
      xeroFilteredInvoices.filter(
        (invoice) =>
          filteredInvoices.find((x) => x.xeroInvoiceId == invoice.InvoiceID) ==
          null
      )
    );

    setNotPostedCredits(
      xeroFilteredCreditNotes.filter(
        (invoice) =>
          filteredInvoices.find(
            (x) => x.xeroCreditNoteId == invoice.CreditNoteID
          ) == null
      )
    );

    //console.log(futInvs);
  }, [filteredInvoices, xeroInvoices, xeroCreditNotes]);

  function filterInvoices() {
    setFilteredInvoices(
      invoices.filter((invoice) => selectedSheets.includes(invoice.sheet))
    );
  }

  function adjustSelectedSheets(sheet) {
    setSelectedDates(
      sheet.map((item) => DateLookups.find((x) => x.sheet == item))
    );
    setSelectedSheets(sheet);
  }

  function filterXeroInvoices() {
    setXeroFilteredInvoices(
      xeroInvoices.filter((invoice) =>
        selectedDates.some(
          (dateLookup) =>
            new Date(invoice.DateString) >= new Date(dateLookup.StartDate) &&
            new Date(invoice.DateString) <= new Date(dateLookup.EndDate)
        )
      )
    );
  }
  function filterXeroCreditNotes() {
    setXeroFilteredCreditNotes(
      xeroCreditNotes.filter((invoice) =>
        selectedDates.some(
          (dateLookup) =>
            new Date(invoice.DateString) >= new Date(dateLookup.StartDate) &&
            new Date(invoice.DateString) <= new Date(dateLookup.EndDate)
        )
      )
    );
  }

  function filterCurrentDifferences() {
    //console.log(reconcilingItems);
    //console.log(xeroFilteredInvoices);
    var diffs = reconcilingItems.filter((inv) =>
      filteredInvoices.find((it) => it.id == inv.invoice_id)
    );
    //console.log(diffs);
    setCurrentDifferences(diffs);
  }

  function removeSelected(sheet) {
    //setSelectedSheets(selectedSheets.filter((item) => item !== sheet));
    var newSheet = selectedDates.filter((item) => item.sheet !== sheet);
    setSelectedDates(newSheet);
    setSelectedSheets(newSheet);
  }

  function clearSelected() {
    setSelectedSheets([]);
    setSelectedDates([]);
  }

  function AddAdjustment(invoice) {
    axios.post("/api/reconciliation/adjust", invoice).then((response) => {
      console.log(response.data);
    });
  }

  const formatCurrency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="SalesRec" />
        <SalesSubNav PageName={"Reconciliation"} />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Daybook to Xero Reconciliation
              </h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="border-2 border-indigo-600 rounded-md my-4 p-4">
                <div className="flex flex-wrap items-start">
                  <span className="px-2 flex-none text-xl font-medium text-gray-900">
                    Filters
                  </span>
                  <span className=" px-2">
                    <span>
                      {(sheets?.length ?? 0) > 0 && (
                        <CompListBox
                          label="Sheet"
                          options={sheets}
                          setSelectedSheets={adjustSelectedSheets}
                          selectedSheets={selectedSheets}
                        />
                      )}
                    </span>
                    {/*<span className="ml-auto flex items-center text-sm">
                      <span className="flex rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100">
                        <button onClick={() => clearSelected()}>
                          clear all
                        </button>
                      </span>
                      <span>
                        <button
                          className="flex rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
                          onClick={() => {
                            setSelectedSheets([
                              ...new Set(invoices.map((item) => item.sheet)),
                            ]);
                          }}
                        >
                          select all
                        </button>
                      </span>
                        </span>*/}
                  </span>
                  {/* <span className=" px-2">
                    <span>
                      <CompMatch
                        selectedMatch={selectedMatch}
                        setSelectedMatch={setSelectedMatch}
                      />
                    </span>
                  </span> */}
                </div>
              </div>
              <div className="border-2 border-indigo-600 rounded-md p-4">
                <div className="flex flex-wrap items-center">
                  <span className="px-2 flex-none text-xl font-medium text-gray-900">
                    Filters Applied
                  </span>
                  {selectedSheets.length > 1 && (
                    <span className="flex flex-wrap">
                      <span className="flex text-xs p-2">Sheets:</span>
                      {selectedSheets.map((sheet) => (
                        <span className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {sheet}
                          {/*<button
                            type="button"
                            className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
                            onClick={() => removeSelected(sheet)}
                          >
                            <span className="sr-only">Remove</span>
                            <svg
                              viewBox="0 0 14 14"
                              className="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75"
                            >
                              <path d="M4 4l6 6m0-6l-6 6" />
                            </svg>
                            <span className="absolute -inset-1" />
                      </button>*/}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 pt-4">
              <div className="grid grid-cols-7 gap-2">
                {/*Daybook invoices List*/}
                <div className="col-span-6 text-lg text-bold border-b-2 border-indigo-400">
                  Daybook invoices ({selectedSheets.join(", ")})
                </div>
                <div></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Date
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Client
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Inv No
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Fee + Disb
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Manual Adjustments
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Total
                </div>
                <div></div>
              </div>
              {/*Daybook invoices List*/}
              {filteredInvoices?.map((invoice) => (
                <div className="grid grid-cols-7 gap-2">
                  <div className="text-sm text-gray-600">
                    {new Date(invoice.date).toLocaleDateString("en-GB")}
                  </div>
                  <div className="text-sm text-gray-600">{invoice.client}</div>
                  <div className="text-sm text-gray-600">{invoice.number}</div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency.format(+invoice.Fees + +invoice.disb)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency.format(+invoice.adjustment)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency.format(
                      +invoice.Fees + +invoice.disb + +invoice.adjustment
                    )}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-7 gap-2">
                {/*Daybook invoices Total*/}
                <div className="col-span-5 text-lg text-bold text-gray-600">
                  Sub-Total
                </div>
                <div className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                  {formatCurrency.format(sumInvoiceTotal(filteredInvoices))}
                </div>
                <div className="text-xl text-bold text-center">
                  {formatCurrency.format(sumInvoiceTotal(filteredInvoices))}
                </div>

                {/*Xero invoices List*/}
                <div className="col-span-6 text-lg text-bold border-b-2 border-indigo-400">
                  Xero invoices (
                  {new Date(
                    Math.min(...selectedDates.map((e) => new Date(e.StartDate)))
                  ).toLocaleDateString("en-GB")}{" "}
                  -{""}
                  {new Date(
                    Math.max(...selectedDates.map((e) => new Date(e.EndDate)))
                  ).toLocaleDateString("en-GB")}
                  )
                </div>
                <div></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Date
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Client
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Inv No
                </div>
                <div className="col-span-2"></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Net
                </div>
                <div></div>
              </div>
              {/*Xero invoices List*/}
              {xeroFilteredInvoices?.map((invoice) => (
                <div className="grid grid-cols-7 gap-2">
                  <div className="text-sm text-gray-600">
                    {new Date(invoice.DateString).toLocaleDateString("en-GB")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {invoice.Contact.Name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {invoice.InvoiceNumber}
                    {invoices.find(
                      (x) => invoice.InvoiceID == x.xeroInvoiceId
                    ) && (
                      <span className="inline-block">
                        <CheckCircleIcon
                          className="h-5 w-5 text-green-400"
                          aria-hidden="true"
                        />
                      </span>
                    )}
                  </div>
                  <div className="col-span-2"></div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency.format(+invoice.SubTotal)}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-7 gap-2">
                {/*Xero invoices Total*/}
                <div className="col-span-5 text-lg text-bold text-gray-600">
                  Sub-Total
                </div>
                <div className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                  {formatCurrency.format(sumXeroTotal(xeroFilteredInvoices))}
                </div>
                <div className="text-xl text-bold text-center">
                  {formatCurrency.format(sumXeroTotal(xeroFilteredInvoices))}
                </div>

                {/*Xero credit notes List*/}
                <div className="col-span-6 text-lg text-bold border-b-2 border-indigo-400">
                  Xero credit notes (
                  {new Date(
                    Math.min(...selectedDates.map((e) => new Date(e.StartDate)))
                  ).toLocaleDateString("en-GB")}{" "}
                  -
                  {new Date(
                    Math.max(...selectedDates.map((e) => new Date(e.EndDate)))
                  ).toLocaleDateString("en-GB")}
                  )
                </div>
                <div></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Date
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Client
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Inv No
                </div>
                <div className="col-span-2"></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Net
                </div>
                <div></div>
              </div>
              {/*Xero credit notes List*/}
              {xeroFilteredCreditNotes?.map((invoice) => (
                <div className="grid grid-cols-7 gap-2">
                  <div className="text-sm text-gray-600">
                    {new Date(invoice.DateString).toLocaleDateString("en-GB")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {invoice.Contact.Name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {invoice.CreditNoteNumber}
                  </div>
                  <div className="col-span-2"></div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency.format(+invoice.SubTotal / -1)}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-7 gap-2">
                {/*Xero invoices Total*/}
                <div className="col-span-5 text-lg text-bold text-gray-600">
                  Sub-Total
                </div>
                <div className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                  {formatCurrency.format(
                    sumXeroTotal(xeroFilteredCreditNotes) / -1
                  )}
                </div>
                <div className="text-xl text-bold text-center">
                  {formatCurrency.format(
                    sumXeroTotal(xeroFilteredCreditNotes) / -1
                  )}
                </div>
                {/*Difference Row*/}
                <div className="col-span-6 text-xl text-bold">Difference</div>
                <div className="text-xl text-bold border-t-2 border-indigo-600 text-center">
                  {formatCurrency.format(
                    sumInvoiceTotal(filteredInvoices) -
                      (sumXeroTotal(xeroFilteredInvoices) -
                        sumXeroTotal(xeroFilteredCreditNotes))
                  )}
                </div>
              </div>
              {/*Reconciliation*/}
              <div className="grid grid-cols-7 gap-2 mt-4">
                <div className="col-span-7 text-xl text-bold border-b-2 border-indigo-400">
                  Reconciliation
                </div>
                <div className="col-span-6 text-lg text-bold">
                  Difference to Reconcile
                </div>
                <div className="text-lg text-bold text-center">
                  {formatCurrency.format(
                    sumInvoiceTotal(filteredInvoices) -
                      (sumXeroTotal(xeroFilteredInvoices) -
                        sumXeroTotal(xeroFilteredCreditNotes))
                  )}
                </div>
                <div className="col-span-6 text-lg text-bold border-b-2 border-indigo-400">
                  Daybook items with a different value to Xero
                </div>
                <div></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Date
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Client
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Inv No
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Daybook Amount
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Xero Amount
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Difference
                </div>
              </div>
              {/*daybook differences*/}
              {daybookDifferences?.map((invoice) => {
                return (
                  <div className="grid grid-cols-7 gap-2">
                    <div className="text-sm text-gray-600">
                      {new Date(invoice.date).toLocaleDateString("en-GB")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.client}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency.format(+invoice.Fees + +invoice.disb)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency.format(+invoice.xeroSubTotal || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <a href="#" onClick={() => AddAdjustment(invoice)}>
                        {formatCurrency.format(invoice.difference)}
                      </a>
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-7 gap-2">
                {/*Daybook Differences Total*/}
                <div className="col-span-5 text-lg text-bold text-gray-600">
                  Sub-Total
                </div>
                <div className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                  {formatCurrency.format(
                    sumDaybookDifferencesTotal(daybookDifferences)
                  )}
                </div>
                <div className="text-xl text-bold text-center">
                  {formatCurrency.format(
                    sumDaybookDifferencesTotal(daybookDifferences) / -1
                  )}
                </div>
                <div className="col-span-6 text-lg text-bold border-b-2 border-indigo-400">
                  Reconciling items (Specific)
                </div>
                <div></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Date
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Client
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Inv No
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Description
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Document
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Adjustment
                </div>
              </div>
              {/*reconciling differences*/}
              {currentDifferences?.map((item) => {
                var invoice = filteredInvoices.find(
                  (inv) => inv.id == item.invoice_id
                );
                return (
                  <div className="grid grid-cols-7 gap-2">
                    <div className="text-sm text-gray-600">
                      {new Date(invoice?.date).toLocaleDateString("en-GB")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice?.client}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice?.number}
                    </div>
                    <div className="text-sm text-gray-600">{item.notes}</div>
                    <div className="text-sm text-gray-600">
                      {item.adjusting_document}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.adjusting_document == "daybook"
                        ? formatCurrency.format(item.adjusting_amount)
                        : formatCurrency.format(item.adjusting_amount / -1)}
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-7 gap-2">
                {/*reconciling Differences Total*/}
                <div className="col-span-5 text-lg text-bold text-gray-600">
                  Sub-Total
                </div>
                <div className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                  {formatCurrency.format(
                    sumReconcilingDifference(currentDifferences)
                  )}
                </div>
                <div className="text-xl text-bold text-center">
                  {formatCurrency.format(
                    sumReconcilingDifference(currentDifferences)
                  )}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-6 text-lg text-bold border-b-2 border-indigo-400">
                  Cancelled invoices in Daybook
                </div>
                <div></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Date
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Client
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Inv No
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Fee
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Disb
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Total
                </div>
              </div>
              {/*cancelled invoices*/}
              {filteredInvoices?.map((invoice) => {
                if (invoice.cancelled == 1) {
                  return (
                    <div className="grid grid-cols-7 gap-2">
                      <div className="text-sm text-gray-600">
                        {new Date(invoice.date).toLocaleDateString("en-GB")}
                      </div>
                      <div className="text-sm text-gray-600">
                        {invoice.client}
                      </div>
                      <div className="text-sm text-gray-600">
                        {invoice.number}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency.format(invoice.Fees)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency.format(invoice.disb)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency.format(+invoice.Fees + +invoice.disb)}
                      </div>
                    </div>
                  );
                }
              })}
              <div className="grid grid-cols-7 gap-2">
                {/*reconciling Differences Total*/}
                <div className="col-span-5 text-lg text-bold text-gray-600">
                  Sub-Total
                </div>
                <div className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                  {formatCurrency.format(
                    sumInvoiceTotal(
                      filteredInvoices.filter((inv) => inv.cancelled == 1)
                    )
                  )}
                </div>
                <div className="text-xl text-bold text-center">
                  {formatCurrency.format(
                    sumInvoiceTotal(
                      filteredInvoices.filter((inv) => inv.cancelled == 1)
                    ) / -1
                  )}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-6 text-lg text-bold border-b-2 border-indigo-400">
                  Invoices posted in other months
                </div>
                <div></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Date
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Client
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Inv No
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600"></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600"></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Total
                </div>
              </div>
              {/*later/earlier invoices*/}

              {futureInvoices?.map((invoice) => {
                return (
                  <div className="grid grid-cols-7 gap-2">
                    <div className="text-sm text-gray-600">
                      {new Date(invoice.DateString).toLocaleDateString("en-GB")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.Contact.Name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.InvoiceNumber}
                    </div>
                    <div className="text-sm text-gray-600"></div>
                    <div className="text-sm text-gray-600"></div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency.format(+invoice.SubTotal)}
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-7 gap-2">
                {/*reconciling Differences Total*/}
                <div className="col-span-5 text-lg text-bold text-gray-600">
                  Sub-Total
                </div>
                <div className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                  {formatCurrency.format(sumXeroTotal(futureInvoices))}
                </div>
                <div className="text-xl text-bold text-center">
                  {formatCurrency.format(sumXeroTotal(futureInvoices))}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-6 text-lg text-bold border-b-2 border-indigo-400">
                  Invoices not on Daybook
                </div>
                <div></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Date
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Client
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Inv No
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600"></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600"></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Total
                </div>
              </div>
              {/*not posted invoices list*/}

              {notPosted?.map((invoice) => {
                return (
                  <div className="grid grid-cols-7 gap-2">
                    <div className="text-sm text-gray-600">
                      {new Date(invoice.DateString).toLocaleDateString("en-GB")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.Contact.Name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.InvoiceNumber}
                    </div>
                    <div className="text-sm text-gray-600"></div>
                    <div className="text-sm text-gray-600"></div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency.format(+invoice.SubTotal)}
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-7 gap-2">
                {/*reconciling Differences Total*/}
                <div className="col-span-5 text-lg text-bold text-gray-600">
                  Sub-Total
                </div>
                <div className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                  {formatCurrency.format(sumXeroTotal(notPosted))}
                </div>
                <div className="text-xl text-bold text-center">
                  {formatCurrency.format(sumXeroTotal(notPosted))}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-6 text-lg text-bold border-b-2 border-indigo-400">
                  Credit notes not on Daybook
                </div>
                <div></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Date
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Client
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Inv No
                </div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600"></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600"></div>
                <div className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                  Total
                </div>
              </div>
              {/*not posted invoices list*/}

              {notPostedCredits?.map((invoice) => {
                return (
                  <div className="grid grid-cols-7 gap-2">
                    <div className="text-sm text-gray-600">
                      {new Date(invoice.DateString).toLocaleDateString("en-GB")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.Contact.Name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.CrediteNoteNumber}
                    </div>
                    <div className="text-sm text-gray-600"></div>
                    <div className="text-sm text-gray-600"></div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency.format(+invoice.SubTotal)}
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-7 gap-2">
                {/*reconciling Differences Total*/}
                <div className="col-span-5 text-lg text-bold text-gray-600">
                  Sub-Total
                </div>
                <div className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                  {formatCurrency.format(sumXeroTotal(notPostedCredits))}
                </div>
                <div className="text-xl text-bold text-center">
                  {formatCurrency.format(sumXeroTotal(notPostedCredits))}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-6 text-xl text-bold">Difference</div>
                <div className="text-xl text-bold border-t-2 border-indigo-600 text-center">
                  {formatCurrency.format(
                    sumInvoiceTotal(filteredInvoices) -
                      (sumXeroTotal(xeroFilteredInvoices) -
                        sumXeroTotal(xeroFilteredCreditNotes)) +
                      sumXeroTotal(notPosted) -
                      sumXeroTotal(notPostedCredits) -
                      sumDaybookDifferencesTotal(daybookDifferences) +
                      sumReconcilingDifference(currentDifferences) -
                      sumInvoiceTotal(
                        filteredInvoices.filter((inv) => inv.cancelled == 1)
                      ) -
                      sumXeroTotal(futureInvoices)
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
