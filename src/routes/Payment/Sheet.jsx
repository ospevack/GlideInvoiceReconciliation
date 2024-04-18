import Navbar from "../../components/Navbar";
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

export default function PaymentSheet() {
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
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [partners, setPartners] = useState([]);
  const [includedOnly, setIncludedOnly] = useState(false);

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
    axios
      .get("/api/glide/users")
      .then((response) => {
        setPartners(
          response.data.Users.User.filter(
            (x) => x.Role.startsWith("Partner") || x.ID == "100010"
          )
        );
      })
      .catch((error) => {
        console.log(error);
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
    setfilteredUniqueClientList(
      uniqueClientList.filter((x) => {
        //console.log(x == null && selectedCalcGroups.includes("None"));
        return (
          selectedCalcGroups.includes(
            daybook.find((y) => y.xeroClientId == x).CalcGroup ?? "None"
          ) &&
          selectedPartners.includes(
            daybook.find((y) => y.xeroClientId == x).partner
          )
        );
      })
    );
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
                  <span className=" px-2">
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
                  )}
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
                    <td></td>
                    <td>Date</td>
                    <td>Number</td>
                    <td>Fees</td>
                    <td>Disb</td>
                    <td>Amount</td>
                    <td></td>
                    <td>Cancelled</td>
                    <td>Lost</td>
                    <td>OSA</td>
                    <td>New Business (Ltd)</td>
                    <td>Excluded/Superceded Inv</td>
                    <td>Invoice</td>
                    <td>Disb/Adjustments</td>
                    <td>Adhoc</td>
                    <td>Adhoc only inv</td>
                    <td>Description</td>
                    <td>Adj/Exclusion reason</td>
                    <td>Adhoc Desc</td>
                    <td>NK Commission Client</td>
                  </tr>
                </thead>
                <tbody>
                  {filteredUniqueClientList?.length > 0 &&
                    filteredUniqueClientList.map((client) => (
                      <>
                        <tr className="border-b-2">
                          <td className="text-bold text-base" colSpan={13}>
                            {clientLookup(client)} ({tagLookup(client)})
                          </td>
                        </tr>
                        {daybook
                          .filter(
                            (x) =>
                              x.xeroClientId === client &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
                          )
                          .map((item) => (
                            <tr>
                              <td>{/*Client Name */}</td>
                              <td>
                                {/*Date */}
                                {new Date(item.date).toLocaleDateString(
                                  "en-GB"
                                )}
                              </td>
                              <td>
                                {/*invoice number*/}
                                {item.number} {item.Id ? `(${item.Id})` : null}
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
                                {/*invoice Fees*/}
                                {formatCurrency.format(
                                  +item.Fees +
                                    +item.adjustment +
                                    +item.adjusting_amount
                                )}
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
                                {/*invoice Disb*/}
                                {formatCurrency.format(+item.disb)}
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
                                {/*invoice total*/}
                                {formatCurrency.format(
                                  +item.Fees +
                                    +item.disb +
                                    +item.adjustment +
                                    +item.adjusting_amount
                                )}
                              </td>
                              <td>{/*client total*/}</td>
                              <td
                                data-t="n"
                                data-z="#,##0.00;(#,##0.00);0"
                                data-v={
                                  item.cancelled == 1
                                    ? (+item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount) /
                                      -1
                                    : 0
                                }
                              >
                                {/*Cancelled*/}
                                {item.cancelled == 1 &&
                                  formatCurrency.format(
                                    (+item.Fees +
                                      +item.disb +
                                      +item.adjustment +
                                      +item.adjusting_amount) /
                                      -1
                                  )}
                              </td>
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
                                {/*Lost*/}
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
                                {/*OSA*/}
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
                                {/*New-Ltd*/}
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
                              <td
                                data-t="n"
                                data-z="#,##0.00;(#,##0.00);0"
                                data-v={
                                  checkExcludeStatus(item.clas_status) &&
                                  item.cancelled != 1 &&
                                  (item.CalcGroup == null ||
                                    item.CalcGroup == "New-Referral")
                                    ? +item.Fees +
                                      +item.disb +
                                      +item.adjustment +
                                      +item.adjusting_amount
                                    : 0
                                }
                              >
                                {/*Excluded/Superceded Inv*/}
                                {checkExcludeStatus(item.clas_status) &&
                                item.cancelled != 1 &&
                                (item.CalcGroup == null ||
                                  item.CalcGroup == "New-Referral")
                                  ? formatCurrency.format(
                                      +item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount
                                    )
                                  : null}
                              </td>
                              <td
                                data-t="n"
                                data-z="#,##0.00;(#,##0.00);0"
                                data-v={
                                  !checkExcludeStatus(item.clas_status) &&
                                  item.cancelled != 1 &&
                                  (item.CalcGroup == null ||
                                    item.CalcGroup == "New-Referral")
                                    ? +item.Fees +
                                      +item.disb +
                                      +item.adjustment +
                                      +item.adjusting_amount
                                    : 0
                                }
                              >
                                {/* Invoice */}
                                {!checkExcludeStatus(item.clas_status) &&
                                item.cancelled != 1 &&
                                (item.CalcGroup == null ||
                                  item.CalcGroup == "New-Referral")
                                  ? formatCurrency.format(
                                      +item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount
                                    )
                                  : null}
                              </td>
                              <td
                                data-t="n"
                                data-z="#,##0.00;(#,##0.00);0"
                                data-v={
                                  item.clas_status == "include" &&
                                  item.cancelled != 1 &&
                                  (item.CalcGroup == null ||
                                    item.CalcGroup == "New-Referral")
                                    ? +item.clas_amount
                                    : 0
                                }
                              >
                                {/* Disb/Adjustments */}
                                {item.clas_status == "include" &&
                                item.cancelled != 1 &&
                                (item.CalcGroup == null ||
                                  item.CalcGroup == "New-Referral")
                                  ? formatCurrency.format(+item.clas_amount)
                                  : null}
                              </td>
                              <td
                                data-t="n"
                                data-z="#,##0.00;(#,##0.00);0"
                                data-v={
                                  item.clas_status == "include" &&
                                  item.cancelled != 1 &&
                                  (item.CalcGroup == null ||
                                    item.CalcGroup == "New-Referral")
                                    ? +item.adhoc_amount
                                    : 0
                                }
                              >
                                {/* Adhoc */}
                                {item.clas_status == "include" &&
                                item.cancelled != 1 &&
                                (item.CalcGroup == null ||
                                  item.CalcGroup == "New-Referral")
                                  ? formatCurrency.format(+item.adhoc_amount)
                                  : null}
                              </td>
                              <td
                                data-t="n"
                                data-z="#,##0.00;(#,##0.00);0"
                                data-v={
                                  item.clas_status == "adhoc" &&
                                  item.cancelled != 1 &&
                                  item.CalcGroup == null
                                    ? +item.Fees +
                                      +item.disb +
                                      +item.adjustment +
                                      +item.adjusting_amount
                                    : 0
                                }
                              >
                                {/* Adhoc only inv */}
                                {item.clas_status == "adhoc" &&
                                item.cancelled != 1 &&
                                item.CalcGroup == null
                                  ? formatCurrency.format(
                                      +item.Fees +
                                        +item.disb +
                                        +item.adjustment +
                                        +item.adjusting_amount
                                    )
                                  : null}
                              </td>
                              <td>
                                {/*Description*/}
                                {item.clas_description}
                              </td>
                              <td>
                                {/*Adj reason*/}
                                {item.clas_reason}
                              </td>
                              <td>
                                {/*Adhoc*/}
                                {item.adhoc_reason}
                              </td>
                              <td
                                data-t="n"
                                data-z="#,##0.00;(#,##0.00);0"
                                data-v={
                                  item.XeroContactGroups?.find(
                                    (x) =>
                                      x.ContactGroupID ==
                                      "3a4099a1-5f5a-45e1-b9e0-e0e248c9a427"
                                  ) &&
                                  (item.clas_status == "include" ||
                                    (item.clas_status == "adhoc" &&
                                      item.cancelled != 1 &&
                                      item.CalcGroup == null) ||
                                    item.CalcGroup == "New-Referral")
                                    ? +item.Fees +
                                      +item.disb +
                                      +item.adjustment +
                                      +item.adjusting_amount
                                    : null
                                }
                              >
                                {/*NK Commission Client*/}
                                {item.XeroContactGroups?.find(
                                  (x) =>
                                    x.ContactGroupID ==
                                    "3a4099a1-5f5a-45e1-b9e0-e0e248c9a427"
                                ) ? (
                                  <>
                                    {item.clas_status == "include" ||
                                    (item.clas_status == "adhoc" &&
                                      item.cancelled != 1 &&
                                      item.CalcGroup == null) ||
                                    item.CalcGroup == "New-Referral"
                                      ? formatCurrency.format(
                                          +item.Fees +
                                            +item.disb +
                                            +item.adjustment +
                                            +item.adjusting_amount
                                        )
                                      : null}
                                  </>
                                ) : null}
                              </td>
                            </tr>
                          ))}
                        <tr className="border-t-2">
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td
                            data-t="n"
                            data-z="#,##0.00;(#,##0.00);0"
                            data-v={sumInvoices(
                              daybook.filter(
                                (x) =>
                                  x.xeroClientId === client &&
                                  (includedOnly
                                    ? x.clas_status == "include" ||
                                      (x.clas_status == "adhoc" &&
                                        x.cancelled != 1 &&
                                        x.CalcGroup == null)
                                    : true)
                              )
                            )}
                          >
                            {formatCurrency.format(
                              sumInvoices(
                                daybook.filter(
                                  (x) =>
                                    x.xeroClientId === client &&
                                    (includedOnly
                                      ? x.clas_status == "include" ||
                                        (x.clas_status == "adhoc" &&
                                          x.cancelled != 1 &&
                                          x.CalcGroup == null)
                                      : true)
                                )
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
                    <td></td>
                    <td></td>
                    <td></td>
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={daybook
                        .filter(
                          (x) =>
                            filteredUniqueClientList.includes(x.xeroClientId) &&
                            (includedOnly
                              ? x.clas_status == "include" ||
                                (x.clas_status == "adhoc" &&
                                  x.cancelled != 1 &&
                                  x.CalcGroup == null)
                              : true)
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
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
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
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={
                        daybook
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
                          )
                          .filter((x) => x.cancelled == 1)
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
                      {/*Cancelled*/}
                      {formatCurrency.format(
                        daybook
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
                          )
                          .filter((x) => x.cancelled == 1)
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
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
                          )
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
                      {/*Lost*/}
                      {formatCurrency.format(
                        daybook
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
                          )
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
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
                          )
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
                      {/*OSA*/}
                      {formatCurrency.format(
                        daybook
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
                          )
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
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
                          )
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
                      {/*New-Ltd*/}
                      {formatCurrency.format(
                        daybook
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
                          )
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
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={daybook
                        .filter(
                          (x) =>
                            filteredUniqueClientList.includes(x.xeroClientId) &&
                            (includedOnly
                              ? x.clas_status == "include" ||
                                (x.clas_status == "adhoc" &&
                                  x.cancelled != 1 &&
                                  x.CalcGroup == null)
                              : true)
                        )
                        .filter(
                          (x) =>
                            checkExcludeStatus(x.clas_status) &&
                            x.cancelled != 1 &&
                            (x.CalcGroup == null ||
                              x.CalcGroup == "New-Referral")
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
                      {/*Excluded/Superceded Inv*/}
                      {formatCurrency.format(
                        daybook
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null)
                                : true)
                          )
                          .filter(
                            (x) =>
                              checkExcludeStatus(x.clas_status) &&
                              x.cancelled != 1 &&
                              (x.CalcGroup == null ||
                                x.CalcGroup == "New-Referral")
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
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={daybook
                        .filter(
                          (x) =>
                            filteredUniqueClientList.includes(x.xeroClientId) &&
                            (includedOnly
                              ? x.clas_status == "include" ||
                                (x.clas_status == "adhoc" &&
                                  x.cancelled != 1 &&
                                  (x.CalcGroup == null ||
                                    x.CalcGroup == "New-Referral"))
                              : true)
                        )
                        .filter(
                          (x) =>
                            x.clas_status == "include" ||
                            (x.clas_status == "adhoc" &&
                              x.cancelled != 1 &&
                              (x.CalcGroup == null ||
                                x.CalcGroup == "New-Referral"))
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
                      {/* Invoice */}
                      {formatCurrency.format(
                        daybook
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    (x.CalcGroup == null ||
                                      x.CalcGroup == "New-Referral"))
                                : true)
                          )
                          .filter(
                            (x) =>
                              x.clas_status == "include" ||
                              (x.clas_status == "adhoc" &&
                                x.cancelled != 1 &&
                                (x.CalcGroup == null ||
                                  x.CalcGroup == "New-Referral"))
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
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={daybook
                        .filter(
                          (x) =>
                            filteredUniqueClientList.includes(x.xeroClientId) &&
                            (includedOnly
                              ? x.clas_status == "include" ||
                                (x.clas_status == "adhoc" &&
                                  x.cancelled != 1 &&
                                  (x.CalcGroup == null ||
                                    x.CalcGroup == "New-Referral"))
                              : true)
                        )
                        .filter(
                          (x) =>
                            x.clas_status == "include" &&
                            x.cancelled != 1 &&
                            (x.CalcGroup == null ||
                              x.CalcGroup == "New-Referral")
                        )
                        .reduce((total, invoice) => {
                          return total + +invoice.clas_amount;
                        }, 0)}
                    >
                      {/* Disb/Adjustments */}
                      {formatCurrency.format(
                        daybook
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    (x.CalcGroup == null ||
                                      x.CalcGroup == "New-Referral"))
                                : true)
                          )
                          .filter(
                            (x) =>
                              x.clas_status == "include" &&
                              x.cancelled != 1 &&
                              (x.CalcGroup == null ||
                                x.CalcGroup == "New-Referral")
                          )
                          .reduce((total, invoice) => {
                            return total + +invoice.clas_amount;
                          }, 0)
                      )}
                    </td>
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={daybook
                        .filter(
                          (x) =>
                            filteredUniqueClientList.includes(x.xeroClientId) &&
                            (includedOnly
                              ? x.clas_status == "include" ||
                                (x.clas_status == "adhoc" &&
                                  x.cancelled != 1 &&
                                  (x.CalcGroup == null ||
                                    x.CalcGroup == "New-Referral"))
                              : true)
                        )
                        .filter(
                          (x) =>
                            x.clas_status == "include" &&
                            x.cancelled != 1 &&
                            (x.CalcGroup == null ||
                              x.CalcGroup == "New-Referral")
                        )
                        .reduce((total, invoice) => {
                          return total + +invoice.adhoc_amount;
                        }, 0)}
                    >
                      {formatCurrency.format(
                        daybook
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null) ||
                                  x.CalcGroup == "New-Referral"
                                : true)
                          )
                          .filter(
                            (x) =>
                              x.clas_status == "include" &&
                              x.cancelled != 1 &&
                              (x.CalcGroup == null ||
                                x.CalcGroup == "New-Referral")
                          )
                          .reduce((total, invoice) => {
                            return total + +invoice.adhoc_amount;
                          }, 0)
                      )}
                    </td>
                    <td
                      data-t="n"
                      data-z="#,##0.00;(#,##0.00);0"
                      data-v={daybook
                        .filter(
                          (x) =>
                            filteredUniqueClientList.includes(x.xeroClientId) &&
                            (includedOnly
                              ? x.clas_status == "include" ||
                                (x.clas_status == "adhoc" &&
                                  x.cancelled != 1 &&
                                  (x.CalcGroup == null ||
                                    x.CalcGroup == "New-Referral"))
                              : true)
                        )
                        .filter(
                          (x) =>
                            x.clas_status == "adhoc" &&
                            x.cancelled != 1 &&
                            (x.CalcGroup == null ||
                              x.CalcGroup == "New-Referral")
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
                          .filter(
                            (x) =>
                              filteredUniqueClientList.includes(
                                x.xeroClientId
                              ) &&
                              (includedOnly
                                ? x.clas_status == "include" ||
                                  (x.clas_status == "adhoc" &&
                                    x.cancelled != 1 &&
                                    x.CalcGroup == null) ||
                                  x.CalcGroup == "New-Referral"
                                : true)
                          )
                          .filter(
                            (x) =>
                              x.clas_status == "adhoc" &&
                              x.cancelled != 1 &&
                              (x.CalcGroup == null ||
                                x.CalcGroup == "New-Referral")
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
