import Navbar from "../../components/navbar";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import ClientsSubNav from "../../components/ClientsSubNav";
import { Switch } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

let pounds = Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function GlideSync() {
  const [clients, setClients] = useState([]);
  const [glideClientList, setGlideClientList] = useState([]);
  const [glideClientsLoaded, setGlideClientsLoaded] = useState(false);
  const [unsyncedOnly, setUnsyncedOnly] = useState(false);
  const [glideUserList, setGlideUserList] = useState([]);

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
      .get("/api/glide/clients")
      .then((response) => {
        setGlideClientList(response.data.Clients.Client);
      })
      .catch((error) => {
        console.log(error);
      });
    axios
      .get("/api/glide/users")
      .then((response) => {
        setGlideUserList(response.data.Users.User);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (glideClientList.length > 0) {
      setGlideClientsLoaded(true);
    }
  }, [glideClientList]);

  function syncClient(client, glideId, partner) {
    axios
      .post("/api/glide/clients/sync", {
        id: client.id,
        glideId: glideId,
        manualPartner: partner,
      })
      .then((response) => {
        console.log(response);
        if (response.data.affectedRows == 1 && response.data.changedRows == 1) {
          setClients(
            clients.map((c) => {
              if (c.id == client.id) {
                c.glideId = glideId;
              }
              return c;
            })
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <>
      <div className="min-h-full">
        <Navbar PageName="Clients" />
        <ClientsSubNav PageName="GlideSync" />
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Xero Sync{" "}
                <span className="text-lg text-gray-400">
                  ({clients.length})
                </span>
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
                    <div>
                      <Switch.Group
                        as="div"
                        className="ml-auto text-sm flex items-center py-2"
                      >
                        <Switch
                          checked={unsyncedOnly}
                          onChange={() => setUnsyncedOnly(!unsyncedOnly)}
                          className={classNames(
                            unsyncedOnly ? "bg-indigo-600" : "bg-gray-200",
                            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                          )}
                        >
                          <span className="sr-only">Unsynced only</span>
                          <span
                            aria-hidden="true"
                            className={classNames(
                              unsyncedOnly ? "translate-x-5" : "translate-x-0",
                              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                            )}
                          />
                        </Switch>
                        <Switch.Label as="span" className="ml-3 text-sm">
                          <span className="font-sm text-gray-900">
                            Unsynced only
                          </span>
                        </Switch.Label>
                      </Switch.Group>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                  {glideClientsLoaded &&
                    clients
                      .filter((x) => (unsyncedOnly ? x.glideId == null : true))
                      .map((client) => (
                        <tr className="border-b border-gray-200 hover:bg-gray-100">
                          <td className="text-left text-sm text-gray-900">
                            <div className="flex flex-col items-start">
                              <div className="text-semibold">
                                {client.name}{" "}
                              </div>
                              <div className="text-gray-400">
                                {client.AccountNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            {glideClientList.find(
                              (c) => c.GID === client.glideId
                            )
                              ? glideClientList.find(
                                  (c) => c.GID === client.glideId
                                ).Name
                              : "Not Synced"}
                          </td>
                          <td className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            {glideClientList.find(
                              (c) => c.UID == client.AccountNumber
                            ) && client.glideId == null ? (
                              <button
                                type="button"
                                onClick={() =>
                                  syncClient(
                                    client,
                                    glideClientList.find(
                                      (c) => c.UID == client.AccountNumber
                                    ).GID
                                  )
                                }
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                              >
                                Sync
                              </button>
                            ) : (
                              <div className="flex flex-inline">
                                <div>
                                  <input
                                    type="text"
                                    placeholder="Glide ID"
                                  ></input>
                                </div>
                                <div>
                                  <select>
                                    {glideUserList.map((user) => (
                                      <>
                                        {user.Role.startsWith("Partner") && (
                                          <option value={user.id}>
                                            {user.Initials}
                                          </option>
                                        )}
                                      </>
                                    ))}
                                  </select>
                                </div>
                              </div>
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
