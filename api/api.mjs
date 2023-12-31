import express from "express";
import cors from "cors";
import { Nango } from "@nangohq/node";
import querystring from "querystring";
import axios from "axios";
import mysql2 from "mysql2";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const glideBaseUri = "https://www.whatsglide.com/i/api/api.php";
const glideApiKey =
  "c71472ab7325584f331e66f092359f140f010c717af3f7dc1e4dd4c31f531f49";

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
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/daybook/clients/list", (req, res) => {
  connection.query(
    "SELECT DISTINCT t.xeroClientId, ANY_VALUE(t.client) client FROM daybook t WHERE t.xeroClientId IS NOT NULL GROUP BY t.xeroClientId",
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.get("/daybook/invoices", (req, res) => {
  connection.query("SELECT * FROM daybook", function (err, results, fields) {
    if (err) throw err;
    res.send(results);
  });
});

app.get("/clients", (req, res) => {
  connection.query(
    "select c.id, name, XeroContactID, glideId, AccountNumber, XeroContactGroups, CalcGroup, COALESCE(i.GlideUserId, c.partner) partner from clients c left outer join original_partners i on c.AccountNumber = i.code",
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});
app.post("/clients", (req, res) => {
  connection.query(
    "INSERT INTO clients (name, XeroContactID, AccountNumber, XeroContactGroups) VALUES (?,?,?,?)",
    [
      req.body.name,
      req.body.XeroContactID,
      req.body.AccountNumber,
      JSON.stringify(req.body.XeroContactGroups),
    ],
    function (err, results, fields) {
      if (err) throw err;
      res.send({
        id: results.insertId,
        name: req.body.name,
        XeroContactID: req.body.XeroContactID,
        glideId: null,
        AccountNumber: req.body.AccountNumber,
        XeroContactGroups: req.body.XeroContactGroups,
        CalcGroup: null,
      });
    }
  );
});
app.post("/clients/:id/calcgroup", (req, res) => {
  connection.query(
    "UPDATE clients t set t.CalcGroup = ? WHERE t.id = ?",
    [req.body.CalcGroup, req.params.id],
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});
app.get("/clients/CalcGroups", (req, res) => {
  connection.query(
    "SELECT DISTINCT t.CalcGroup FROM clients t WHERE t.CalcGroup IS NOT NULL",
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.delete("/clients/:id/calcgroup", (req, res) => {
  connection.query(
    "UPDATE clients t set t.CalcGroup = NULL WHERE t.id = ?",
    [req.params.id],
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

app.get("/reconciliation/items", async (req, res, next) => {
  connection.query(
    "SELECT * FROM reconciling_items",
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.post("/reconciliation/adjust", async (req, res, next) => {
  connection.query(
    "UPDATE daybook t set t.adjustment = ? WHERE t.id = ?",
    [+req.body.difference / -1, req.body.id],
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

app.get("/xero/contacts", async (req, res, next) => {
  try {
    const result = await nango
      .get({
        endpoint: "/Contacts",
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

app.get("/xero/contact/:id", async (req, res, next) => {
  try {
    const result = await nango
      .get({
        endpoint: "/Contacts/" + req.params.id,
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

app.get("/payment/all", async (req, res, next) => {
  connection.query(
    //"select * from daybook left outer join salesrec.reconciling_items ri on daybook.id = ri.invoice_id and adjusting_document = 'daybook' left outer join salesrec.clients c on daybook.xeroClientId = c.XeroContactID left outer join salesrec.payment_classifications p on daybook.id = p.invoice_id",
    //"select daybook.id daybook_id,Advanced_fee,Fees,adjustment,cancelled,client,comments,date,disb,number,recharge,sheet,type,writeOnOff,xeroClientId,xeroCreditNoteId,xeroInvoiceId,checkLine,adjusting_amount,adjusting_document,notes,c.id client_id,name,AccountNumber,glideId,XeroContactGroups,CalcGroup, COALESCE(i.GlideUserId, partner) partner,adj_amount clas_amount,adj_reason clas_reason,status clas_status, adhoc_amount, adhoc_reason, Description clas_description from daybook left outer join salesrec.reconciling_items ri on daybook.id = ri.invoice_id and adjusting_document = 'daybook' left outer join salesrec.clients c on daybook.xeroClientId = c.XeroContactID left outer join salesrec.payment_classifications p on daybook.id = p.invoice_id",
    `select daybook.id                                                               daybook_id,
    COALESCE(Advanced_fee, 0)                                             as Advanced_fee,
    COALESCE(Fees, 0)                                                     as Fees,
    COALESCE(adjustment, 0)                                               as adjustment,
    cancelled,
    COALESCE(Fees, 0) + COALESCE(adjustment, 0) + COALESCE(adjusting_amount, 0) + COALESCE(adj_amount, 0) +
    COALESCE(adhoc_amount, 0)                                             as Total_Fee,
    client,
    comments,
    date,
    disb,
    number,
    COALESCE(recharge, 0)                                                 as recharge,
    sheet,
    type,
    COALESCE(writeOnOff, 0)                                               as writeOnOff,
    xeroClientId,
    xeroCreditNoteId,
    xeroInvoiceId,
    checkLine,
    COALESCE(adjusting_amount, 0)                                         as adjusting_amount,
    adjusting_document,
    notes,
    c.id                                                                     client_id,
    name,
    AccountNumber,
    glideId,
    XeroContactGroups,
    CalcGroup,
    COALESCE(i.GlideUserId, partner, '100010')                            as partner,
    p.id                                                                     adj_id,
    COALESCE(adj_amount, 0)                                               as clas_amount,
    adj_reason                                                               clas_reason,
    status                                                                   clas_status,
    COALESCE(adhoc_amount, 0)                                             as adhoc_amount,
    adhoc_reason,
    Description                                                              clas_description,
    IF(status = 'adhoc',
       COALESCE(Fees, 0) + COALESCE(adhoc_amount, 0) + COALESCE(adjustment, 0) + COALESCE(adjusting_amount, 0),
       COALESCE(adhoc_amount, 0))                                         AS Total_Adhoc,
    IF(status IN ('include', 'adhoc') OR CalcGroup = 'Lost', true, false) AS status_check
from daybook
      left outer join salesrec.reconciling_items ri on daybook.id = ri.invoice_id and adjusting_document = 'daybook'
      left outer join salesrec.clients c on daybook.xeroClientId = c.XeroContactID
      left outer join salesrec.payment_classifications p on daybook.id = p.invoice_id
      left outer join salesrec.original_partners i on c.AccountNumber = i.code`,
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.get("/payment/hfs", async (req, res, next) => {
  connection.query(
    "select daybook.* from (select daybook.id daybook_id,Advanced_fee,Fees,adjustment,cancelled,client,comments,date,disb,number,recharge,sheet,type,writeOnOff,xeroClientId,xeroCreditNoteId,xeroInvoiceId,checkLine,adjusting_amount,adjusting_document,notes,c.id client_id,name,AccountNumber,glideId,XeroContactGroups,CalcGroup,COALESCE(i.GlideUserId, partner, '100010') as partner,p.id adj_id,adj_amount clas_amount,adj_reason clas_reason,status clas_status,adhoc_amount,adhoc_reason,Description clas_description from daybook left outer join salesrec.reconciling_items ri on daybook.id = ri.invoice_id and adjusting_document = 'daybook' left outer join salesrec.clients c on daybook.xeroClientId = c.XeroContactID left outer join salesrec.payment_classifications p on daybook.id = p.invoice_id left outer join salesrec.original_partners i on c.AccountNumber = i.code) as daybook join hfs_shared h on daybook.client_id = h.client_id",
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.get("/payment/transactions", async (req, res, next) => {
  connection.query(
    "select * from payment_transactions",
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.post("/payment/classification", async (req, res, next) => {
  connection.query(
    "INSERT INTO payment_classifications (invoice_id, status, adj_amount,adj_reason, adhoc_amount, adhoc_reason, Description) VALUES (?,?,?,?,?,?,?)",
    [
      req.body.invoice_id,
      req.body.status,
      req.body.adj_amount,
      req.body.adj_reason,
      req.body.adhoc_amount,
      req.body.adhoc_reason,
      req.body.clas_Description,
    ],
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.delete("/payment/classification/:id", async (req, res, next) => {
  connection.query(
    "DELETE FROM payment_classifications WHERE invoice_id = ?",
    [req.params.id],
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.put("/payment/togglecheck/:id", async (req, res, next) => {
  connection.query(
    "UPDATE daybook t set t.checkLine = ? WHERE t.id = ?",
    [req.body.checkLine, req.params.id],
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.get("/glide/clients", async (req, res, next) => {
  try {
    axios
      .get(`${glideBaseUri}/clients/list`, {
        params: {
          key: glideApiKey,
          returnFormat: 1,
        },
      })
      .then((response) => {
        res.send(JSON.parse(JSON.stringify(response.data).replace("{}", '""')));
      });
  } catch (error) {
    next(error);
  }
});

app.post("/glide/clients/sync", async (req, res, next) => {
  //get prev partner
  var prevPartner = null;
  axios
    .get(`${glideBaseUri}/clients/${req.body.glideId}/get/822`, {
      params: {
        key: glideApiKey,
        returnFormat: 1,
      },
    })
    .then((response) => {
      prevPartner = JSON.parse(
        JSON.stringify(response.data).replace("{}", '""')
      ).Data;
      console.log(prevPartner);
      connection.query(
        "UPDATE clients t set t.glideId = ?, t.partner=? WHERE t.id = ?",
        [req.body.glideId, prevPartner == -1 ? null : prevPartner, req.body.id],
        function (err, results, fields) {
          if (err) throw err;
          res.send(results);
        }
      );
    });
});

app.post("/glide/clients/:id/manual", async (req, res, next) => {
  connection.query(
    "UPDATE clients t set t.glideId = ?, t.partner = ? WHERE t.id = ?",
    [req.body.glideId, req.body.partner, req.params.id],
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.post("/glide/clients/:id/prevPartner", async (req, res, next) => {
  connection.query(
    "UPDATE clients t set t.partner = ? WHERE t.id = ?",
    [req.body.partner, req.params.id],
    function (err, results, fields) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.get("/glide/users", async (req, res, next) => {
  try {
    axios
      .get(`${glideBaseUri}/users/list`, {
        params: {
          key: glideApiKey,
          returnFormat: 1,
        },
      })
      .then((response) => {
        res.send(JSON.parse(JSON.stringify(response.data).replace("{}", '""')));
      });
  } catch (error) {
    next(error);
  }
});
app.get("/glide/clients/:id/field/:fid", async (req, res, next) => {
  try {
    axios
      .get(`${glideBaseUri}/clients/${req.params.id}/get/${req.params.fid}`, {
        params: {
          key: glideApiKey,
          returnFormat: 1,
        },
      })
      .then((response) => {
        res.send(JSON.parse(JSON.stringify(response.data).replace("{}", '""')));
      });
  } catch (error) {
    next(error);
  }
});

app.listen(5678, () => {
  console.log("Server started!");
});
