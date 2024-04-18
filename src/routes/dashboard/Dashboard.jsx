import Navbar from "../../components/Navbar";

const navigation = [
  { name: "Dashboard", href: "/", current: true },
  { name: "Sales Rec (Excel/Xero)", href: "/Sales/ExcelMatch", current: false },
  { name: "Daybooks", href: "/Daybooks/Excel", current: false },
  { name: "Calendar", href: "#", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  return (
    <>
      <div className="min-h-full">
        <Navbar navigation={navigation} />

        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Dashboard
              </h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              {/* Your content */}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
