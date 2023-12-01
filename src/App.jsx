import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./routes/dashboard/Dashboard.jsx";
import Test from "./routes/test/Test.jsx";
import ExcelMatch from "./routes/Sales/Excel/Match.jsx";
import DaybookExcelShow from "./routes/Daybooks/Excel/Show.jsx";
import ClientList from "./routes/Clients/list.jsx";
import InvoiceList from "./routes/Sales/Excel/invoices.jsx";
import SalesReconciliation from "./routes/Sales/Excel/reconciliation.jsx";
import XeroSync from "./routes/Clients/XeroSyncList.jsx";
import PaymentSheet from "./routes/Payment/Sheet.jsx";
import ClassifyClients from "./routes/Payment/ClassifyClient.jsx";
import ClassifyInvoices from "./routes/Payment/ClassifyInvoice.jsx";
import PaymentSummary from "./routes/Payment/Summary.jsx";
import GlideSync from "./routes/Clients/GlideSyncList.jsx";
import LostCommissions from "./routes/Payment/LostCommissions.jsx";
import HFSShared from "./routes/Payment/HFSShared.jsx";
import DaybookPaymentSheet from "./routes/Payment/DaybookDisplay.jsx";

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
        <Route path="/Clients/list" element={<ClientList />} />
        <Route path="/Clients/XeroSync" element={<XeroSync />} />
        <Route path="/Clients/GlideSync" element={<GlideSync />} />
        <Route path="/Payment/Sheet" element={<PaymentSheet />} />
        <Route path="/Payment/ClassifyClients" element={<ClassifyClients />} />
        <Route path="/Payment/LostCommissions" element={<LostCommissions />} />
        <Route path="/Payment/HFSShared" element={<HFSShared />} />
        <Route
          path="/Payment/DaybookFormat"
          element={<DaybookPaymentSheet />}
        />
        <Route
          path="/Payment/ClassifyInvoices"
          element={<ClassifyInvoices />}
        />
        <Route path="/Payment/Summary" element={<PaymentSummary />} />
      </Routes>
    </BrowserRouter>
  );
}
