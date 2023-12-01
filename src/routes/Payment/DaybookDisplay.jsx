import Navbar from "../../components/navbar";
import { CheckCircleIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { utils, writeFileXLSX } from "xlsx";
import PaymentSubNav from "../../components/PaymentSubNav";
import FilterCalcGroups from "./Filter-CalcGroups";
import FilterPartners from "./Filter-Partners";
import { Switch } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DaybookPaymentSheet() {
  const formatCurrency = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [daybook, setDaybook] = useState([]);
  const [firstDaybook, setFirstDaybook] = useState([]);
  const [secondDaybook, setSecondDaybook] = useState([]);
  const [selectedCalcGroups, setSelectedCalcGroups] = useState([]);
  const sheetTable = useRef(null);
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [includedOnly, setIncludedOnly] = useState(false);
  const [calcGroups, setCalcGroups] = useState([]);

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
    setFirstDaybook(daybook.filter((item) => checkSheet(item.sheet) == "2022"));
    setSecondDaybook(
      daybook.filter((item) => checkSheet(item.sheet) == "2023")
    );
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

  function sumDisbursements(invoices) {
    return invoices.reduce((total, invoice) => {
      return total + +invoice.clas_amount + +invoice.adhoc_amount;
    }, 0);
  }

  function removeSelected(group) {
    setSelectedCalcGroups(selectedCalcGroups.filter((item) => item !== group));
  }

  function removeSelectedPartner(group) {
    setSelectedPartners(selectedPartners.filter((item) => item !== group));
  }

  function checkExcludeStatus(status) {
    return status == "include" ? false : status == "adhoc" ? false : true;
  }

  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="Payment" />
        <PaymentSubNav PageName={"DaybookFormat"} />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Daybook Payment Sheet{" "}
                <button
                  className="ml-4 inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-400 hover:text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => {
                    // generate workbook from table element
                    const wb = utils.table_to_book(sheetTable.current);
                    // write to XLSX
                    writeFileXLSX(wb, "DaybookPayment.xlsx");
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
                  {/* <span className=" px-2">
                    <span>
                      <FilterPartners
                        label={"Partner"}
                        options={partners}
                        selectedPartners={selectedPartners}
                        setSelectedPartners={setSelectedPartners}
                      />
                    </span>
                    <span className="ml-auto flex items-center text-sm">
                      <span className="flex rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100">
                        <button onClick={() => setSelectedPartners([])}>
                          clear all
                        </button>
                      </span>
                      <span>
                        <button
                          className="flex rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
                          onClick={() =>
                            setSelectedPartners(partners.map((p) => p.ID))
                          }
                        >
                          select all
                        </button>
                      </span>
                    </span>
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
                    <span className="ml-auto flex items-center text-sm">
                      <span className="flex rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100">
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
                  <span className="px-2">
                    <Switch.Group
                      as="div"
                      className="ml-auto text-sm flex items-center py-2"
                    >
                      <Switch
                        checked={includedOnly}
                        onChange={() => setIncludedOnly(!includedOnly)}
                        className={classNames(
                          includedOnly ? "bg-indigo-600" : "bg-gray-200",
                          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                        )}
                      >
                        <span className="sr-only">More/Less than</span>
                        <span
                          aria-hidden="true"
                          className={classNames(
                            includedOnly ? "translate-x-5" : "translate-x-0",
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          )}
                        />
                      </Switch>
                      <Switch.Label as="span" className="ml-3 text-sm">
                        <span className="font-sm text-gray-900">
                          Included only
                        </span>
                      </Switch.Label>
                    </Switch.Group>
                  </span> */}
                </div>
              </div>
              <div className="border-2 border-indigo-600 rounded-md p-4">
                <div className="flex flex-wrap items-center">
                  <span className="px-2 flex-none text-xl font-medium text-gray-900">
                    Filters Applied
                  </span>
                  {/* {selectedCalcGroups.length > 1 && (
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
                  {selectedPartners.length > 1 && (
                    <span className="flex flex-wrap">
                      <span className="flex text-xs p-2">Partners:</span>
                      {selectedPartners.map((group) => (
                        <span className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {partners.find((x) => x.ID == group).Initials}
                          <button
                            type="button"
                            className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
                            onClick={() => removeSelectedPartner(group)}
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
                  )} */}
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-full sm:px-6 lg:px-8 pt-4">
              <table
                ref={sheetTable}
                className="w-full text-left table-auto text-sm text-gray-900"
              >
                <thead>
                  <tr>
                    <td
                      colSpan={17}
                      className="bg-indigo-600 text-white text-xl"
                    >
                      2021-2022 Daybook items
                    </td>
                  </tr>
                  <tr className="text-semibold text-base border-b-2 border-gray-400">
                    <td>Date</td>
                    <td>Type</td>
                    <td>Inv No</td>
                    <td>Client Code</td>
                    <td>Client</td>
                    <td className="text-right">Time</td>
                    <td className="text-right">Expenses</td>
                    <td className="text-right">Net</td>
                    <td></td>
                    <td className="text-right">Transfer and referrals</td>
                    <td className="text-right">New clients</td>
                    <td className="text-right">Disbursements</td>
                    <td className="text-right">Adhoc</td>
                    <td className="text-right">Done twice</td>
                    <td className="text-right">not paid over 9 months</td>
                    <td className="text-right">Gone</td>
                    <td className="text-right">OSA</td>
                  </tr>
                </thead>
                <tbody>
                  {/* firstDaybook */}

                  {firstDaybook
                    .filter((x) => !checkExcludeStatus(x.clas_status))
                    .map((item) => (
                      <tr>
                        <td>
                          {new Date(item.date).toLocaleDateString("en-GB")}
                        </td>
                        <td>{item.type}</td>
                        <td>{item.number}</td>
                        <td>{item.AccountNumber}</td>
                        <td>{item.name}</td>
                        <td
                          data-t="n"
                          data-z="#,##0.00 ;(#,##0.00);"
                          data-v={
                            +item.Fees +
                            +item.adjusting_amount +
                            +item.adjustment
                          }
                          className="text-right"
                        >
                          {formatCurrency.format(
                            +item.Fees +
                              +item.adjusting_amount +
                              +item.adjustment
                          )}
                        </td>
                        <td
                          data-t="n"
                          data-v={+item.disb}
                          data-x="#,##0.00 ;(#,##0.00);"
                          className="text-right"
                        >
                          {formatCurrency.format(+item.disb)}
                        </td>
                        <td
                          data-t="n"
                          data-v={
                            +item.Fees +
                            +item.adjusting_amount +
                            +item.adjustment +
                            +item.disb
                          }
                          data-z="#,##0.00 ;(#,##0.00);"
                          className="text-right"
                        >
                          {formatCurrency.format(
                            +item.Fees +
                              +item.adjustment +
                              +item.adjustment +
                              +item.disb
                          )}
                        </td>
                        <td></td>
                        <td
                          className="text-right"
                          data-t="n"
                          data-z="#,##0.00 ;(#,##0.00);"
                          data-v={
                            item.clas_status == "include" &&
                            +item.Fees +
                              +item.adjusting_amount +
                              +item.adjustment +
                              +item.disb
                          }
                        >
                          {/*Transfer and Referral*/}
                          {item.clas_status == "include" &&
                            formatCurrency.format(
                              +item.Fees +
                                +item.adjusting_amount +
                                +item.adjustment +
                                +item.disb
                            )}
                        </td>
                        <td
                          className="text-right"
                          data-t="n"
                          data-z="#,##0.00 ;(#,##0.00);"
                          data-v={
                            item.CalcGroup == "New-Ltd" &&
                            +item.Fees +
                              +item.adjusting_amount +
                              +item.adjustment +
                              +item.disb
                          }
                        >
                          {/*New clients*/}
                          {item.CalcGroup == "New-Ltd" &&
                            formatCurrency.format(
                              +item.Fees +
                                +item.adjusting_amount +
                                +item.adjustment +
                                +item.disb
                            )}
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  <tr className="text-semibold text-base border-t-2 border-gray-400">
                    <td colSpan={7}>2022 total</td>
                    <td className="text-right">
                      {formatCurrency.format(
                        sumInvoices(
                          firstDaybook.filter(
                            (x) => !checkExcludeStatus(x.clas_status)
                          )
                        )
                      )}
                    </td>
                    <td></td>
                    <td className="text-right">
                      {/*Transfer and Referral*/}
                      {formatCurrency.format(
                        sumInvoices(
                          firstDaybook.filter(
                            (x) =>
                              x.clas_status != null &&
                              x.clas_status == "include"
                          )
                        )
                      )}
                    </td>
                    <td className="text-right">
                      {/*New Clients*/}
                      {formatCurrency.format(
                        +sumInvoices(
                          firstDaybook.filter(
                            (x) =>
                              x.clas_status != null && x.CalcGroup == "New-Ltd"
                          )
                        )
                      )}
                    </td>
                    <td colSpan={6}></td>
                  </tr>
                </tbody>

                <thead>
                  <tr>
                    <td
                      colSpan={17}
                      className="bg-indigo-600 text-white text-xl"
                    >
                      2022-2023 Daybook items
                    </td>
                  </tr>
                  <tr>
                    <td>Date</td>
                    <td>Type</td>
                    <td>Inv No</td>
                    <td>Client Code</td>
                    <td>Client</td>
                    <td className="text-right">Time</td>
                    <td className="text-right">Expenses</td>
                    <td className="text-right">Net</td>
                    <td></td>
                    <td className="text-right">Transfer and referrals</td>
                    <td className="text-right">New clients</td>
                    <td className="text-right">Disbursements</td>
                    <td className="text-right">Adhoc</td>
                    <td className="text-right">Done twice</td>
                    <td className="text-right">not paid over 9 months</td>
                    <td className="text-right">Gone</td>
                    <td className="text-right">OSA</td>
                  </tr>
                </thead>
                <tbody>
                  {/* secondDaybook */}

                  {secondDaybook.map((item) => (
                    <tr>
                      <td>{new Date(item.date).toLocaleDateString("en-GB")}</td>
                      <td>{item.type}</td>
                      <td>{item.number}</td>
                      <td>{item.AccountNumber}</td>
                      <td>{item.name}</td>
                      <td
                        data-t="n"
                        data-z="#,##0.00 ;(#,##0.00);"
                        data-v={
                          +item.Fees + +item.adjusting_amount + +item.adjustment
                        }
                        className="text-right"
                      >
                        {formatCurrency.format(
                          +item.Fees + +item.adjusting_amount + +item.adjustment
                        )}
                      </td>
                      <td
                        data-t="n"
                        data-v={+item.disb}
                        data-x="#,##0.00 ;(#,##0.00);"
                        className="text-right"
                      >
                        {formatCurrency.format(+item.disb)}
                      </td>
                      <td
                        data-t="n"
                        data-v={
                          +item.Fees +
                          +item.adjusting_amount +
                          +item.adjusting_amount +
                          +item.disb
                        }
                        data-z="#,##0.00 ;(#,##0.00);"
                        className="text-right"
                      >
                        {formatCurrency.format(
                          +item.Fees +
                            +item.adjusting_amount +
                            +item.adjusting_amount +
                            +item.disb
                        )}
                      </td>
                      <td></td>
                      <td
                        className="text-right"
                        data-t="n"
                        data-z="#,##0.00 ;(#,##0.00);"
                        data-v={
                          item.clas_status == "include" &&
                          +item.Fees +
                            +item.adjusting_amount +
                            +item.adjusting_amount +
                            +item.disb
                        }
                      >
                        {/*Transfer and Referral*/}
                        {item.clas_status == "include" &&
                          formatCurrency.format(
                            +item.Fees +
                              +item.adjusting_amount +
                              +item.adjusting_amount +
                              +item.disb
                          )}
                      </td>
                      <td
                        className="text-right"
                        data-t="n"
                        data-z="#,##0.00 ;(#,##0.00);"
                        data-v={
                          item.CalcGroup == "New-Ltd" &&
                          +item.Fees +
                            +item.adjusting_amount +
                            +item.adjusting_amount +
                            +item.disb
                        }
                      >
                        {/*New clients*/}
                        {item.CalcGroup == "New-Ltd" &&
                          formatCurrency.format(
                            +item.Fees +
                              +item.adjusting_amount +
                              +item.adjusting_amount +
                              +item.disb
                          )}
                      </td>
                      <td
                        className="text-right"
                        data-t="n"
                        data-z="#,##0.00 ;(#,##0.00);"
                        data-v={
                          item.clas_status == "include" &&
                          +item.clas_amount - +item.adhoc_amount
                        }
                      >
                        {/*Dibursements*/}
                        {item.clas_status == "include" &&
                          formatCurrency.format(
                            +item.clas_amount - +item.adhoc_amount
                          )}
                      </td>
                      <td
                        className="text-right"
                        data-t="n"
                        data-z="#,##0.00 ;(#,##0.00);"
                        data-v={
                          item.clas_status == "include" &&
                          +item.clas_amount - +item.adhoc_amount
                        }
                      >
                        {/*Adhoc*/}
                        {+formatCurrency.format(
                          (item.clas_status == "include" &&
                            +item.adhoc_amount) +
                            +(
                              item.clas_status == "adhoc" &&
                              +item.Fees +
                                +item.adjusting_amount +
                                +item.adjusting_amount
                            )
                        ) ?? null}
                      </td>
                      <td>{/*Done Twice*/}</td>
                      <td>{/*9 months*/}</td>
                      <td>{/*Gone*/}</td>
                      <td>{/*OSA*/}</td>
                    </tr>
                  ))}
                  <tr className="text-semibold text-base border-t-2 border-gray-400">
                    <td colSpan={7}>2023 total</td>
                    <td className="text-right">
                      {formatCurrency.format(sumInvoices(secondDaybook))}
                    </td>
                    <td></td>
                    <td className="text-right">
                      {formatCurrency.format(
                        sumInvoices(
                          secondDaybook.filter(
                            (x) => x.clas_status == "include"
                          )
                        )
                      )}
                    </td>
                    <td className="text-right">
                      {/*New Clients*/}
                      {formatCurrency.format(
                        +sumInvoices(
                          secondDaybook.filter((x) => x.CalcGroup == "New-Ltd")
                        )
                      )}
                    </td>
                    <td className="text-right">
                      {/*Disbursements*/}
                      {formatCurrency.format(
                        +sumDisbursements(
                          secondDaybook.filter(
                            (x) => x.clas_status == "include"
                          )
                        )
                      )}
                    </td>
                    <td className="text-right">
                      {/*Adhoc*/}
                      {formatCurrency.format(
                        +sumDisbursements(
                          secondDaybook.filter(
                            (x) => x.clas_status == "include"
                          )
                        )
                      )}
                    </td>
                    <td colSpan={4}></td>
                  </tr>
                </tbody>
                <tfoot className="border-t-2 border-indigo-600 text-lg text-semibold">
                  <tr>
                    <td colSpan={7}>Total</td>
                    <td className="text-right">
                      {formatCurrency.format(
                        +sumInvoices(secondDaybook) +
                          sumInvoices(
                            firstDaybook.filter((x) => x.clas_status != null)
                          )
                      )}
                    </td>
                    <td></td>
                    <td className="text-right">
                      {/*Transfer and Referral*/}
                      {formatCurrency.format(
                        +sumInvoices(
                          secondDaybook.filter(
                            (x) => x.clas_status == "include"
                          )
                        ) +
                          sumInvoices(
                            firstDaybook.filter(
                              (x) => (x.clas_status = "include")
                            )
                          )
                      )}
                    </td>
                    <td className="text-right">
                      {/*New Clients*/}
                      {formatCurrency.format(
                        +sumInvoices(
                          secondDaybook.filter((x) => x.CalcGroup == "New-Ltd")
                        ) +
                          sumInvoices(
                            firstDaybook.filter(
                              (x) => (x.CalcGroup = "New-Ltd")
                            )
                          )
                      )}
                    </td>
                    <td className="text-right">
                      {/*Disbursements*/}
                      {formatCurrency.format(
                        +sumDisbursements(
                          secondDaybook.filter(
                            (x) => x.clas_status == "include"
                          )
                        ) +
                          sumDisbursements(
                            firstDaybook.filter(
                              (x) => (x.clas_status = "include")
                            )
                          )
                      )}
                    </td>
                    <td colSpan={5}></td>
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
