import Navbar from "../../../components/Navbar";
import CompListBox from "./Component-List";
import CompMatch from "./Component-Matched";
import InvRow from "./Component-InvRow";
import { useState, useEffect } from "react";
import axios from "axios";
import SalesSubNav from "../../../components/SalesSubNav";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState("All");
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [xeroInvoices, setXeroInvoices] = useState([]);
  const [xeroCreditNotes, setXeroCreditNotes] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [reconcilingItems, setReconcilingItems] = useState([]);

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
      .get("/api/clients")
      .then((response) => {
        setClientList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    axios
      .get("/api/reconciliation/items")
      .then((response) => {
        setReconcilingItems(response.data);
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
  }, []);
  useEffect(() => {
    filterInvoices();
  }, [selectedSheets, selectedMatch, invoices]);

  function filterInvoices() {
    setFilteredInvoices(
      invoices.filter((invoice) => selectedSheets.includes(invoice.sheet))
    );
  }

  function refreshDaybook() {
    axios
      .get("/api/daybook/invoices")
      .then((response) => {
        setInvoices(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function removeSelected(sheet) {
    setSelectedSheets(selectedSheets.filter((item) => item !== sheet));
  }

  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="SalesRec" />
        <SalesSubNav PageName={"Invoices"} />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Matched Invoices to Xero
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
                          setSelectedSheets={setSelectedSheets}
                          selectedSheets={selectedSheets}
                        />
                      )}
                    </span>
                    <span className="ml-auto flex items-center text-sm">
                      <span className="flex rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100">
                        <button onClick={() => setSelectedSheets([])}>
                          clear all
                        </button>
                      </span>
                      <span>
                        <button
                          className="flex rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
                          onClick={() =>
                            setSelectedSheets([
                              ...new Set(invoices.map((item) => item.sheet)),
                            ])
                          }
                        >
                          select all
                        </button>
                      </span>
                    </span>
                  </span>
                  <span className=" px-2">
                    <span>
                      <CompMatch
                        selectedMatch={selectedMatch}
                        setSelectedMatch={setSelectedMatch}
                      />
                    </span>
                  </span>
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
                          <button
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
                          </button>
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="grid grid-cols-4 gap-4 my-2 border-b border-slate-400">
                <div>
                  <span className="text-xl font-medium text-gray-900">
                    Daybook
                  </span>
                </div>
                <div>
                  <span className="text-xl font-medium text-gray-900">
                    Xero
                  </span>
                </div>
                <div>
                  <span className="text-xl font-medium text-gray-900">
                    Recon Items
                  </span>
                </div>
                <div>
                  <span className="text-xl font-medium text-gray-900">
                    Difference
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredInvoices.length > 0
                  ? filteredInvoices.map((invoice) => (
                      <InvRow
                        DaybookInvoice={invoice}
                        XeroInvoice={
                          invoice.xeroInvoiceId != null
                            ? xeroInvoices?.filter(
                                (item) =>
                                  invoice.xeroInvoiceId == item.InvoiceID
                              )[0]
                            : invoice.xeroCreditNoteId != null
                            ? xeroCreditNotes?.filter(
                                (item) =>
                                  invoice.xeroCreditNoteId == item.CreditNoteID
                              )[0]
                            : null
                        }
                        reconcilingItems={reconcilingItems?.filter(
                          (item) => item.invoice_id == invoice.id
                        )}
                      />
                    ))
                  : null}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
