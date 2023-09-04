import { useState, useEffect } from "react";
import Nango from "@nangohq/frontend";
import axios from "axios";

let nango = new Nango({ publicKey: "785951fd-be05-4000-b06e-1e928a5730dc" });

export default function Test() {
  const [salesInvoices, setSalesInvoices] = useState([]);
  async function getSalesInvoices() {
    try {
      await axios
        .get("/api/xero/sales/invoices", {
          params: {
            where:
              'Type="ACCREC" && Date > DateTime(2023,07,01) && Date < DateTime(2023,07,31)',
            //where=Type%3D%22ACCREC%22%20AND%20Date%20%3E%20DateTime(2023%2C07%2C31)%20AND%20Date%20%3C%20DateTime(2023%2C07%2C01)
            //where=Type%3D%22ACCREC%22%20%26%26%20Date%20%3E%20DateTime(2023%2C07%2C31)%20%26%26%20Date%20%3C%20DateTime(2023%2C07%2C01)
            //where=Type%3D%2522ACCREC%2522%2520%26%26%2520Date%2520%253E%2520DateTime(2023%2C07%2C31)%2520%26%26%2520Date%2520%253C%2520DateTime(2023%2C07%2C01)
          },
        })
        .then((response) => {
          setSalesInvoices(response.data.Invoices);
        });
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div>
      <h1>Test</h1>
      <button type="button" onClick={() => getSalesInvoices()}>
        Test
      </button>
    </div>
  );
}
