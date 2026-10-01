import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";

const merchants = [
  {
    id: 1,
    name: "Ramesh General Store",
    category: "Grocery",
    location: "Pune",
    apiConnected: true,
  },
  {
    id: null,
    name: "Priya Fashion Store",
    category: "Fashion",
    location: "Pune",
    apiConnected: false,
  },
  {
    id: null,
    name: "Aman Electronics",
    category: "Electronics",
    location: "Mumbai",
    apiConnected: false,
  },
];

function Login() {
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedMerchant) return;

    localStorage.setItem(
      "selectedMerchant",
      JSON.stringify(selectedMerchant)
    );

    navigate("/overview");
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 lg:px-10">
        {/* Brand */}
        <div className="flex justify-center">
          <img
            src="/src/assets/paypartner_logo.png"
            alt="PayPartner"
            className="h-auto w-94 object-contain"
          />
        </div>

        {/* Main content */}
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
                Welcome to PayPartner
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-base text-text-secondary">
                Your AI business partner for smarter merchant growth.
              </p>
            </div>

            {/* Merchant selection */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-navy">
                  Select your business
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Choose the business account you want to continue with.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {merchants.map((merchant) => {
                  const isSelected =
                    selectedMerchant?.name === merchant.name;

                  return (
                    <button
                      key={merchant.name}
                      type="button"
                      onClick={() => setSelectedMerchant(merchant)}
                      className={`group rounded-xl border p-5 text-left transition ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                          : "border-border bg-white hover:border-primary/40 hover:bg-background"
                      }`}
                    >
                      <div
                        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg transition ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Store size={21} strokeWidth={1.8} />
                      </div>

                      <p className="text-sm font-semibold text-navy">
                        {merchant.name}
                      </p>

                      <p className="mt-2 text-sm text-text-secondary">
                        {merchant.category} • {merchant.location}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 flex justify-end">
                <Button
                  className="min-w-40"
                  disabled={!selectedMerchant}
                  onClick={handleContinue}
                >
                  <span>Continue</span>
                  <ArrowRight
                    size={17}
                    className="ml-2"
                    strokeWidth={2}
                  />
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-text-secondary">
              Secure merchant workspace
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;