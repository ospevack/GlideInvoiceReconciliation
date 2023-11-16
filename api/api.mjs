import express from "express";
import cors from "cors";
import { Nango } from "@nangohq/node";
import querystring from "querystring";
import mysql2 from "mysql2";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connection = mysql2.createConnection({
  host: "ham-ospmtools.mysql.database.azure.com",
  user: "oli",
  database: "salesrec",
  password: "Ranmore1",
  ssl: {
    ca: fs.readFileSync(__dirname + "/DigiCertGlobalRootCA.crt.pem"),
  },
});

const app = express();
const nango = new Nango({ secretKey: "bbecac51-7c17-49e0-8479-f5e420aa37ce" });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/daybook/invoices", (req, res) => {
  connection.query("SELECT * FROM daybook", function (err, results, fields) {
    if (err) throw err;
    res.send(results);
  });
});

app.get("/clients", (req, res) => {
  connection.query("SELECT * FROM clients", function (err, results, fields) {
    if (err) throw err;
    res.send(results);
  });
});
app.post("/clients", (req, res) => {
  connection.query(
    "INSERT INTO clients (name) VALUES (?)",
    [req.body.name],
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});
app.delete("/daybook/invoices/link/:id", (req, res) => {
  connection.query(
    "UPDATE daybook t set t.xeroClientId = NULL, t.xeroInvoiceId = NULL WHERE t.id = ?",
    [req.params.id],
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});
app.post("/daybook/invoices/link", (req, res) => {
  connection.query(
    "UPDATE daybook t set t.xeroClientId = ?, t.xeroInvoiceId = ? WHERE t.id = ?",
    [
      req.body.Xero.Contact.ContactID,
      req.body.Xero.InvoiceID,
      req.body.Daybook.id,
    ],
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.get("/xero/sales/invoices", async (req, res, next) => {
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

app.get("/xero/sales/CreditNotes", async (req, res, next) => {
  try {
    const result = await nango
      .get({
        endpoint: "/CreditNotes",
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

app.listen(5678, () => {
  console.log("Server started!");
});
