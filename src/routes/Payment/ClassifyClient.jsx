import Navbar from "../../components/navbar";
import { CheckCircleIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { utils, writeFileXLSX } from "xlsx";
import PaymentSubNav from "../../components/PaymentSubNav";
import { map } from "rxjs";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ClassifyClients() {
  const formatCurrency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  const CalcGroups = [
    { id: 0, name: "", value: "" },
    { id: 1, name: "Lost Client", value: "Lost" },
    { id: 2, name: "OSA Client", value: "OSA" },
    { id: 3, name: "New Client (referral)", value: "New-Referral" },
    { id: 4, name: "New Client (other)", value: "New-Ltd" },
  ];

  const [uniqueClientList, setUniqueClientList] = useState([]);
  const [daybook, setDaybook] = useState([]);

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
      if (!uniqueClientList.some((x) => x.xeroClientId == item.xeroClientId)) {
        uniqueClientList.push({
          daybook_id: item.daybook_id,
          xeroClientId: item.xeroClientId,
          name: item.name,
          AccountNumber: item.AccountNumber,
          XeroContactGroups: item.XeroContactGroups,
          CalcGroup: item.CalcGroup,
        });
      }
    });
    setUniqueClientList(uniqueClientList);
  }, [daybook]);

  function selectCalcGroup(id, group) {
    if (group == "") return;
    axios
      .post(`/api/clients/${id}/calcgroup`, { CalcGroup: group })
      .then((res) => {
        console.log(res);
        if (res.data.affectedRows == 1 && res.data.changedRows == 1) {
          setDaybook(
            daybook.map((item) =>
              item.daybook_id === id ? { ...item, CalcGroup: group } : item
            )
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function removeCalcGroup(id) {
    axios
      .delete(`/api/clients/${id}/calcgroup`)
      .then((res) => {
        console.log(res);
        if (res.data.affectedRows == 1 && res.data.changedRows == 1) {
          setDaybook(
            daybook.map((item) =>
              item.id === id ? { ...item, CalcGroup: "" } : item
            )
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="Payment" />
        <PaymentSubNav PageName={"ClassifyClients"} />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Classify Clients
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
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client ID
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Name
                    </th>

                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xero Contact Groups
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calc Group
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uniqueClientList.map((client) => (
                    <tr key={client.daybook_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.AccountNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.XeroContactGroups?.map((group) => (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {group.Name}
                          </span>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.CalcGroup?.length > 0 ? (
                          <>
                            {client.CalcGroup}{" "}
                            <a
                              href="#"
                              className="underline text-blue-500 text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                removeCalcGroup(client.daybook_id);
                              }}
                            >
                              remove
                            </a>
                          </>
                        ) : (
                          <select
                            id="location"
                            name="location"
                            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(e) =>
                              selectCalcGroup(client.daybook_id, e.target.value)
                            }
                          >
                            {CalcGroups.map((group) => (
                              <option key={group.id} value={group.value}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
