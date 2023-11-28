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
  const [excludedInvs, setExcludedInvs] = useState(0);
  const [commission, setCommission] = useState(0);
  const [total, setTotal] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [adhocTotal, setAdhocTotal] = useState(0);
  const [grfTotal, setGrfTotal] = useState(0);
  const [grfAdjustments, setGrfAdjustments] = useState(0);

  useEffect(() => {
    axios
      .get("/api/payment/all")
      .then((res) => {
        setDaybook(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    axios.get("/api/payment/transactions").then((res) => {
      setTransactions(res.data);
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
    setExcludedInvs(
      sumInvoices(
        daybook.filter(
          (invoice) =>
            checkExcludeStatus(invoice.clas_status) &&
            invoice.cancelled != 1 &&
            invoice.CalcGroup == null
        )
      ) / -1
    );
    setCommission(
      sumCommissionInvoices(
        daybook.filter(
          (invoice) =>
            invoice.CalcGroup == "Lost" && invoice.clas_status == "15percent"
        )
      ) * 0.15
    );
  }, [daybook]);
  useEffect(() => {
    setTotal(
      +totalInvoices + +lostClients + +osaClients + +ltdClients + +excludedInvs
    );
  }, [totalInvoices, lostClients, osaClients, ltdClients, excludedInvs]);
  useEffect(() => {
    setAdhocTotal(
      sumInvoices(
        daybook.filter(
          (invoice) =>
            invoice.clas_status == "adhoc" &&
            invoice.cancelled != 1 &&
            invoice.CalcGroup == null
        )
      ) +
        sumAdhoc(
          daybook.filter(
            (invoice) =>
              invoice.adhoc_amount != null &&
              invoice.cancelled != 1 &&
              invoice.CalcGroup == null
          )
        )
    );
    setGrfAdjustments(
      sumGRFAdjustments(
        daybook.filter(
          (invoice) =>
            invoice.clas_amount != null &&
            invoice.cancelled != 1 &&
            invoice.CalcGroup == null
        )
      )
    );
  }, [daybook]);

  useEffect(() => {
    setGrfTotal(+total + grfAdjustments + adhocTotal);
  }, [total, grfAdjustments, adhocTotal]);

  useEffect(() => {
    setTotalPayments(
      transactions.reduce((total, transaction) => {
        return total + +transaction.amount;
      }, 0)
    );
  }, [transactions]);

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

  function sumCommissionInvoices(invoices) {
    return invoices.reduce((total, invoice) => {
      /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
      return (
        total + +invoice.Fees + +invoice.adjustment + +invoice.adjusting_amount
      );
    }, 0);
  }

  function sumAdhoc(invoices) {
    return invoices.reduce((total, invoice) => {
      /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
      return total + +invoice.adhoc_amount;
    }, 0);
  }
  function sumGRFAdjustments(invoices) {
    return invoices.reduce((total, invoice) => {
      /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
      return total + +invoice.clas_amount;
    }, 0);
  }
  function checkExcludeStatus(status) {
    return status == "include" ? false : status == "adhoc" ? false : true;
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
                    <td
                      data-t="n"
                      data-v={+totalInvoices}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(totalInvoices)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: Lost Clients
                    </td>
                    <td></td>
                    <td
                      data-t="n"
                      data-v={+lostClients}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(lostClients)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: OSA Clients
                    </td>
                    <td></td>
                    <td
                      data-t="n"
                      data-v={+osaClients}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(osaClients)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: New Ltd Co Clients
                    </td>
                    <td></td>
                    <td
                      data-t="n"
                      data-v={+ltdClients}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(ltdClients)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      Remaining invoices
                    </td>
                    <td></td>
                    <td
                      data-t="n"
                      data-v={
                        +(+totalInvoices) +
                        +lostClients +
                        +osaClients +
                        +ltdClients
                      }
                      className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(
                        +totalInvoices +
                          +lostClients +
                          +osaClients +
                          +ltdClients
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: Excluded/Superceded invoices
                    </td>
                    <td></td>
                    <td
                      data-t="n"
                      data-v={+excludedInvs}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+excludedInvs)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      Total invoices subject to multiple
                    </td>
                    <td></td>
                    <td
                      data-t="n"
                      data-v={+total}
                      className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      GRF
                    </td>
                    <td data-t="n" data-v={+grfTotal}>
                      {formatCurrency.format(+grfTotal)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: Disbursements & Adhoc
                    </td>
                    <td data-t="n" data-v={+grfAdjustments}>
                      {formatCurrency.format(+grfAdjustments)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Adhoc
                    </td>
                    <td data-t="n" data-v={+adhocTotal}>
                      {formatCurrency.format(+adhocTotal)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Multiple
                    </td>
                    <td></td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      1.2
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      Sub-Total (multiple applied)
                    </td>
                    <td></td>
                    <td
                      data-t="n"
                      data-v={+total * 1.2}
                      className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+total * 1.2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Plus: 15% commission on lost fees serviced more than once
                    </td>
                    <td></td>
                    <td
                      data-t="n"
                      data-v={+commission}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+commission)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      Total to pay
                    </td>
                    <td></td>
                    <td
                      data-t="n"
                      data-v={+total * 1.2 + +commission}
                      className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+total * 1.2 + +commission)}
                    </td>
                  </tr>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                        Less: {transaction.comment}
                      </td>
                      <td></td>
                      <td
                        data-t="n"
                        data-v={+transaction.amount / -1}
                        className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                      >
                        {formatCurrency.format(+transaction.amount / -1)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      Remaining final payment
                    </td>
                    <td></td>
                    <td
                      data-t="n"
                      data-v={+total * 1.2 + +commission - +totalPayments}
                      className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(
                        +total * 1.2 + +commission - +totalPayments
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
