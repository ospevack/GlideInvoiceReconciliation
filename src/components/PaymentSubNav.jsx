export default function PaymentSubNav({ PageName }) {
  const navigation = [
    {
      id: 0,
      name: "Summary",
      href: "/Payment/Summary",
      current: PageName === "Summary",
    },
    {
      id: 1,
      name: "Payment Sheet",
      href: "/Payment/Sheet",
      current: PageName === "Sheet",
    },
    {
      id: 2,
      name: "Classify Clients",
      href: "/Payment/ClassifyClients",
      current: PageName === "ClassifyClients",
    },
    {
      id: 3,
      name: "Classify Invoices",
      href: "/Payment/ClassifyInvoices",
      current: PageName === "ClassifyInvoices",
    },
  ];
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  return (
    <div className="bg-slate-100 h-12">
      <div className="flex h-full content-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {navigation.map((item) => (
          <div key={item.id} className="flex h-full items-center">
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
