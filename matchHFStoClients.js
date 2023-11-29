import mysql2 from "mysql2";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

var connection = mysql2.createConnection({
  host: "ham-ospmtools.mysql.database.azure.com",
  user: "oli",
  database: "salesrec",
  password: "Ranmore1",
  ssl: {
    ca: fs.readFileSync(__dirname + "/api/DigiCertGlobalRootCA.crt.pem"),
  },
});

var HFSClients = [];
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

connection.query(
  "SELECT * FROM salesrec.HFS_shared",
  function (err, results, fields) {
    if (err) throw err;
    HFSClients = results;
    console.log(HFSClients);
  }
);

connection.end();
