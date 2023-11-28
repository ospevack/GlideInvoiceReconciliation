import { useState, useEffect, useRef } from "react";
import { utils, writeFileXLSX } from "xlsx";
import PaymentSubNav from "../../components/PaymentSubNav";
import Navbar from "../../components/navbar";
import { CheckCircleIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import axios from "axios";

export default function LostCommissions() {
  const sheetTable = useRef();
  const [daybook, setDaybook] = useState([]);
  const [lostCommissions, setLostCommissions] = useState([]);
  const [uniqueClients, setUniqueClients] = useState([]);

  const formatCurrency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

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
    setLostCommissions(
      daybook.filter((item) => item.clas_status == "15percent")
    );
  }, [daybook]);

  useEffect(() => {
    //console.log([...new Set(lostCommissions.map((item) => item.client_id))]);
    setUniqueClients([
      ...new Set(lostCommissions.map((item) => item.client_id)),
    ]);
  }, [lostCommissions]);

  // useEffect(() => {
  //   console.log(uniqueClients.map((item) => item));
  // }, [uniqueClients]);

  return (
    <div className="min-h-full">
      <Navbar PageName="Payment" />
      <PaymentSubNav PageName={"LostCommissions"} />
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Lost Commissions{" "}
              <button
                className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => {
                  // generate workbook from table element
                  const wb = utils.table_to_book(sheetTable.current);
                  // write to XLSX
                  writeFileXLSX(wb, "LostCommissions.xlsx");
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
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 pt-4">
            <table
              ref={sheetTable}
              className="w-full text-left table-auto text-sm text-gray-900"
            >
              <thead>
                <tr>
                  <td></td>
                  <td>Date</td>
                  <td>Inv. No</td>
                  <td>Fee</td>
                  <td>Adjustments</td>
                  <td>Net</td>
                  <td></td>
                  <td>15%</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {uniqueClients.length > 0 &&
                  uniqueClients.map((item) => (
                    <>
                      <tr className="text-lg text-bold border-t-2 border-indigo-600">
                        <td colspan={9}>
                          {
                            lostCommissions.find((x) => x.client_id == item)
                              .name
                          }
                          (
                          {
                            lostCommissions.find((x) => x.client_id == item)
                              .AccountNumber
                          }
                          )
                        </td>
                      </tr>
                      {lostCommissions
                        .filter((i) => i.client_id == item)
                        .map((i) => (
                          <>
                            <tr>
                              <td></td>
                              <td>
                                {new Date(i.date).toLocaleDateString("en-GB")}
                              </td>
                              <td>{i.number}</td>
                              <td
                                data-t="n"
                                data-z="#,##0.00 ;(#,##0.00); "
                                data-v={+i.Fees}
                              >
                                {formatCurrency.format(+i.Fees)}
                              </td>
                              <td
                                data-t="n"
                                data-z="#,##0.00 ;(#,##0.00); "
                                data-v={+i.adjustment + +i.adjusting_amount}
                              >
                                {formatCurrency.format(
                                  +i.adjustment + +i.adjusting_amount
                                )}
                              </td>
                              <td
                                data-t="n"
                                data-z="#,##0.00 ;(#,##0.00); "
                                data-v={
                                  +i.Fees + +i.adjustment + +i.adjusting_amount
                                }
                              >
                                {formatCurrency.format(
                                  +i.Fees + +i.adjustment + +i.adjusting_amount
                                )}
                              </td>
                              <td></td>
                              <td
                                data-t="n"
                                data-z="#,##0.00 ;(#,##0.00); "
                                data-v={
                                  (+i.Fees +
                                    +i.adjustment +
                                    +i.adjusting_amount) *
                                  0.15
                                }
                              >
                                {formatCurrency.format(
                                  (+i.Fees +
                                    +i.adjustment +
                                    +i.adjusting_amount) *
                                    0.15
                                )}
                              </td>
                              <td></td>
                            </tr>
                          </>
                        ))}
                      <tr>
                        <td colSpan={6}>Client Total</td>
                        <td
                          data-t="n"
                          data-z="#,##0.00 ;(#,##0.00); "
                          data-v={lostCommissions

                            .filter((i) => i.client_id == item)
                            .reduce(
                              (acc, item) =>
                                acc +
                                +item.Fees +
                                +item.adjustment +
                                +item.adjusting_amount,
                              0
                            )}
                        >
                          {formatCurrency.format(
                            lostCommissions

                              .filter((i) => i.client_id == item)
                              .reduce(
                                (acc, item) =>
                                  acc +
                                  +item.Fees +
                                  +item.adjustment +
                                  +item.adjusting_amount,
                                0
                              )
                          )}
                        </td>
                        <td></td>
                        <td
                          data-t="n"
                          data-z="#,##0.00 ;(#,##0.00); "
                          data-v={lostCommissions
                            .filter((i) => i.client_id == item)
                            .reduce(
                              (acc, item) =>
                                acc +
                                (+item.Fees +
                                  +item.adjustment +
                                  +item.adjusting_amount) *
                                  0.15,
                              0
                            )}
                        >
                          {formatCurrency.format(
                            lostCommissions
                              .filter((i) => i.client_id == item)
                              .reduce(
                                (acc, item) =>
                                  acc +
                                  (+item.Fees +
                                    +item.adjustment +
                                    +item.adjusting_amount) *
                                    0.15,
                                0
                              )
                          )}
                        </td>
                      </tr>
                    </>
                  ))}
              </tbody>
              <tfoot>
                <tr className="text-lg text-bold border-t-2 border-indigo-600">
                  <td colspan={6}>Total</td>
                  <td></td>

                  <td
                    data-t="n"
                    data-z="#,##0.00 ;(#,##0.00); "
                    data-v={lostCommissions.reduce(
                      (acc, item) =>
                        acc +
                        +item.Fees +
                        +item.adjustment +
                        +item.adjusting_amount,
                      0
                    )}
                  >
                    {lostCommissions.reduce(
                      (acc, item) =>
                        acc +
                        +item.Fees +
                        +item.adjustment +
                        +item.adjusting_amount,
                      0
                    )}
                  </td>
                  <td></td>

                  <td
                    data-t="n"
                    data-z="#,##0.00 ;(#,##0.00); "
                    data-v={lostCommissions.reduce(
                      (acc, item) =>
                        acc +
                        (+item.Fees +
                          +item.adjustment +
                          +item.adjusting_amount) *
                          0.15,
                      0
                    )}
                  >
                    {formatCurrency.format(
                      lostCommissions.reduce(
                        (acc, item) =>
                          acc +
                          (+item.Fees +
                            +item.adjustment +
                            +item.adjusting_amount) *
                            0.15,
                        0
                      )
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
