import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./routes/dashboard/Dashboard.jsx";
import Test from "./routes/test/Test.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Test />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
