import express from "express";
import cors from "cors";
import { Nango } from "@nangohq/node";
import querystring from "querystring";

const app = express();
const nango = new Nango({ secretKey: "bbecac51-7c17-49e0-8479-f5e420aa37ce" });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/xero/sales/invoices", async (req, res, next) => {
  console.log(querystring.encode(req.query) ? "OUI" : "NON");

  try {
    const result = await nango
      .get({
        endpoint: "/Invoices",
        baseUrlOverride: "https://api.xero.com/api.xro/2.0",
        providerConfigKey: "xero",
        connectionId: "GlideInvoiceReconciliation",
        headers: {
          Accept: "application/json",
          "Xero-tenant-id": "1ae3a830-4b8b-4ac2-8e9c-32e598384375",
        },
        params: req.query,
      })
      .then((response) => {
        res.send(response.data);
      });
  } catch (error) {
    next(error);
  }
});

app.listen(5000, () => {
  console.log("Server started!");
});
