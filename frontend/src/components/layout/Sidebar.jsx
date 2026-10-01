import {
  LayoutDashboard,
  TrendingUp,
  ReceiptText,
  Users,
  ShieldCheck,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  CircleHelp,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Overview", path: "/overview", icon: LayoutDashboard },
  { label: "Today's Business", path: "/todays-business", icon: TrendingUp },
  { label: "Transactions", path: "/transactions", icon: ReceiptText },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Policies", path: "/policies", icon: ShieldCheck },
  { label: "Activity", path: "/activity", icon: Activity },
];

function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onMobileClose,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-navy/30 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 z-50 flex flex-col border-r border-border bg-white shadow-sm transition-all duration-200 ease-out ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen
            ? "inset-y-0 translate-x-0"
            : "top-20 h-[calc(100vh-5rem)] -translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Menu
            </p>
          )}

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `flex w-full items-center rounded-lg text-sm font-medium transition-all duration-200 ${
                      collapsed
                        ? "justify-center px-3 py-3"
                        : "gap-3 px-3 py-3"
                    } ${
                      isActive
                        ? "bg-primary/10 text-navy"
                        : "text-text-secondary hover:bg-primary/5 hover:text-navy"
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={1.8} />

                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div
          className={`shrink-0 border-t border-border ${
            collapsed ? "p-3" : "p-4"
          }`}
        >
          {/* Help */}
          <button
            type="button"
            title={collapsed ? "Help & support" : undefined}
            onClick={() => {}}
            className={`flex w-full items-center rounded-lg text-text-secondary transition-all duration-200 hover:bg-primary/5 hover:text-navy focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              collapsed
                ? "justify-center p-3"
                : "gap-3 px-3 py-2.5"
            }`}
          >
            <CircleHelp size={19} strokeWidth={1.8} />

            {!collapsed && (
              <span className="text-sm font-medium">
                Help & support
              </span>
            )}
          </button>

          {/* Collapse */}
          <button
            type="button"
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={
              collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className={`mt-1 flex w-full items-center rounded-lg text-text-secondary transition-all duration-200 hover:bg-primary/5 hover:text-navy focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              collapsed
                ? "justify-center p-3"
                : "gap-3 px-3 py-2.5"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} strokeWidth={1.8} />
            ) : (
              <>
                <PanelLeftClose size={19} strokeWidth={1.8} />

                <span className="text-sm font-medium">
                  Collapse menu
                </span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;