import Navbar from "../../components/navbar";
import { CheckCircleIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { utils, writeFileXLSX } from "xlsx";
import PaymentSubNav from "../../components/PaymentSubNav";
import FilterCalcGroups from "./Filter-CalcGroups";
import WidClassifyInvoice from "./Widget-ClassifyInvoice";
import FilterLineNumbers from "./Filter-ItemNumbers";
import { Switch } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ClassifyInvoices() {
  const formatCurrency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  const [daybook, setDaybook] = useState([]);
  const [uniqueClientList, setuniqueClientList] = useState([]);
  const [filteredUniqueClientList, setfilteredUniqueClientList] = useState([]);
  const [selectedCalcGroups, setSelectedCalcGroups] = useState([]);
  const [calcGroups, setCalcGroups] = useState([]);
  const sheetTable = useRef(null);
  const [linesFilter, setLinesFilter] = useState([]);
  const [lineNoMoreThan, setLineNoMoreThan] = useState(false);

  useEffect(() => {
    axios
      .get("/api/payment/all")
      .then((res) => {
        setDaybook(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    axios.get("/api/clients/calcgroups").then((res) => {
      var tempCalcGroups = res.data.map((item) => item.CalcGroup);
      tempCalcGroups.push("None");
      setCalcGroups(tempCalcGroups);
    });
  }, []);

  useEffect(() => {
    let uniqueClientList = [];
    daybook.forEach((item) => {
      if (!uniqueClientList.includes(item.xeroClientId)) {
        uniqueClientList.push(item.xeroClientId);
      }
    });
    setuniqueClientList(uniqueClientList);
  }, [daybook]);

  useEffect(() => {
    console.log(selectedCalcGroups);
    var tempFilteredUniqueClientList = uniqueClientList.filter((x) => {
      //console.log(x == null && selectedCalcGroups.includes("None"));
      return selectedCalcGroups.includes(
        daybook.find((y) => y.xeroClientId == x).CalcGroup ?? "None"
      );
    });
    setfilteredUniqueClientList(tempFilteredUniqueClientList);
  }, [selectedCalcGroups]);
  // useEffect(() => {
  //   console.log(filteredUniqueClientList);
  // }, [filteredUniqueClientList]);

  function clientLookup(client) {
    //console.log(daybook.find((x) => x.xeroClientId === client).name);
    return daybook.find((x) => x.xeroClientId === client).name;
  }

  function tagLookup(client) {
    //console.log(daybook.find((x) => x.xeroClientId === client).name);
    return daybook.find((x) => x.xeroClientId === client).CalcGroup;
  }

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

  function removeSelected(group) {
    setSelectedCalcGroups(selectedCalcGroups.filter((item) => item !== group));
  }

  const toggleCheckLine = async (item) => {
    axios
      .put(`/api/payment/togglecheck/${item}`, {
        checkLine: !item.checkLine,
      })
      .then((res) => {
        if (res.data.affectedRows == 1) {
          setDaybook(
            daybook.map((x) => {
              return x.daybook_id == item
                ? { ...x, checkLine: !x.checkLine }
                : x;
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const AddClassification = async (classify) => {
    axios
      .post("/api/payment/classification", {
        invoice_id: classify.invoice_id,
        status: classify.status,
        adj_reason: classify.adj_reason,
        adj_amount: classify.adj_amount,
        adhoc_amount: classify.adhoc_amount,
        adhoc_reason: classify.adhoc_reason,
        clas_Description: classify.Description,
      })
      .then((res) => {
        if (res.data.affectedRows == 1 && res.data.insertId > 0) {
          setDaybook(
            daybook.map((item) => {
              return item.daybook_id == classify.invoice_id
                ? {
                    ...item,
                    clas_amount: classify.adj_amount,
                    clas_reason: classify.adj_reason,
                    adhoc_amount: classify.adhoc_amount,
                    adhoc_reason: classify.adhoc_reason,
                    clas_status: classify.status,
                    clas_Description: classify.Description,
                    clas_amended: true,
                  }
                : item;
            })
          );
        }
      })

      .catch((err) => {
        console.log(err);
      });
  };

  const RemoveClassification = async (invoiceId) => {
    axios
      .delete(`/api/payment/classification/${invoiceId}`)
      .then((res) => {
        if (res.data.affectedRows == 1) {
          setDaybook(
            daybook.map((item) => {
              return item.daybook_id == invoiceId
                ? {
                    ...item,
                    clas_amount: null,
                    clas_reason: null,
                    clas_status: null,
                    adhoc_amount: null,
                    adhoc_reason: null,
                    clas_Description: null,
                    clas_amended: true,
                  }
                : item;
            })
          );
        }

        //console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="Payment" />
        <PaymentSubNav PageName={"ClassifyInvoices"} />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Classify Invoices{" "}
                {/* <button
                  className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => {
                    // generate workbook from table element
                    const wb = utils.table_to_book(sheetTable.current);
                    // write to XLSX
                    writeFileXLSX(wb, "DaybookInvoices.xlsx");
                  }}
                >
                  Export XLSX
                  <TableCellsIcon
                    className="-mr-0.5 h-5 w-5"
                    aria-hidden="true"
                  />
                </button> */}
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
                    <FilterLineNumbers
                      label={"Line Numbers"}
                      value={linesFilter}
                      setValue={setLinesFilter}
                    />
                    <Switch.Group
                      as="div"
                      className="ml-auto text-sm flex items-center py-2"
                    >
                      <Switch
                        checked={lineNoMoreThan}
                        onChange={() => setLineNoMoreThan(!lineNoMoreThan)}
                        className={classNames(
                          lineNoMoreThan ? "bg-indigo-600" : "bg-gray-200",
                          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                        )}
                      >
                        <span className="sr-only">More/Less than</span>
                        <span
                          aria-hidden="true"
                          className={classNames(
                            lineNoMoreThan ? "translate-x-5" : "translate-x-0",
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          )}
                        />
                      </Switch>
                      <Switch.Label as="span" className="ml-3 text-sm">
                        <span className="font-sm text-gray-900">
                          Less/More than
                        </span>
                      </Switch.Label>
                    </Switch.Group>
                  </span>

                  <span className=" px-2">
                    <span>
                      <FilterCalcGroups
                        label={"Calc Groups"}
                        options={calcGroups}
                        selectedGroups={selectedCalcGroups}
                        setSelectedGroups={setSelectedCalcGroups}
                      />
                    </span>
                    <span className="ml-auto flex items-center text-sm py-2">
                      <span className="flex mr-2 rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100">
                        <button onClick={() => setSelectedCalcGroups([])}>
                          clear all
                        </button>
                      </span>
                      <span>
                        <button
                          className="flex rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
                          onClick={() => setSelectedCalcGroups(calcGroups)}
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
                  {selectedCalcGroups.length > 1 && (
                    <span className="flex flex-wrap">
                      <span className="flex text-xs p-2">Sheets:</span>
                      {selectedCalcGroups.map((group) => (
                        <span className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {group}
                          <button
                            type="button"
                            className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
                            onClick={() => removeSelected(group)}
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
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 pt-4">
              <table
                ref={sheetTable}
                className="w-full text-left table-auto text-sm text-gray-900"
              >
                <thead>
                  <tr>
                    <td>Date</td>
                    <td>Number</td>
                    <td>Amount</td>
                    <td></td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {filteredUniqueClientList?.length > 0 &&
                    filteredUniqueClientList.map((client) => (
                      <>
                        <tr key={client} className="border-b-2">
                          <td className="text-bold text-base" colSpan={4}>
                            <a
                              href={`https://go.xero.com/app/!Pb2XD/contacts/contact/${
                                client ?? null
                              }`}
                              target="_blank"
                              className="underline text-gray-600 visited:text-purple-600 hover:text-gray-900"
                            >
                              {clientLookup(client)} ({tagLookup(client)})
                            </a>
                          </td>
                        </tr>
                        {(daybook.filter((x) => x.xeroClientId === client)
                          .length >= +linesFilter &&
                          lineNoMoreThan == true) ||
                        linesFilter == 0
                          ? daybook
                              .filter((x) => x.xeroClientId === client)
                              .map((item) => (
                                <tr key={item.daybook_id}>
                                  <td>
                                    {new Date(item.date).toLocaleDateString(
                                      "en-GB"
                                    )}
                                  </td>
                                  <td>
                                    <a
                                      className="underline text-gray-600 visited:text-purple-600 hover:text-gray-900"
                                      href={`https://go.xero.com/app/!Pb2XD/invoicing/view/${item.xeroInvoiceId}`}
                                      target="_blank"
                                    >
                                      {item.number}{" "}
                                      {item.adj_id ? `(${item.adj_id})` : null}
                                    </a>
                                  </td>
                                  <td
                                    data-t="n"
                                    data-z="#,##0.00;(#,##0.00);0"
                                    data-v={
                                      +item.Fees +
                                      +item.disb +
                                      +item.adjustment +
                                      +item.adjusting_amount
                                    }
                                  >
                                    {formatCurrency.format(
                                      +item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount
                                    )}
                                  </td>
                                  <td>
                                    <Switch
                                      checked={item.checkLine}
                                      onChange={() =>
                                        toggleCheckLine(item.daybook_id)
                                      }
                                      className={classNames(
                                        item.checkLine
                                          ? "bg-indigo-600"
                                          : "bg-gray-200",
                                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                                      )}
                                    >
                                      <span className="sr-only">Check</span>
                                      <span
                                        aria-hidden="true"
                                        className={classNames(
                                          item.checkLine
                                            ? "translate-x-5"
                                            : "translate-x-0",
                                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                        )}
                                      />
                                    </Switch>
                                  </td>
                                  <td>
                                    <WidClassifyInvoice
                                      invoice={item}
                                      AddClassification={AddClassification}
                                      RemoveClassification={
                                        RemoveClassification
                                      }
                                    />
                                  </td>
                                </tr>
                              ))
                          : daybook.filter((x) => x.xeroClientId === client)
                              .length <= +linesFilter &&
                            lineNoMoreThan == false &&
                            daybook
                              .filter((x) => x.xeroClientId === client)
                              .map((item) => (
                                <tr key={item.daybook_id}>
                                  <td>
                                    {new Date(item.date).toLocaleDateString(
                                      "en-GB"
                                    )}
                                  </td>
                                  <td>
                                    <a
                                      className="underline text-gray-600 visited:text-purple-600 hover:text-gray-900"
                                      href={`https://go.xero.com/app/!Pb2XD/invoicing/view/${item.xeroInvoiceId}`}
                                      target="_blank"
                                    >
                                      {item.number}
                                    </a>
                                  </td>
                                  <td
                                    data-t="n"
                                    data-z="#,##0.00;(#,##0.00);0"
                                    data-v={
                                      +item.Fees +
                                      +item.disb +
                                      +item.adjustment +
                                      +item.adjusting_amount
                                    }
                                  >
                                    {formatCurrency.format(
                                      +item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount
                                    )}
                                  </td>
                                  <td>
                                    <Switch
                                      checked={item.checkLine}
                                      onChange={() =>
                                        toggleCheckLine(item.daybook_id)
                                      }
                                      className={classNames(
                                        item.checkLine
                                          ? "bg-indigo-600"
                                          : "bg-gray-200",
                                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                                      )}
                                    >
                                      <span className="sr-only">Check</span>
                                      <span
                                        aria-hidden="true"
                                        className={classNames(
                                          item.checkLine
                                            ? "translate-x-5"
                                            : "translate-x-0",
                                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                        )}
                                      />
                                    </Switch>
                                  </td>
                                  <td>
                                    <WidClassifyInvoice
                                      invoice={item}
                                      AddClassification={AddClassification}
                                      RemoveClassification={
                                        RemoveClassification
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                        <tr className="border-t-2">
                          <td></td>
                          <td></td>
                          <td></td>
                          <td
                            data-t="n"
                            data-z="#,##0.00;(#,##0.00);0"
                            data-v={sumInvoices(
                              daybook.filter((x) => x.xeroClientId === client)
                            )}
                          >
                            {formatCurrency.format(
                              sumInvoices(
                                daybook.filter((x) => x.xeroClientId === client)
                              )
                            )}
                          </td>
                          <td></td>
                        </tr>
                      </>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="text-lg text-bold border-t-2 border-indigo-600">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={daybook
                        .filter((x) =>
                          filteredUniqueClientList.includes(x.xeroClientId)
                        )
                        .reduce((total, invoice) => {
                          return (
                            total +
                            +invoice.Fees +
                            +invoice.disb +
                            +invoice.adjustment +
                            +invoice.adjusting_amount
                          );
                        }, 0)}
                    >
                      {formatCurrency.format(
                        daybook
                          .filter((x) =>
                            filteredUniqueClientList.includes(x.xeroClientId)
                          )
                          .reduce((total, invoice) => {
                            return (
                              total +
                              +invoice.Fees +
                              +invoice.disb +
                              +invoice.adjustment +
                              +invoice.adjusting_amount
                            );
                          }, 0)
                      )}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
