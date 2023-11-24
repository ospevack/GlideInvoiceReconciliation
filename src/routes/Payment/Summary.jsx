import Navbar from "../../components/navbar";
import { CheckCircleIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { utils, writeFileXLSX } from "xlsx";
import PaymentSubNav from "../../components/PaymentSubNav";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PaymentSummary() {
  const formatCurrency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  const [daybook, setDaybook] = useState([]);
  const summaryTable = useRef(null);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [lostClients, setLostClients] = useState(0);
  const [osaClients, setOsaClients] = useState(0);
  const [ltdClients, setLtdClients] = useState(0);

  useEffect(() => {
    axios
      .get("/api/payment/all")
      .then((res) => {
        setDaybook(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    setTotalInvoices(sumInvoices(daybook));
    setLostClients(
      sumInvoices(daybook.filter((invoice) => invoice.CalcGroup == "Lost")) / -1
    );
    setOsaClients(
      sumInvoices(daybook.filter((invoice) => invoice.CalcGroup == "OSA")) / -1
    );
    setLtdClients(
      sumInvoices(daybook.filter((invoice) => invoice.CalcGroup == "New-Ltd")) /
        -1
    );
  }, [daybook]);

  function sumInvoices(invoices) {
    return invoices.reduce((total, invoice) => {
      /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
      return (
        total +
        +invoice.Fees +
        +invoice.disb +
        +invoice.adjustment +
        +invoice.adjusting_amount
      );
    }, 0);
  }

  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="Payment" />
        <PaymentSubNav PageName={"Summary"} />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Payment Summary{" "}
                <button
                  className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => {
                    // generate workbook from table element
                    const wb = utils.table_to_book(summaryTable.current);
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
              </h1>
            </div>
          </header>
          <main>
            {/*<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="border-2 border-indigo-600 rounded-md my-4 p-4">
                <div className="flex flex-wrap items-start">
                  <span className="px-2 flex-none text-xl font-medium text-gray-900">
                    Filters
                  </span>
                  <span className=" px-2"></span>
                  {/* <span className=" px-2">
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
                </div>
              </div>
            </div>*/}
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 pt-4">
              <table
                ref={summaryTable}
                className="w-full text-left table-fixed text-sm text-gray-900"
              >
                <thead>
                  <tr>
                    <th className="w-1/12 px-2 py-2 font-semibold text-gray-900 bg-gray-100 border-b border-gray-200"></th>
                    <th className="w-1/12 px-2 py-2 font-semibold text-gray-900 bg-gray-100 border-b border-gray-200">
                      £
                    </th>
                    <th className="w-1/12 px-2 py-2 font-semibold text-gray-900 bg-gray-100 border-b border-gray-200">
                      £
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Total invoices raised
                    </td>
                    <td></td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {formatCurrency.format(totalInvoices)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: Lost Clients
                    </td>
                    <td></td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {formatCurrency.format(lostClients)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: OSA Clients
                    </td>
                    <td></td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {formatCurrency.format(osaClients)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: New Ltd Co Clients
                    </td>
                    <td></td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {formatCurrency.format(ltdClients)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      Remaining invoices
                    </td>
                    <td></td>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      {formatCurrency.format(
                        +totalInvoices +
                          +lostClients +
                          +osaClients +
                          +ltdClients
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
