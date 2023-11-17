import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./routes/dashboard/Dashboard.jsx";
import Test from "./routes/test/Test.jsx";
import ExcelMatch from "./routes/Sales/Excel/Match.jsx";
import DaybookExcelShow from "./routes/Daybooks/Excel/Show.jsx";
import ClientList from "./routes/Clients/list.jsx";
import InvoiceList from "./routes/Sales/Excel/invoices.jsx";
import SalesReconciliation from "./routes/Sales/Excel/reconciliation.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Test" element={<Test />} />
        <Route path="/Sales/ExcelMatch" element={<ExcelMatch />} />
        <Route path="/Sales/Invoices" element={<InvoiceList />} />
        <Route path="/Sales/Reconciliation" element={<SalesReconciliation />} />
        <Route path="/Daybooks/Excel" element={<DaybookExcelShow />} />
        <Route path="/Clients" element={<ClientList />} />
      </Routes>
    </BrowserRouter>
  );
}
