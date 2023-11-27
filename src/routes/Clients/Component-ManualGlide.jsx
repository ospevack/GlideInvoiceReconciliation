import { useEffect, useRef, useState } from "react";

export default function ManualGlide({ client, setClientInfo, glideUserList }) {
  const glideIdInput = useRef();
  const glideUserInput = useRef();

  //   useEffect(() => {
  //     console.log(glideUserList);
  //   }, [glideUserInput]);

  const checkComplete = () => {
    if (glideIdInput.current.value && glideUserInput.current.value) {
      setClientInfo(
        client.id,
        glideIdInput.current.value,
        glideUserInput.current.value
      );
    }
    console.log(glideIdInput.current.value, glideUserInput.current.value);
  };

  return (
    <div className="flex flex-inline">
      <div>
        <input
          onChange={() => checkComplete()}
          ref={glideIdInput}
          type="text"
          placeholder="Glide ID"
          value={client.glideId}
          className="rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        ></input>
      </div>
      <div>
        <select
          ref={glideUserInput}
          onChange={() => checkComplete()}
          defaultValue={client.partner}
          className="rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="">-</option>
          {glideUserList.map((user) => (
            <>
              {user.Role.startsWith("Partner") && (
                <option key={user.ID} value={user.ID}>
                  {user.Initials}
                </option>
              )}
            </>
          ))}
        </select>
      </div>
    </div>
  );
}
