import Navbar from "../../../components/navbar";
import axios from "axios";
import { useState, useEffect } from "react";
import CompListBox from "./Component-List";

const navigation = [
  { name: "Dashboard", href: "/", current: false },
  { name: "Sales Rec (Excel/Xero)", href: "/Sales/ExcelMatch", current: false },
  { name: "Daybooks", href: "/Daybooks/Excel", current: true },
  { name: "Calendar", href: "#", current: false },
];

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

  useEffect(() => {
    axios
      .get("/api/daybook/invoices")
      .then((response) => {
        setInvoices(response.data);
        setSheets([...new Set(response.data.map((item) => item.sheet))]);
        setSelectedSheets([
          ...new Set(response.data.map((item) => item.sheet)),
        ]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  useEffect(() => {
    setFilteredInvoices(
      invoices.filter((invoice) => selectedSheets.includes(invoice.sheet))
    );
  }, [selectedSheets]);

  return (
    <>
      <div className="min-h-full">
        <Navbar navigation={navigation} />

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
              <div className="p-4">
                <div className="border-2 border-indigo-600 rounded-md">
                  <div className="flex flex-row items-center py-4">
                    <div>
                      <p className="text-xl font-medium text-gray-900 px-4">
                        Filters
                      </p>
                    </div>
                    <div className="pr-4 flex-1 flex-row">
                      {(sheets?.length ?? 0) > 0 && (
                        <CompListBox
                          label="Sheet"
                          options={sheets}
                          setSelectedSheets={setSelectedSheets}
                          selectedSheets={selectedSheets}
                        />
                      )}
                      <div className="flex flex-col items-center">
                        <div>
                          <button onClick={() => setSelectedSheets([])}>
                            clear all
                          </button>
                        </div>
                        <div>
                          <button
                            onClick={() =>
                              setSelectedSheets([
                                ...new Set(invoices.map((item) => item.sheet)),
                              ])
                            }
                          >
                            select all
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
                              {invoice.client}
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
