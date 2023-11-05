import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./routes/dashboard/Dashboard.jsx";
import Test from "./routes/test/Test.jsx";
import ExcelMatch from "./routes/Sales/Excel/Match.jsx";
import DaybookExcelShow from "./routes/Daybooks/Excel/Show.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Test" element={<Test />} />
        <Route path="/Sales/ExcelMatch" element={<ExcelMatch />} />
        <Route path="/Daybooks/Excel" element={<DaybookExcelShow />} />
      </Routes>
    </BrowserRouter>
  );
}
