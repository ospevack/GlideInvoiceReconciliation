import Navbar from "../../components/Navbar";
import { TableCellsIcon } from "@heroicons/react/20/solid";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { utils, writeFileXLSX } from "xlsx";
import PaymentSubNav from "../../components/PaymentSubNav";
import FilterSheets from "./Filter-Sheets";
import dateFormat from "dateformat";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ScheduleSheet() {
  const formatCurrency = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function formatAccountingStyle(number) {
    const formattedNumber = formatCurrency.format(Math.abs(number));
    return number < 0 ? `(${formattedNumber})` : formattedNumber;
  }

  const [daybook, setDaybook] = useState([]);
  const [firstDaybook, setFirstDaybook] = useState([]);
  const [secondDaybook, setSecondDaybook] = useState([]);
  const SummaryTable = useRef(null);
  const DetailTable = useRef(null);
  const LostCommissionsTable = useRef(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [transactions, setTransactions] = useState([]);

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
    setFirstDaybook(daybook.filter((item) => checkSheet(item.sheet) == "2022"));
    setSecondDaybook(
      daybook.filter((item) => checkSheet(item.sheet) == "2023")
    );
    setSheets([...new Set(daybook.map((item) => item.sheet))]);
  }, [daybook]);

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

  const months = [
    { monthNo: 1, name: "November", shortName: "Nov", sheetName: "Nov-22" },
    { monthNo: 2, name: "December", shortName: "Dec", sheetName: "Dec-22" },
    { monthNo: 3, name: "January", shortName: "Jan", sheetName: "Jan-23" },
    { monthNo: 4, name: "February", shortName: "Feb", sheetName: "Feb-23" },
    { monthNo: 5, name: "March", shortName: "Mar", sheetName: "Mar-23" },
    { monthNo: 6, name: "April", shortName: "Apr", sheetName: "Apr-23" },
    { monthNo: 7, name: "May", shortName: "May", sheetName: "May-23" },
    { monthNo: 8, name: "June", shortName: "Jun", sheetName: "Jun-23" },
    { monthNo: 9, name: "July", shortName: "Jul", sheetName: "Jul-23" },
    { monthNo: 10, name: "August", shortName: "Aug", sheetName: "Aug-23" },
    { monthNo: 11, name: "September", shortName: "Sept", sheetName: "Sept-23" },
    { monthNo: 12, name: "October", shortName: "Oct", sheetName: "Oct-23" },
  ];

  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="Payment" />
        <PaymentSubNav PageName={"ScheduleFormat"} />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Schedule 2 - Summary
                <button
                  className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => {
                    // generate workbook from table element
                    const wb = utils.table_to_book(SummaryTable.current);
                    // write to XLSX
                    writeFileXLSX(wb, "ScheduleSummary.xlsx");
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <table
                ref={SummaryTable}
                className="w-full text-left table-fixed text-base text-gray-900"
              >
                <thead>
                  <tr className="text-semibold text-base border-b-2 border-indigo-400">
                    <td></td>
                    <td className="text-right">Fees</td>
                    <td className="text-right">Recurring</td>
                    <td className="text-right">Adhoc</td>
                    <td className="text-right">Ex clients</td>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td>
                      2022 Invoices that have not yet been repeated in 2023
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        firstDaybook
                          .filter((x) => x.status_check == 1)
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Fee;
                          }, 0)
                      )}
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        firstDaybook
                          .filter(
                            (x) =>
                              x.clas_status == "include" && x.status_check == 1
                          )
                          .reduce((total, invoice) => {
                            return (
                              +total + +invoice.Total_Fee - +invoice.Total_Adhoc
                            );
                          }, 0)
                      )}
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        firstDaybook
                          .filter((x) => {
                            return (
                              x.status_check == 1 &&
                              (x.clas_status == "include" ||
                                x.clas_status == "adhoc")
                            );
                          })
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Adhoc;
                          }, 0)
                      )}
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        firstDaybook
                          .filter((x) => {
                            return x.CalcGroup == "Lost";
                          })
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Fee;
                          }, 0)
                      )}
                    </td>
                  </tr>
                  {months.map((month) => (
                    <tr className="border-b border-gray-100">
                      <td>{month.name}</td>
                      <td className="text-right">
                        {formatAccountingStyle(
                          secondDaybook
                            .filter(
                              (x) =>
                                x.sheet == month.sheetName &&
                                x.status_check == 1
                            )
                            .reduce((total, invoice) => {
                              return +total + +invoice.Total_Fee;
                            }, 0)
                        )}
                      </td>
                      <td className="text-right">
                        {formatAccountingStyle(
                          secondDaybook
                            .filter(
                              (x) =>
                                x.clas_status == "include" &&
                                x.sheet == month.sheetName &&
                                x.status_check == 1
                            )
                            .reduce((total, invoice) => {
                              return (
                                +total +
                                +invoice.Total_Fee -
                                +invoice.Total_Adhoc
                              );
                            }, 0)
                        )}
                      </td>
                      <td className="text-right">
                        {formatAccountingStyle(
                          secondDaybook
                            .filter((x) => {
                              return (
                                x.status_check == 1 &&
                                x.sheet == month.sheetName &&
                                (x.clas_status == "include" ||
                                  x.clas_status == "adhoc")
                              );
                            })
                            .reduce((total, invoice) => {
                              return +total + +invoice.Total_Adhoc;
                            }, 0)
                        )}
                      </td>
                      <td className="text-right">
                        {formatAccountingStyle(
                          secondDaybook
                            .filter((x) => {
                              return (
                                x.CalcGroup == "Lost" &&
                                x.sheet == month.sheetName
                              );
                            })
                            .reduce((total, invoice) => {
                              return +total + invoice.Total_Fee;
                            }, 0)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-indigo-400">
                    <td></td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        daybook
                          .filter((x) => x.status_check == 1)
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Fee;
                          }, 0)
                      )}
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.clas_status == "include" && x.status_check == 1
                          )
                          .reduce((total, invoice) => {
                            return (
                              +total + +invoice.Total_Fee - +invoice.Total_Adhoc
                            );
                          }, 0)
                      )}
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.status_check == 1 &&
                              (x.clas_status == "include" ||
                                x.clas_status == "adhoc")
                          )
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Adhoc;
                          }, 0)
                      )}
                    </td>
                    <td className="text-right ">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) => x.CalcGroup == "Lost" && x.status_check == 1
                          )
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Fee;
                          }, 0)
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="border-t-2 border-indigo-400">
                      x1.2
                    </td>
                    <td className="text-right border-t-2 border-indigo-400">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.clas_status == "include" && x.status_check == 1
                          )
                          .reduce((total, invoice) => {
                            return (
                              +total + +invoice.Total_Fee - +invoice.Total_Adhoc
                            );
                          }, 0) * 1.2
                      )}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>Plus: adhoc x 2 years</td>
                    <td></td>
                    <td className="text-right">
                      {formatAccountingStyle(6000)}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      Plus: 15% commission on lost fees serviced more than once
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.status_check == 1 &&
                              x.clas_status == "15percent"
                          )
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Fee * 0.15;
                          }, 0)
                      )}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="border-t-2 border-indigo-400">
                      Total
                    </td>
                    <td className="text-right border-t-2 border-indigo-400">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.clas_status == "include" && x.status_check == 1
                          )
                          .reduce((total, invoice) => {
                            return (
                              +total + +invoice.Total_Fee - +invoice.Total_Adhoc
                            );
                          }, 0) *
                          1.2 +
                          6000 +
                          daybook
                            .filter(
                              (x) =>
                                x.status_check == 1 &&
                                x.clas_status == "15percent"
                            )
                            .reduce((total, invoice) => {
                              return +total + +invoice.Total_Fee * 0.15;
                            }, 0)
                      )}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  {transactions.map((transaction) => (
                    <tr>
                      <td colSpan={2}>
                        Less: ({transaction.type}) {transaction.comment}
                      </td>
                      <td className="text-right">
                        {formatAccountingStyle(transaction.amount / -1)}
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} className="border-t-2 border-indigo-400">
                      Total to pay/(due back)
                    </td>
                    <td className="text-right border-t-2 border-indigo-400">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.clas_status == "include" && x.status_check == 1
                          )
                          .reduce((total, invoice) => {
                            return (
                              +total + +invoice.Total_Fee - +invoice.Total_Adhoc
                            );
                          }, 0) *
                          1.2 +
                          6000 +
                          daybook
                            .filter(
                              (x) =>
                                x.status_check == 1 &&
                                x.clas_status == "15percent"
                            )
                            .reduce((total, invoice) => {
                              return +total + +invoice.Total_Fee * 0.15;
                            }, 0) -
                          transactions.reduce((total, transaction) => {
                            return +total + +transaction.amount;
                          }, 0)
                      )}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="border-2 border-indigo-600 rounded-md my-4 p-4">
                <div className="flex flex-wrap items-start">
                  <span className="px-2 flex-none text-xl font-medium text-gray-900">
                    Filters
                  </span>
                  <span className=" px-2">
                    <span>
                      <FilterSheets
                        label={"Sheet"}
                        options={sheets}
                        selectedSheets={selectedSheets}
                        setSelectedSheets={setSelectedSheets}
                      />
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
                            setSelectedSheets(sheets.map((p) => p))
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
                      {selectedSheets.map((group) => (
                        <span className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {group}
                          <button
                            type="button"
                            className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
                            onClick={() => removeSelectedSheets(group)}
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Schedule 2{" "}
                <button
                  className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => {
                    // generate workbook from table element
                    const wb = utils.table_to_book(DetailTable.current);
                    // write to XLSX
                    writeFileXLSX(wb, "Schedule.xlsx");
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <table
                ref={DetailTable}
                className="w-full text-left table-fixed text-base text-gray-900"
              >
                <thead>
                  <tr className="text-semibold text-base border-b-2 border-indigo-400">
                    <td>Inv Date</td>
                    <td>Inv No</td>
                    <td>Client</td>
                    <td className="text-right">Fees</td>
                    <td className="text-right">Recurring</td>
                    <td className="text-right">Adhoc</td>
                    <td className="text-right">Ex clients</td>
                  </tr>
                </thead>
                <tbody>
                  {daybook
                    .filter(
                      (x) =>
                        x.status_check == 1 && selectedSheets.includes(x.sheet)
                    )
                    .map((inv) => (
                      <tr className="border-b border-gray-100">
                        <td>{dateFormat(new Date(inv.date), "dd mmm yy")}</td>
                        <td>{inv.number}</td>
                        <td>{inv.name}</td>
                        <td className="text-right">
                          {formatAccountingStyle(+inv.Total_Fee)}
                        </td>
                        <td className="text-right">
                          {formatAccountingStyle(
                            inv.CalcGroup != "Lost"
                              ? +inv.Total_Fee - +inv.Total_Adhoc
                              : null
                          )}
                        </td>
                        <td className="text-right">
                          {formatAccountingStyle(
                            inv.CalcGroup != "Lost" ? +inv.Total_Adhoc : null
                          )}
                        </td>
                        <td className="text-right">
                          {formatAccountingStyle(
                            inv.CalcGroup == "Lost" ? +inv.Total_Fee : null
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-indigo-400">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.status_check == 1 &&
                              selectedSheets.includes(x.sheet)
                          )
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Fee;
                          }, 0)
                      )}
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.clas_status == "include" &&
                              x.status_check == 1 &&
                              selectedSheets.includes(x.sheet)
                          )
                          .reduce((total, invoice) => {
                            return (
                              +total + +invoice.Total_Fee - +invoice.Total_Adhoc
                            );
                          }, 0)
                      )}
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              selectedSheets.includes(x.sheet) &&
                              x.status_check == 1 &&
                              (x.clas_status == "include" ||
                                x.clas_status == "adhoc")
                          )
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Adhoc;
                          }, 0)
                      )}
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.CalcGroup == "Lost" &&
                              x.status_check == 1 &&
                              selectedSheets.includes(x.sheet)
                          )
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Fee;
                          }, 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Schedule 2 - Lost Commissions{" "}
                <button
                  className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => {
                    // generate workbook from table element
                    const wb = utils.table_to_book(
                      LostCommissionsTable.current
                    );
                    // write to XLSX
                    writeFileXLSX(wb, "LostCommissionsSchedule.xlsx");
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <table
                ref={LostCommissionsTable}
                className="w-full text-left table-fixed text-base text-gray-900"
              >
                <thead>
                  <tr className="text-semibold text-base border-b-2 border-indigo-400">
                    <td>Inv Date</td>
                    <td>Inv No</td>
                    <td>Client</td>
                    <td className="text-right">Fees</td>
                    <td className="text-right">15%</td>
                  </tr>
                </thead>
                <tbody>
                  {daybook
                    .filter(
                      (x) =>
                        x.status_check == 1 &&
                        x.clas_status == "15percent" &&
                        selectedSheets.includes(x.sheet)
                    )
                    .map((inv) => (
                      <tr className="border-b border-gray-100">
                        <td>{dateFormat(new Date(inv.date), "dd mmm yy")}</td>
                        <td>{inv.number}</td>
                        <td>{inv.name}</td>
                        <td className="text-right">
                          {formatAccountingStyle(+inv.Total_Fee)}
                        </td>
                        <td className="text-right">
                          {formatAccountingStyle(+inv.Total_Fee * 0.15)}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-indigo-400">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.status_check == 1 &&
                              x.clas_status == "15percent" &&
                              selectedSheets.includes(x.sheet)
                          )
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Fee;
                          }, 0)
                      )}
                    </td>
                    <td className="text-right">
                      {formatAccountingStyle(
                        daybook
                          .filter(
                            (x) =>
                              x.status_check == 1 &&
                              x.clas_status == "15percent" &&
                              selectedSheets.includes(x.sheet)
                          )
                          .reduce((total, invoice) => {
                            return +total + +invoice.Total_Fee * 0.15;
                          }, 0)
                      )}
                    </td>
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
