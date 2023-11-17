export default function SalesSubNav({ PageName }) {
  const navigation = [
    {
      id: 1,
      name: "Match Invoices",
      href: "/Sales/ExcelMatch",
      current: PageName === "Match",
    },
    {
      id: 2,
      name: "Invoice List",
      href: "/Sales/Invoices",
      current: PageName === "Invoices",
    },
    {
      id: 3,
      name: "Daybook Reconciliation",
      href: "/Sales/Reconciliation",
      current: PageName === "Reconciliation",
    },
  ];
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  return (
    <div className="bg-slate-100 h-12">
      <div className="flex h-full content-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {navigation.map((item) => (
          <div className="flex h-full items-center">
            <a
              href={item.href}
              className={classNames(
                item.current
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                "inline-flex items-center border-b-2 px-3 mx-1 pt-1 text-sm font-medium"
              )}
            >
              {item.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
