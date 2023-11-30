import Navbar from "../../components/navbar";
import { CheckCircleIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { utils, writeFileXLSX } from "xlsx";
import PaymentSubNav from "../../components/PaymentSubNav";
import { Switch } from "@headlessui/react";

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
  const [totalInvoices, setTotalInvoices] = useState({
    total: 0,
    2022: 0,
    2023: 0,
  });
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
  const [disbursements, setDisbursements] = useState(0);
  const [cancelled, setCancelled] = useState(0);
  const [removeAdhoc, setRemoveAdhoc] = useState(false);

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
      sumInvoices(
        daybook.filter((invoice) => invoice.CalcGroup == "Lost"),
        true
      )
    );
    setOsaClients(
      sumInvoices(
        daybook.filter((invoice) => invoice.CalcGroup == "OSA"),
        true
      )
    );
    setLtdClients(
      sumInvoices(
        daybook.filter((invoice) => invoice.CalcGroup == "New-Ltd"),
        true
      )
    );
    setExcludedInvs(
      sumInvoices(
        daybook.filter(
          (invoice) =>
            checkExcludeStatus(invoice.clas_status) &&
            invoice.cancelled != 1 &&
            (invoice.CalcGroup == null || invoice.CalcGroup == "New-Referral")
        ),
        true
      )
    );
    setCommission(
      sumCommissionInvoices(
        daybook.filter(
          (invoice) =>
            invoice.CalcGroup == "Lost" && invoice.clas_status == "15percent"
        ),
        0.15
      )
    );
    setCancelled(
      sumInvoices(
        daybook.filter((invoice) => invoice.cancelled == 1),
        true
      )
    );
  }, [daybook]);
  useEffect(() => {
    setTotal({
      total: removeAdhoc
        ? +totalInvoices.total +
          +lostClients.total +
          +osaClients.total +
          +ltdClients.total +
          +excludedInvs.total +
          +cancelled.total +
          +adhocTotal.total * -1 +
          disbursements.total
        : +totalInvoices.total +
          +lostClients.total +
          +osaClients.total +
          +ltdClients.total +
          +excludedInvs.total +
          +cancelled.total +
          disbursements.total,
      2022: removeAdhoc
        ? +totalInvoices["2022"] +
          +lostClients["2022"] +
          +osaClients["2022"] +
          +ltdClients["2022"] +
          +excludedInvs["2022"] +
          +cancelled["2022"] +
          +adhocTotal["2022"] * -1 +
          disbursements["2022"]
        : +totalInvoices["2022"] +
          +lostClients["2022"] +
          +osaClients["2022"] +
          +ltdClients["2022"] +
          +excludedInvs["2022"] +
          +cancelled["2022"] +
          disbursements["2022"],
      2023: removeAdhoc
        ? +totalInvoices["2023"] +
          +lostClients["2023"] +
          +osaClients["2023"] +
          +ltdClients["2023"] +
          +excludedInvs["2023"] +
          +cancelled["2023"] +
          +adhocTotal["2023"] * -1 +
          disbursements["2023"]
        : +totalInvoices["2023"] +
          +lostClients["2023"] +
          +osaClients["2023"] +
          +ltdClients["2023"] +
          +excludedInvs["2023"] +
          +cancelled["2023"] +
          disbursements["2023"],
    });
  }, [
    totalInvoices,
    lostClients,
    osaClients,
    ltdClients,
    excludedInvs,
    disbursements,
    removeAdhoc,
  ]);
  useEffect(() => {
    setAdhocTotal({
      total:
        sumInvoices(
          daybook.filter(
            (invoice) =>
              invoice.clas_status == "adhoc" &&
              invoice.cancelled != 1 &&
              (invoice.CalcGroup == null || invoice.CalcGroup == "New-Referral")
          )
        ).total +
        sumAdhoc(
          daybook.filter(
            (invoice) =>
              invoice.adhoc_amount != null &&
              invoice.cancelled != 1 &&
              (invoice.CalcGroup == null || invoice.CalcGroup == "New-Referral")
          )
        ).total,
      2022:
        +sumInvoices(
          daybook.filter(
            (invoice) =>
              invoice.clas_status == "adhoc" &&
              invoice.cancelled != 1 &&
              (invoice.CalcGroup == null || invoice.CalcGroup == "New-Referral")
          )
        )["2022"] +
        +sumAdhoc(
          daybook.filter(
            (invoice) =>
              invoice.adhoc_amount != null &&
              invoice.cancelled != 1 &&
              (invoice.CalcGroup == null || invoice.CalcGroup == "New-Referral")
          )
        )["2022"],
      2023:
        sumInvoices(
          daybook.filter(
            (invoice) =>
              invoice.clas_status == "adhoc" &&
              invoice.cancelled != 1 &&
              (invoice.CalcGroup == null || invoice.CalcGroup == "New-Referral")
          )
        )["2023"] +
        sumAdhoc(
          daybook.filter(
            (invoice) =>
              invoice.adhoc_amount != null &&
              invoice.cancelled != 1 &&
              (invoice.CalcGroup == null || invoice.CalcGroup == "New-Referral")
          )
        )["2023"],
    });

    setGrfAdjustments(
      sumGRFAdjustments(
        daybook.filter(
          (invoice) =>
            invoice.clas_amount != null &&
            invoice.cancelled != 1 &&
            (invoice.CalcGroup == null || invoice.CalcGroup == "New-Referral")
        )
      )
    );
    setDisbursements(
      sumDisbursements(
        daybook.filter(
          (invoice) =>
            invoice.clas_amount != null &&
            invoice.cancelled != 1 &&
            (invoice.CalcGroup == null || invoice.CalcGroup == "New-Referral")
        )
      )
    );
  }, [daybook]);

  useEffect(() => {
    setGrfTotal({
      total: removeAdhoc ? +total.total : +total.total - adhocTotal.total,
      2022: removeAdhoc ? +total["2022"] : +total["2022"] - adhocTotal["2022"],
      2023: removeAdhoc ? +total["2023"] : +total["2023"] - adhocTotal["2023"],
    });
  }, [total, adhocTotal, removeAdhoc]);

  useEffect(() => {
    setTotalPayments(
      transactions.reduce((total, transaction) => {
        return total + +transaction.amount;
      }, 0)
    );
  }, [transactions]);

  function checkSheet(sheet) {
    //console.log(sheet);
    return sheet == "Nov-21" ||
      sheet == "Dec-21" ||
      sheet == "Jan-22" ||
      sheet == "Feb-22" ||
      sheet == "mar-22" ||
      sheet == "Apr-22" ||
      sheet == "May-22" ||
      sheet == "Jun-22" ||
      sheet == "Jul-22" ||
      sheet == "Aug-22" ||
      sheet == "Sept-22" ||
      sheet == "Oct-22"
      ? "2022"
      : "2023";
  }

  function sumInvoices(invoices, negate = false) {
    var total = invoices.reduce((total, invoice) => {
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
    var p22 = invoices
      .filter((x) => checkSheet(x.sheet) == "2022")
      .reduce((total, invoice) => {
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
    var p23 = invoices
      .filter((x) => checkSheet(x.sheet) == "2023")
      .reduce((total, invoice) => {
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

    return negate
      ? { total: +total / -1, 2022: +p22 / -1, 2023: +p23 / -1 }
      : { total: +total, 2022: +p22, 2023: +p23 };
  }

  function sumCommissionInvoices(invoices, percentage) {
    var total = invoices.reduce((total, invoice) => {
      /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
      return (
        total + +invoice.Fees + +invoice.adjustment + +invoice.adjusting_amount
      );
    }, 0);
    var p22 = invoices
      .filter((x) => checkSheet(x.sheet) == "2022")
      .reduce((total, invoice) => {
        /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
        return (
          total +
          +invoice.Fees +
          +invoice.adjustment +
          +invoice.adjusting_amount
        );
      }, 0);
    var p23 = invoices
      .filter((x) => checkSheet(x.sheet) == "2023")
      .reduce((total, invoice) => {
        /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
        return (
          total +
          +invoice.Fees +
          +invoice.adjustment +
          +invoice.adjusting_amount
        );
      }, 0);

    return {
      total: total * percentage,
      2022: p22 * percentage,
      2023: p23 * percentage,
    };
  }

  function sumAdhoc(invoices) {
    var total = invoices.reduce((total, invoice) => {
      /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
      return total + +invoice.adhoc_amount;
    }, 0);
    var p22 = invoices
      .filter((x) => checkSheet(x.sheet) == "2022")
      .reduce((total, invoice) => {
        /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
        return total + +invoice.adhoc_amount;
      }, 0);
    var p23 = invoices
      .filter((x) => checkSheet(x.sheet) == "2023")
      .reduce((total, invoice) => {
        /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
        return total + +invoice.adhoc_amount;
      }, 0);
    return { total: total, 2022: p22, 2023: p23 };
  }
  function sumGRFAdjustments(invoices) {
    var total = invoices.reduce((total, invoice) => {
      /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
      return total - +invoice.clas_amount - +invoice.adhoc_amount;
    }, 0);
    var p22 = invoices
      .filter((x) => checkSheet(x.sheet) == "2022")
      .reduce((total, invoice) => {
        /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
        return total - +invoice.clas_amount - +invoice.adhoc_amount;
      }, 0);
    var p23 = invoices
      .filter((x) => checkSheet(x.sheet) == "2023")
      .reduce((total, invoice) => {
        /*return total + invoices.adjusting_document == "daybook"
        ? +invoice.adjusting_amount
        : +invoice.adjusting_amount / -1;*/
        return total - +invoice.clas_amount - +invoice.adhoc_amount;
      }, 0);
    return { total: total, 2023: p22, 2023: p23 };
  }

  function sumDisbursements(invoices) {
    var total = invoices.reduce((total, invoice) => {
      return total + +invoice.clas_amount + +invoice.adhoc_amount;
    }, 0);
    var p22 = invoices
      .filter((x) => checkSheet(x.sheet) == "2022")
      .reduce((total, invoice) => {
        return total + +invoice.clas_amount + +invoice.adhoc_amount;
      }, 0);
    var p23 = invoices
      .filter((x) => checkSheet(x.sheet) == "2023")
      .reduce((total, invoice) => {
        return total + +invoice.clas_amount + +invoice.adhoc_amount;
      }, 0);
    return { total: total, 2022: p22, 2023: p23 };
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
                    writeFileXLSX(wb, "PaymentSummary.xlsx");
                  }}
                >
                  Export XLSX
                  <TableCellsIcon
                    className="-mr-0.5 h-5 w-5"
                    aria-hidden="true"
                  />
                </button>
                <Switch.Group
                  as="div"
                  className="ml-auto text-sm flex items-center py-2"
                >
                  <Switch
                    checked={removeAdhoc}
                    onChange={() => setRemoveAdhoc(!removeAdhoc)}
                    className={classNames(
                      removeAdhoc ? "bg-indigo-600" : "bg-gray-200",
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                    )}
                  >
                    <span className="sr-only">Remove Adhoc</span>
                    <span
                      aria-hidden="true"
                      className={classNames(
                        removeAdhoc ? "translate-x-5" : "translate-x-0",
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      )}
                    />
                  </Switch>
                  <Switch.Label as="span" className="ml-3 text-sm">
                    <span className="font-sm text-gray-900">Remove Adhoc</span>
                  </Switch.Label>
                </Switch.Group>
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
                      2022 £
                    </th>
                    <th className="w-1/12 px-2 py-2 font-semibold text-gray-900 bg-gray-100 border-b border-gray-200">
                      2022 £
                    </th>
                    <th className="w-1/12 px-2 py-2 font-semibold text-gray-900 bg-gray-100 border-b border-gray-200">
                      2023 £
                    </th>
                    <th className="w-1/12 px-2 py-2 font-semibold text-gray-900 bg-gray-100 border-b border-gray-200">
                      2023 £
                    </th>
                    <th className="w-1/12 px-2 py-2 font-semibold text-gray-900 bg-gray-100 border-b border-gray-200">
                      Total £
                    </th>
                    <th className="w-1/12 px-2 py-2 font-semibold text-gray-900 bg-gray-100 border-b border-gray-200">
                      Total £
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/*Total invoices per Daybook*/}

                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Total invoices per Daybook
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+totalInvoices["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(+totalInvoices["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+totalInvoices["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(+totalInvoices["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+totalInvoices.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(totalInvoices.total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: Cancelled invoices (not sent but left in daybook)
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+cancelled["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(+cancelled["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+cancelled["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(+cancelled["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+cancelled.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(cancelled.total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: Lost Clients
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+lostClients["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(+lostClients["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+lostClients["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(+lostClients["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+lostClients.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(lostClients.total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: OSA Clients
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+osaClients["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(+osaClients["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+osaClients["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(+osaClients["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+osaClients.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(osaClients.total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: New Ltd Co Clients
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+ltdClients["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(+ltdClients["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+ltdClients["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(+ltdClients["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+ltdClients.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(ltdClients.total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      Remaining invoices
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={
                        +(+totalInvoices["2022"]) +
                        +lostClients["2022"] +
                        +osaClients["2022"] +
                        +ltdClients["2022"]
                      }
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(
                        +totalInvoices["2022"] +
                          +lostClients["2022"] +
                          +osaClients["2022"] +
                          +ltdClients["2022"]
                      )}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={
                        +(+totalInvoices["2023"]) +
                        +lostClients["2023"] +
                        +osaClients["2023"] +
                        +ltdClients["2023"]
                      }
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(
                        +totalInvoices["2023"] +
                          +lostClients["2023"] +
                          +osaClients["2023"] +
                          +ltdClients["2023"]
                      )}
                    </td>

                    <td
                      data-t="n"
                      data-v={+ltdClients["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    ></td>
                    <td
                      data-t="n"
                      data-v={
                        +(+totalInvoices.total) +
                        +lostClients.total +
                        +osaClients.total +
                        +ltdClients.total
                      }
                      className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(
                        +totalInvoices.total +
                          +lostClients.total +
                          +osaClients.total +
                          +ltdClients.total
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: Excluded/Superceded invoices
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+excludedInvs["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(+excludedInvs["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+excludedInvs["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(+excludedInvs["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+excludedInvs.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(excludedInvs.total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Less: Disbursements
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+disbursements["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(+disbursements["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+disbursements["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(+disbursements["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+disbursements.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(disbursements.total)}
                    </td>
                  </tr>
                  {removeAdhoc && (
                    <tr>
                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                        Less: Adhoc greater than £30,000
                      </td>
                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                        {/*2022*/}
                      </td>
                      <td
                        data-t="n"
                        data-v={+adhocTotal["2022"]}
                        className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                      >
                        {formatCurrency.format(+adhocTotal["2022"] / -1)}
                      </td>

                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                        {/*2023*/}
                      </td>
                      <td
                        data-t="n"
                        data-v={+adhocTotal["2023"]}
                        className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                      >
                        {formatCurrency.format(+adhocTotal["2023"] / -1)}
                      </td>
                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                      <td
                        data-t="n"
                        data-v={+adhocTotal.total}
                        className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                      >
                        {formatCurrency.format(+adhocTotal.total / -1)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      Total invoices subject to multiple
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+total["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(+total["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+total["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(+total["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+total.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(total.total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      GRF
                    </td>

                    <td
                      data-t="n"
                      data-v={+grfTotal["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+grfTotal["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+grfTotal["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+grfTotal["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+grfTotal.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+grfTotal.total)}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                  </tr>

                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Adhoc
                    </td>
                    <td
                      data-t="n"
                      data-v={+adhocTotal["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+adhocTotal["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+adhocTotal["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+adhocTotal["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+adhocTotal.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(+adhocTotal.total)}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Multiple
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={1.2}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      1.2
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={1.2}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      1.2
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={1.2}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      1.2
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      Sub-Total (multiple applied)
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+total["2022"] * 1.2}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(+total["2022"] * 1.2)}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+total["2023"] * 1.2}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(+total["2023"] * 1.2)}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+total.total * 1.2}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(total.total * 1.2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      Plus: 15% commission on lost fees serviced more than once
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2022*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+commission["2022"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2022*/}
                      {formatCurrency.format(+commission["2022"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>

                    <td
                      data-t="n"
                      data-v={+commission["2023"]}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {/*2023*/}
                      {formatCurrency.format(+commission["2023"])}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+commission.total}
                      className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(commission.total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200">
                      Total to pay
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+total["2022"] * 1.2 + +commission["2022"]}
                      className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {" "}
                      {/*2022*/}
                      {formatCurrency.format(
                        +total["2022"] * 1.2 + +commission["2022"]
                      )}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                      {/*2023*/}
                    </td>
                    <td
                      data-t="n"
                      data-v={+total["2023"] * 1.2 + +commission["2023"]}
                      className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {" "}
                      {/*2023*/}
                      {formatCurrency.format(
                        +total["2023"] * 1.2 + +commission["2023"]
                      )}
                    </td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={+total.total * 1.2 + +commission.total}
                      className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(
                        +total.total * 1.2 + +commission.total
                      )}
                    </td>
                  </tr>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200">
                        Less: {transaction.comment}
                      </td>
                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                      <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
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
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td className="w-1/12 px-2 py-2 text-gray-900 border-b border-gray-200"></td>
                    <td
                      data-t="n"
                      data-v={
                        +total.total * 1.2 + +commission.total - +totalPayments
                      }
                      className="w-1/12 px-2 py-2 font-semibold text-gray-900 border-b border-gray-200"
                    >
                      {formatCurrency.format(
                        +total.total * 1.2 + +commission.total - +totalPayments
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
