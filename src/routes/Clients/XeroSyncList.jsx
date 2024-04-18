import Navbar from "../../components/Navbar";
import axios from "axios";
import { useState, useEffect } from "react";
import ClientsSubNav from "../../components/ClientsSubNav";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

let pounds = Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function XeroSync() {
  const [clients, setClients] = useState([]);
  const [daybookClients, setDaybookClients] = useState([]);

  useEffect(() => {
    axios
      .get("/api/clients")
      .then((response) => {
        setClients(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    axios
      .get("/api/daybook/clients/list")
      .then((response) => {
        setDaybookClients(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  function syncClient(client) {
    //first look up on Xero
    axios.get("/api/xero/contact/" + client.xeroClientId).then((response) => {
      axios
        .post("/api/clients", {
          name: response.data.Contacts[0].Name,
          XeroContactID: response.data.Contacts[0].ContactID,
          AccountNumber: response.data.Contacts[0].AccountNumber,
          XeroContactGroups: response.data.Contacts[0].ContactGroups,
        })
        .then((response) => {
          console.log(response.data);
          setClients([...clients, response.data]);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="Clients" />
        <ClientsSubNav PageName="XeroSync" />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Xero Sync{" "}
                <span className="text-lg text-gray-400">
                  ({daybookClients.length})
                </span>
              </h1>
            </div>
          </header>
          <main>
            {/* <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
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
            </div> */}
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-left">
                    <th>Client</th>
                    <th>Sync Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {daybookClients.map((client) => (
                    <tr className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="text-left text-sm text-gray-900">
                        <div className="flex flex-col items-start">
                          <div className="text-semibold">{client.client} </div>
                          <div className="text-gray-400">
                            {client.xeroClientId}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        {clients.find(
                          (c) => c.XeroContactID === client.xeroClientId
                        )
                          ? clients.find(
                              (c) => c.XeroContactID === client.xeroClientId
                            ).name
                          : "Not Synced"}
                      </td>
                      <td className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        {!clients.find(
                          (c) => c.XeroContactID === client.xeroClientId
                        ) && (
                          <button
                            type="button"
                            onClick={() => syncClient(client)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                          >
                            Sync
                          </button>
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
