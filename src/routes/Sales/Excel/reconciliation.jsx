import Navbar from "../../../components/Navbar";
import CompListBox from "./Component-List";
import CompMatch from "./Component-Matched";
import { CheckCircleIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import SalesSubNav from "../../../components/SalesSubNav";
import { utils, writeFileXLSX } from "xlsx";

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

  //excel tables
  const daybook_invoices = useRef(null);
  const xero_invoices = useRef(null);
  const xero_credits = useRef(null);
  const daybook_differences = useRef(null);
  const reconciling_differences = useRef(null);
  const future_invoices = useRef(null);
  const not_posted_invoices = useRef(null);
  const not_posted_credits = useRef(null);
  const cancelled_invoices = useRef(null);

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
    {
      id: 25,
      sheet: "Manual",
      StartDate: "2021-11-01T00:00:00.000Z",
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

  function daybookDifferenceCalc() {
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
  }

  useEffect(() => {
    //this is effectively our reconciliation function

    daybookDifferenceCalc();

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
      if (response.data.affectedRows == 1 && response.data.changedRows == 1) {
        var newInvoice = invoices.find((x) => x.id == invoice.id);
        newInvoice.adjustment = invoice.difference;
        setInvoices(
          invoices.map((item) => (item.id == invoice.id ? newInvoice : item))
        );
        daybookDifferenceCalc();
      }
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
                    <span className="ml-auto flex items-center text-sm">
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
                            setSelectedDates(DateLookups);
                          }}
                        >
                          select all
                        </button>
                      </span>
                    </span>
                  </span>
                  {/*
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
              {/*Daybook invoices table*/}
              <table
                ref={daybook_invoices}
                className="table-fixed w-full text-sm border-spacing-2 text-gray-600 text-left"
              >
                <thead>
                  <tr>
                    <td
                      colSpan={6}
                      className="col-span-6 text-lg text-bold border-b-2 border-indigo-400"
                    >
                      Daybook Invoices ({selectedSheets.join(", ")})
                      <button
                        className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => {
                          // generate workbook from table element
                          const wb = utils.table_to_book(
                            daybook_invoices.current
                          );
                          // write to XLSX
                          writeFileXLSX(wb, "DaybookInvoices.xlsx");
                        }}
                      >
                        Export XLSX
                        <TableCellsIcon
                          className="-mr-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="text-bold border-b-2 border-slate-200">
                      Date
                    </th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Client
                    </th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Inv No
                    </th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Fee + Disb
                    </th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Manual Adjustments
                    </th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Total
                    </th>
                    <th className="text-bold text-center"></th>
                  </tr>
                </thead>
                {/*Daybook invoices List*/}
                <tbody>
                  {filteredInvoices?.map((invoice) => (
                    <tr>
                      <td>
                        {new Date(invoice.date).toLocaleDateString("en-GB")}
                      </td>
                      <td>{invoice.client}</td>
                      <td>{invoice.number}</td>
                      <td
                        data-t="n"
                        data-z="#,##0.00;(#,##0.00);0"
                        data-v={+invoice.Fees + +invoice.disb}
                      >
                        {formatCurrency.format(+invoice.Fees + +invoice.disb)}
                      </td>
                      <td
                        data-t="n"
                        data-z="#,##0.00;(#,##0.00);0"
                        data-v={+invoice.adjustment}
                      >
                        {formatCurrency.format(+invoice.adjustment)}
                      </td>
                      <td
                        data-t="n"
                        data-z="#,##0.00;(#,##0.00);0"
                        data-v={
                          +invoice.Fees + +invoice.disb + +invoice.adjustment
                        }
                      >
                        {formatCurrency.format(
                          +invoice.Fees + +invoice.disb + +invoice.adjustment
                        )}
                      </td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {/*Daybook invoices Total*/}
                  <td colSpan={5} className="text-lg">
                    Sub-Total
                  </td>
                  <td className="text-lg border-t-2 border-indigo-400">
                    {formatCurrency.format(sumInvoiceTotal(filteredInvoices))}
                  </td>
                  <td className="text-xl text-center">
                    {formatCurrency.format(sumInvoiceTotal(filteredInvoices))}
                  </td>
                </tfoot>
              </table>
              {/*Xero invoices table*/}
              <table
                ref={xero_invoices}
                className="table-fixed w-full text-sm border-spacing-2 text-gray-600 text-left"
              >
                <thead>
                  <tr>
                    <td
                      colSpan={6}
                      className="col-span-6 text-lg text-bold border-b-2 border-indigo-400"
                    >
                      Xero invoices (
                      {new Date(
                        Math.min(
                          ...selectedDates.map((e) => new Date(e?.StartDate))
                        )
                      ).toLocaleDateString("en-GB")}{" "}
                      -{""}
                      {new Date(
                        Math.max(
                          ...selectedDates.map((e) => new Date(e?.EndDate))
                        )
                      ).toLocaleDateString("en-GB")}
                      )
                      <button
                        className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => {
                          // generate workbook from table element
                          const wb = utils.table_to_book(xero_invoices.current);
                          // write to XLSX
                          writeFileXLSX(wb, "XeroInvoices.xlsx");
                        }}
                      >
                        Export XLSX
                        <TableCellsIcon
                          className="-mr-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="text-bold border-b-2 border-slate-200">
                      Date
                    </th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Client
                    </th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Inv No
                    </th>
                    <th colSpan={2} className=""></th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Total
                    </th>
                    <th className="text-bold text-center"></th>
                  </tr>
                </thead>
                {/*Xero invoices List*/}
                <tbody>
                  {xeroFilteredInvoices?.map((invoice) => (
                    <tr>
                      <td>
                        {new Date(invoice.DateString).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td>{invoice.Contact.Name}</td>
                      <td>
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
                      </td>
                      <td colSpan={2}></td>
                      <td
                        data-t="n"
                        data-z="#,##0.00;(#,##0.00);0"
                        data-v={+invoice.SubTotal}
                      >
                        {formatCurrency.format(+invoice.SubTotal)}
                      </td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {/*Xero invoices Total*/}
                  <td colSpan={5} className="text-lg">
                    Sub-Total
                  </td>
                  <td className="text-lg border-t-2 border-indigo-400">
                    {formatCurrency.format(sumXeroTotal(xeroFilteredInvoices))}
                  </td>
                  <td className="text-xl text-center">
                    {formatCurrency.format(sumXeroTotal(xeroFilteredInvoices))}
                  </td>
                </tfoot>
              </table>
              {/*Xero Credit notes table*/}
              <table
                ref={xero_credits}
                className="table-fixed w-full text-sm border-spacing-2 text-gray-600 text-left"
              >
                <thead>
                  <tr>
                    <td
                      colSpan={6}
                      className="text-lg text-bold border-b-2 border-indigo-400"
                    >
                      Xero Credit Notes (
                      {new Date(
                        Math.min(
                          ...selectedDates.map((e) => new Date(e.StartDate))
                        )
                      ).toLocaleDateString("en-GB")}{" "}
                      -{""}
                      {new Date(
                        Math.max(
                          ...selectedDates.map((e) => new Date(e.EndDate))
                        )
                      ).toLocaleDateString("en-GB")}
                      )
                      <button
                        className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => {
                          // generate workbook from table element
                          const wb = utils.table_to_book(xero_credits.current);
                          // write to XLSX
                          writeFileXLSX(wb, "DaybookInvoices.xlsx");
                        }}
                      >
                        Export XLSX
                        <TableCellsIcon
                          className="-mr-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="text-bold border-b-2 border-slate-200">
                      Date
                    </th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Client
                    </th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Credit Note No
                    </th>
                    <th colSpan={2} className=""></th>
                    <th className="text-bold border-b-2 border-slate-200">
                      Total
                    </th>
                    <th className="text-bold text-center"></th>
                  </tr>
                </thead>
                {/*Xero invoices List*/}
                <tbody>
                  {xeroFilteredCreditNotes?.map((invoice) => (
                    <tr>
                      <td>
                        {new Date(invoice.DateString).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td>{invoice.Contact.Name}</td>
                      <td>
                        {invoice.CreditNoteNumber}
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
                      </td>
                      <td colSpan={2}></td>
                      <td
                        data-t="n"
                        data-z="#,##0.00;(#,##0.00);0"
                        data-v={+invoice.SubTotal / -1}
                      >
                        {formatCurrency.format(+invoice.SubTotal / -1)}
                      </td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {/*Xero invoices Total*/}
                  <td colSpan={5} className="text-lg">
                    Sub-Total
                  </td>
                  <td className="text-lg border-t-2 border-indigo-400">
                    {formatCurrency.format(
                      sumXeroTotal(xeroFilteredCreditNotes) / -1
                    )}
                  </td>
                  <td className="text-xl text-center">
                    {formatCurrency.format(
                      sumXeroTotal(xeroFilteredCreditNotes) / -1
                    )}
                  </td>
                </tfoot>
              </table>

              {/*difference table*/}
              <table className="table-fixed w-full border-spacing-4 text-gray-600 text-left">
                <tbody>
                  <tr>
                    <td colSpan={6} className="text-xl text-bold">
                      Difference
                    </td>
                    <td className="text-xl text-bold border-t-2 border-indigo-600 text-center">
                      {formatCurrency.format(
                        sumInvoiceTotal(filteredInvoices) -
                          (sumXeroTotal(xeroFilteredInvoices) -
                            sumXeroTotal(xeroFilteredCreditNotes))
                      )}
                    </td>
                  </tr>
                  {/*Reconciliation*/}
                  <tr className="pt-10">
                    <td
                      colSpan={7}
                      className="text-xl text-bold border-b-2 border-indigo-400"
                    >
                      Reconciliation
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="text-lg text-bold">
                      Difference to reconcile
                    </td>
                    <td className="text-xl text-bold text-center">
                      {formatCurrency.format(
                        sumInvoiceTotal(filteredInvoices) -
                          (sumXeroTotal(xeroFilteredInvoices) -
                            sumXeroTotal(xeroFilteredCreditNotes))
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/*daybook differences*/}
              <table
                ref={daybook_differences}
                className="table-fixed w-full border-spacing-4 text-gray-600 text-left text-sm"
              >
                <thead>
                  <tr>
                    <td
                      colSpan={6}
                      className="text-lg text-bold border-b-2 border-indigo-400"
                    >
                      Daybook items with a different value to Xero
                      <button
                        className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => {
                          // generate workbook from table element
                          const wb = utils.table_to_book(
                            daybook_differences.current
                          );
                          // write to XLSX
                          writeFileXLSX(wb, "DaybookInvoices.xlsx");
                        }}
                      >
                        Export XLSX
                        <TableCellsIcon
                          className="-mr-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Date
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Client
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Inv No
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Daybook Amount
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Xero Amount
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Difference
                    </td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {daybookDifferences?.map((invoice) => {
                    return (
                      <tr>
                        <td className="text-sm text-gray-600">
                          {new Date(invoice.date).toLocaleDateString("en-GB")}
                        </td>
                        <td className="text-sm text-gray-600">
                          {invoice.client}
                        </td>
                        <td className="text-sm text-gray-600">
                          {invoice.number}
                        </td>
                        <td
                          data-t="n"
                          data-z="#,##0.00;(#,##0.00);0"
                          data-v={+invoice.Fees + +invoice.disb}
                        >
                          {formatCurrency.format(+invoice.Fees + +invoice.disb)}
                        </td>
                        <td
                          data-t="n"
                          data-z="#,##0.00;(#,##0.00);0"
                          data-v={+invoice.xeroSubTotal || 0}
                        >
                          {formatCurrency.format(+invoice.xeroSubTotal || 0)}
                        </td>
                        <td
                          data-t="n"
                          data-z="#,##0.00;(#,##0.00);0"
                          data-v={+invoice.difference || 0}
                        >
                          <a
                            href="#"
                            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                            onClick={(e) => {
                              e.preventDefault();
                              AddAdjustment(invoice);
                            }}
                          >
                            {formatCurrency.format(invoice.difference)}
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={5}
                      className="col-span-5 text-lg text-bold text-gray-600"
                    >
                      Sub-Total
                    </td>
                    <td className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                      {formatCurrency.format(
                        sumDaybookDifferencesTotal(daybookDifferences)
                      )}
                    </td>
                    <td className="text-xl text-bold text-center">
                      {formatCurrency.format(
                        sumDaybookDifferencesTotal(daybookDifferences) / -1
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/*Reconciling Differences*/}
              <table
                ref={reconciling_differences}
                className="table-fixed w-full border-spacing-4 text-gray-600 text-left text-sm"
              >
                <thead>
                  <tr>
                    <td
                      colSpan={6}
                      className="text-lg text-bold border-b-2 border-indigo-400"
                    >
                      Reconciling items (Specific)
                      <button
                        className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => {
                          // generate workbook from table element
                          const wb = utils.table_to_book(
                            reconciling_differences.current
                          );
                          // write to XLSX
                          writeFileXLSX(wb, "DaybookInvoices.xlsx");
                        }}
                      >
                        Export XLSX
                        <TableCellsIcon
                          className="-mr-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Date
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Client
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Inv No
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Description
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Document
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Adjustment
                    </td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {currentDifferences?.map((item) => {
                    var invoice = filteredInvoices.find(
                      (inv) => inv.id == item.invoice_id
                    );
                    return (
                      <tr>
                        <td className="text-sm text-gray-600">
                          {new Date(invoice?.date).toLocaleDateString("en-GB")}
                        </td>
                        <td className="text-sm text-gray-600">
                          {invoice?.client}
                        </td>
                        <td className="text-sm text-gray-600">
                          {invoice?.number}
                        </td>
                        <td className="text-sm text-gray-600">{item.notes}</td>
                        <td className="text-sm text-gray-600">
                          {item.adjusting_document}
                        </td>
                        <td
                          data-t="n"
                          data-z="#,##0.00;(#,##0.00);0"
                          data-v={+item.adjusting_amount || 0}
                        >
                          {item.adjusting_document == "daybook"
                            ? formatCurrency.format(item.adjusting_amount)
                            : formatCurrency.format(item.adjusting_amount / -1)}
                        </td>
                        <td></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    {/*reconciling Differences Total*/}
                    <td
                      colSpan={5}
                      className="col-span-5 text-lg text-bold text-gray-600"
                    >
                      Sub-Total
                    </td>
                    <td className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                      {formatCurrency.format(
                        sumReconcilingDifference(currentDifferences)
                      )}
                    </td>
                    <td className="text-xl text-bold text-center">
                      {formatCurrency.format(
                        sumReconcilingDifference(currentDifferences)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/*Cancelled in Daybook*/}
              <table
                ref={cancelled_invoices}
                className="table-fixed w-full border-spacing-4 text-gray-600 text-left text-sm"
              >
                <thead>
                  <tr>
                    <td
                      colSpan={6}
                      className="text-lg text-bold border-b-2 border-indigo-400"
                    >
                      Cancelled invoices in Daybook
                      <button
                        className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => {
                          // generate workbook from table element
                          const wb = utils.table_to_book(
                            cancelled_invoices.current
                          );
                          // write to XLSX
                          writeFileXLSX(wb, "DaybookInvoices.xlsx");
                        }}
                      >
                        Export XLSX
                        <TableCellsIcon
                          className="-mr-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Date
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Client
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Inv No
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Fee
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Disb
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Total
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices?.map((invoice) => {
                    if (invoice.cancelled == 1) {
                      return (
                        <tr>
                          <td className="text-sm text-gray-600">
                            {new Date(invoice.date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="text-sm text-gray-600">
                            {invoice.client}
                          </td>
                          <td className="text-sm text-gray-600">
                            {invoice.number}
                          </td>
                          <td
                            data-t="n"
                            data-z="#,##0.00;(#,##0.00);0"
                            data-v={+invoice.Fees}
                          >
                            {formatCurrency.format(invoice.Fees)}
                          </td>
                          <td
                            data-t="n"
                            data-z="#,##0.00;(#,##0.00);0"
                            data-v={+invoice.disb}
                          >
                            {formatCurrency.format(invoice.disb)}
                          </td>
                          <td
                            data-t="n"
                            data-z="#,##0.00;(#,##0.00);0"
                            data-v={+invoice.Fees + +invoice.disb}
                          >
                            {formatCurrency.format(
                              +invoice.Fees + +invoice.disb
                            )}
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="text-lg text-bold text-gray-600">
                      Sub-Total
                    </td>
                    <td className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                      {formatCurrency.format(
                        sumInvoiceTotal(
                          filteredInvoices.filter((inv) => inv.cancelled == 1)
                        )
                      )}
                    </td>
                    <td className="text-xl text-bold text-center">
                      {formatCurrency.format(
                        sumInvoiceTotal(
                          filteredInvoices.filter((inv) => inv.cancelled == 1)
                        ) / -1
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/*Invoices posted in other months*/}
              <table
                ref={future_invoices}
                className="table-fixed w-full border-spacing-4 text-gray-600 text-left text-sm"
              >
                <thead>
                  <tr>
                    <td
                      colSpan={6}
                      className="text-lg text-bold border-b-2 border-indigo-400"
                    >
                      Invoices posted in other months
                      <button
                        className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => {
                          // generate workbook from table element
                          const wb = utils.table_to_book(
                            future_invoices.current
                          );
                          // write to XLSX
                          writeFileXLSX(wb, "DaybookInvoices.xlsx");
                        }}
                      >
                        Export XLSX
                        <TableCellsIcon
                          className="-mr-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Date
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Client
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Inv No
                    </td>
                    <td
                      colSpan={2}
                      className="text-sm text-bold border-b-2 border-slate-200 text-gray-600"
                    ></td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Total
                    </td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {futureInvoices?.map((invoice) => {
                    return (
                      <tr>
                        <td className="text-sm text-gray-600">
                          {new Date(invoice.DateString).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td className="text-sm text-gray-600">
                          {invoice.Contact.Name}
                        </td>
                        <td className="text-sm text-gray-600">
                          {invoice.InvoiceNumber}
                        </td>
                        <td className="text-sm text-gray-600"></td>
                        <td className="text-sm text-gray-600"></td>
                        <td
                          data-t="n"
                          data-z="#,##0.00;(#,##0.00);0"
                          data-v={+invoice.SubTotal}
                        >
                          {formatCurrency.format(+invoice.SubTotal)}
                        </td>
                        <td></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="text-lg text-bold text-gray-600">
                      Sub-Total
                    </td>
                    <td className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                      {formatCurrency.format(sumXeroTotal(futureInvoices))}
                    </td>
                    <td className="text-xl text-bold text-center">
                      {formatCurrency.format(sumXeroTotal(futureInvoices) / -1)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/*Invoices in Xero not Daybook*/}
              <table
                ref={not_posted_invoices}
                className="table-fixed w-full border-spacing-4 text-gray-600 text-left"
              >
                <thead>
                  <tr>
                    <td
                      colSpan={6}
                      className="text-lg text-bold border-b-2 border-indigo-400"
                    >
                      Invoices not on Daybook
                      <button
                        className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => {
                          // generate workbook from table element
                          const wb = utils.table_to_book(
                            not_posted_invoices.current
                          );
                          // write to XLSX
                          writeFileXLSX(wb, "DaybookInvoices.xlsx");
                        }}
                      >
                        Export XLSX
                        <TableCellsIcon
                          className="-mr-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Date
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Client
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Inv No
                    </td>
                    <td
                      colSpan={2}
                      className="text-sm text-bold border-b-2 border-slate-200 text-gray-600"
                    ></td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Total
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {notPosted?.map((invoice) => {
                    return (
                      <tr>
                        <td className="text-sm text-gray-600">
                          {new Date(invoice.DateString).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td className="text-sm text-gray-600">
                          {invoice.Contact.Name}
                        </td>
                        <td className="text-sm text-gray-600">
                          {invoice.InvoiceNumber}
                        </td>
                        <td colSpan={2} className="text-sm text-gray-600"></td>
                        <td
                          data-t="n"
                          data-z="#,##0.00;(#,##0.00);0"
                          data-v={+invoice.SubTotal}
                        >
                          {formatCurrency.format(+invoice.SubTotal)}
                        </td>
                        <td></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="text-lg text-bold text-gray-600">
                      Sub-Total
                    </td>
                    <td className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                      {formatCurrency.format(sumXeroTotal(notPosted))}
                    </td>
                    <td className="text-xl text-bold text-center">
                      {formatCurrency.format(sumXeroTotal(notPosted))}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/*Credit notes in Xero not Daybook*/}
              <table
                ref={not_posted_credits}
                className="table-fixed w-full border-spacing-4 text-gray-600 text-left"
              >
                <thead>
                  <tr>
                    <td
                      colSpan={6}
                      className="text-lg text-bold border-b-2 border-indigo-400"
                    >
                      Credit notes not on Daybook
                      <button
                        className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => {
                          // generate workbook from table element
                          const wb = utils.table_to_book(
                            not_posted_credits.current
                          );
                          // write to XLSX
                          writeFileXLSX(wb, "DaybookInvoices.xlsx");
                        }}
                      >
                        Export XLSX
                        <TableCellsIcon
                          className="-mr-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Date
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Client
                    </td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Inv No
                    </td>
                    <td
                      colSpan={2}
                      className="text-sm text-bold border-b-2 border-slate-200 text-gray-600"
                    ></td>
                    <td className="text-sm text-bold border-b-2 border-slate-200 text-gray-600">
                      Total
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {notPostedCredits?.map((invoice) => {
                    return (
                      <tr>
                        <td className="text-sm text-gray-600">
                          {new Date(invoice.DateString).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td className="text-sm text-gray-600">
                          {invoice.Contact.Name}
                        </td>
                        <td className="text-sm text-gray-600">
                          {invoice.CreditNoteNumber}
                        </td>
                        <td colSpan={2} className="text-sm text-gray-600"></td>
                        <td
                          data-t="n"
                          data-z="#,##0.00;(#,##0.00);0"
                          data-v={+invoice.SubTotal}
                        >
                          {formatCurrency.format(+invoice.SubTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="text-lg text-bold text-gray-600">
                      Sub-Total
                    </td>
                    <td className="text-lg text-bold border-t-2 border-indigo-400 text-gray-600">
                      {formatCurrency.format(sumXeroTotal(notPostedCredits))}
                    </td>
                    <td className="text-xl text-bold text-center">
                      {formatCurrency.format(
                        sumXeroTotal(notPostedCredits) / -1
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/*Difference*/}
              <table className="table-fixed w-full border-spacing-4 text-gray-600 text-left">
                <tbody>
                  <tr>
                    <td colSpan={6} className="text-xl text-bold">
                      Difference
                    </td>
                    <td className="text-xl text-bold border-t-2 border-indigo-600 text-center">
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
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
