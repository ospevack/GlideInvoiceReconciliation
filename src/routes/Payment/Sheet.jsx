import Navbar from "../../components/navbar";
import { CheckCircleIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { utils, writeFileXLSX } from "xlsx";
import PaymentSubNav from "../../components/PaymentSubNav";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PaymentSheet() {
  const formatCurrency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  const [daybook, setDaybook] = useState([]);
  const [uniqueClientList, setuniqueClientList] = useState([]);
  const sheetTable = useRef(null);

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
    let uniqueClientList = [];
    daybook.forEach((item) => {
      if (!uniqueClientList.includes(item.xeroClientId)) {
        uniqueClientList.push(item.xeroClientId);
      }
    });
    setuniqueClientList(uniqueClientList);
  }, [daybook]);

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

  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="Payment" />
        <PaymentSubNav PageName={"Sheet"} />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Payment Sheet{" "}
                <button
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
                </button>
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
                  <span className=" px-2"></span>
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
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 pt-4">
              <table
                ref={sheetTable}
                className="w-full text-left table-fixed text-sm text-gray-900"
              >
                <thead>
                  <tr>
                    <td>Date</td>
                    <td>Number</td>
                    <td>Amount</td>
                    <td></td>
                    <td>Lost</td>
                    <td>OSA</td>
                    <td>New Business (Ltd)</td>
                  </tr>
                </thead>
                <tbody>
                  {uniqueClientList?.length > 0 &&
                    uniqueClientList.map((client) => (
                      <>
                        <tr className="border-b-2">
                          <td className="text-bold text-base" colspan={4}>
                            {clientLookup(client)} ({tagLookup(client)})
                          </td>
                        </tr>
                        {daybook
                          .filter((x) => x.xeroClientId === client)
                          .map((item) => (
                            <tr>
                              <td>
                                {new Date(item.date).toLocaleDateString(
                                  "en-GB"
                                )}
                              </td>
                              <td>{item.number}</td>
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
                              <td></td>
                              <td
                                data-t="n"
                                data-z="#,##0.00;(#,##0.00);0"
                                data-v={
                                  item.CalcGroup == "Lost"
                                    ? (+item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount) /
                                      -1
                                    : 0
                                }
                              >
                                {item.CalcGroup == "Lost"
                                  ? formatCurrency.format(
                                      (+item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount) /
                                        -1
                                    )
                                  : null}
                              </td>
                              <td
                                data-t="n"
                                data-z="#,##0.00;(#,##0.00);0"
                                data-v={
                                  item.CalcGroup == "OSA"
                                    ? (+item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount) /
                                      -1
                                    : 0
                                }
                              >
                                {item.CalcGroup == "OSA"
                                  ? formatCurrency.format(
                                      (+item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount) /
                                        -1
                                    )
                                  : null}
                              </td>
                              <td
                                data-t="n"
                                data-z="#,##0.00;(#,##0.00);0"
                                data-v={
                                  item.CalcGroup == "New-Ltd"
                                    ? (+item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount) /
                                      -1
                                    : 0
                                }
                              >
                                {item.CalcGroup == "New-Ltd"
                                  ? formatCurrency.format(
                                      (+item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount) /
                                        -1
                                    )
                                  : null}
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
                          <td>
                            {/*formatCurrency.format(
                              sumInvoices(
                                daybook.filter(
                                  (x) =>
                                    x.xeroClientId === client &&
                                    x.CalcGroup == "Lost"
                                )
                              ) / -1
                                )*/}
                          </td>
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
                      data-v={daybook.reduce((total, invoice) => {
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
                        daybook.reduce((total, invoice) => {
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
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={
                        daybook
                          .filter((x) => x.CalcGroup == "Lost")
                          .reduce((total, invoice) => {
                            return (
                              total +
                              +invoice.Fees +
                              +invoice.disb +
                              +invoice.adjustment +
                              +invoice.adjusting_amount
                            );
                          }, 0) / -1
                      }
                    >
                      {formatCurrency.format(
                        daybook
                          .filter((x) => x.CalcGroup == "Lost")
                          .reduce((total, invoice) => {
                            return (
                              total +
                              +invoice.Fees +
                              +invoice.disb +
                              +invoice.adjustment +
                              +invoice.adjusting_amount
                            );
                          }, 0) / -1
                      )}
                    </td>
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={
                        daybook
                          .filter((x) => x.CalcGroup == "OSA")
                          .reduce((total, invoice) => {
                            return (
                              total +
                              +invoice.Fees +
                              +invoice.disb +
                              +invoice.adjustment +
                              +invoice.adjusting_amount
                            );
                          }, 0) / -1
                      }
                    >
                      {formatCurrency.format(
                        daybook
                          .filter((x) => x.CalcGroup == "OSA")
                          .reduce((total, invoice) => {
                            return (
                              total +
                              +invoice.Fees +
                              +invoice.disb +
                              +invoice.adjustment +
                              +invoice.adjusting_amount
                            );
                          }, 0) / -1
                      )}
                    </td>
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={
                        daybook
                          .filter((x) => x.CalcGroup == "New-Ltd")
                          .reduce((total, invoice) => {
                            return (
                              total +
                              +invoice.Fees +
                              +invoice.disb +
                              +invoice.adjustment +
                              +invoice.adjusting_amount
                            );
                          }, 0) / -1
                      }
                    >
                      {formatCurrency.format(
                        daybook
                          .filter((x) => x.CalcGroup == "New-Ltd")
                          .reduce((total, invoice) => {
                            return (
                              total +
                              +invoice.Fees +
                              +invoice.disb +
                              +invoice.adjustment +
                              +invoice.adjusting_amount
                            );
                          }, 0) / -1
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
