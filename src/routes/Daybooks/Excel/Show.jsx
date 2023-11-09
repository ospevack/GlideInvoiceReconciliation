import Navbar from "../../../components/navbar";
import axios from "axios";
import { useState, useEffect } from "react";
import CompListBox from "./Component-List";
import CompListClient from "./Component-ClientList";
import Fuse from "fuse.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

let pounds = Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function DaybookExcelShow() {
  const [invoices, setInvoices] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [xeroInvoices, setXeroInvoices] = useState([]);
  const [xeroResult, setXeroResult] = useState([]);
  const [selInvoice, setSelInvoice] = useState(null);

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
      .get("/api/xero/sales/invoices", {
        params: { where: 'Type=="ACCREC"' },
      })
      .then((response) => {
        setXeroInvoices(response.data.Invoices);
      });
  }, []);
  useEffect(() => {
    setFilteredInvoices(
      invoices.filter((invoice) => selectedSheets.includes(invoice.sheet))
    );
  }, [selectedSheets]);
  function AddClient(invoice) {
    axios
      .post("/api/clients", { name: invoice.client })
      .then((response) => {
        var newClientId = response.data.insertId;
        axios.post("/api/daybook/link/" + invoice.id, {
          clientId: newClientId,
        });
      })
      .then(() => {
        //refresh invoice list
        axios
          .get("/api/daybook/invoices")
          .then((response) => {
            setInvoices(response.data);
            setSheets([...new Set(response.data.map((item) => item.sheet))]);
          })
          .catch((error) => {
            console.log(error);
          });
      });
  }
  function RemoveClient(clientId) {
    axios.delete("/api/daybook/link/" + clientId);
    axios
      .get("/api/daybook/invoices")
      .then((response) => {
        setInvoices(response.data);
        setSheets([...new Set(response.data.map((item) => item.sheet))]);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  function removeSelected(sheet) {
    setSelectedSheets(selectedSheets.filter((item) => item !== sheet));
  }
  function fuseFuzzyName(nam, invoice, invId) {
    const options = {
      includeScore: true,
      keys: [
        { name: "name", getFn: (x) => x.Contact.Name },
        { name: "inv", getFn: (x) => x.InvoiceNumber },
      ],
    };
    const fuse = new Fuse(xeroInvoices, options);
    const result = fuse.search(
      { $and: [{ name: nam }, { inv: invoice }] },
      { limit: 5 }
    );
    setSelInvoice(invId);
    setXeroResult(result[0]);
    console.log(result[1].score > 4);
    console.log(result);
  }
  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="Daybooks" />

        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Excel Daybooks
              </h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="border-2 border-indigo-600 rounded-md my-4 p-4">
                <div className="flex flex-wrap items-center">
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
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Invoice No
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Client
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Fee
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Disb
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredInvoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                              {new Date(invoice.date).toLocaleDateString(
                                "en-GB"
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {invoice.number}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <span>{invoice.client}</span>
                                {/* <div className="flex items-center border-1 rounded ml-auto">
                                  <span className="inline-flex pr-2">
                                    <button className="rounded bg-grey-100 px-2 py-1 text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-100">
                                      XERO
                                    </button>
                                  </span>
                                  <span className="inline-flex pr-2">
                                    {invoice.clientId == null ? (
                                      <button
                                        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-green-600 shadow-sm hover:bg-green-100"
                                        onClick={() => AddClient(invoice)}
                                      >
                                        Add Client
                                      </button>
                                    ) : (
                                      <button
                                        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-orange-600 shadow-sm hover:bg-orange-100"
                                        onClick={() => RemoveClient(invoice.id)}
                                      >
                                        Remove Link
                                      </button>
                                    )}
                                  </span>
                                  <span className="inline-flex">
                                    <CompListClient />
                                  </span>
                                </div> */}
                                {/* this is going to be a pure Xero lookup */}
                                <div className="flex items-center border-1 rounded ml-auto">
                                  {/*lookup client from name and invoice*/}
                                  <span className="inline-flex pr-2">
                                    <button
                                      onClick={() =>
                                        fuseFuzzyName(
                                          invoice.client,
                                          invoice.number,
                                          invoice.id
                                        )
                                      }
                                      className="rounded bg-grey-100 px-2 py-1 text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
                                    >
                                      Lookup
                                    </button>
                                  </span>
                                  {selInvoice == invoice.id && (
                                    <span className="inline-flex pr-2">
                                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        {xeroResult.length > 0
                                          ? xeroResult.score
                                          : ""}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {pounds.format(invoice.Fees)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {pounds.format(invoice.Disb ?? 0)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {pounds.format(
                                parseFloat(invoice.Fees) +
                                  parseFloat(invoice.Disb ?? 0.0)
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
