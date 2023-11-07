import Navbar from "../../../components/navbar";
import axios from "axios";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/", current: false },
  { name: "Sales Rec (Excel/Xero)", href: "/Sales/ExcelMatch", current: false },
  { name: "Daybooks", href: "/Daybooks/Excel", current: false },
  { name: "Clients", href: "/Clients/List", current: true },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

let pounds = Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function ClientList() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    axios
      .get("/api/clients")
      .then((response) => {
        setClients(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <div className="min-h-full">
        <Navbar navigation={navigation} />

        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Clients
              </h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="p-4">
                <div className="border-2 border-indigo-600 rounded-md">
                  <div className="flex flex-row items-center py-4">
                    <div>
                      <p className="text-xl font-medium text-gray-900 px-4">
                        Filters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                          >
                            Code
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Xero Link
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Glide Link
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {clients.map((client) => (
                          <tr key={client.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                              {client.code}
                            </td>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                              {client.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {client.xeroId.length > 0 ? "Yes" : "No"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {client.glideId.length > 0 ? "Yes" : "No"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
