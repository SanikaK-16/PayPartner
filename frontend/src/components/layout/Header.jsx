import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Menu,
  ChevronDown,
  CircleHelp,
  LogOut,
  Settings,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  UserCircle,
  X,
  MapPin,
  Store,
  Hash,
} from "lucide-react";
import {
  useNavigate,
} from "react-router-dom";

const initialNotifications = [
  {
    id: 1,
    type: "opportunity",
    title: "Failed payment opportunity detected",
    message: "9 failed payments worth ₹2,075 were identified.",
    status: "unread",
    createdAt: "10 min ago",
  },
  {
    id: 2,
    type: "verification",
    title: "Action verified successfully",
    message:
      "Payment recovery action generated ₹850 in recovered value.",
    status: "unread",
    createdAt: "42 min ago",
  },
  {
    id: 3,
    type: "policy",
    title: "Policy check completed",
    message:
      "Today's customer offer was within your configured limits.",
    status: "read",
    createdAt: "2 hrs ago",
  },
];

function getNotificationIcon(type) {
  if (type === "opportunity") {
    return (
      <AlertCircle
        size={17}
        strokeWidth={1.8}
      />
    );
  }

  if (type === "verification") {
    return (
      <CheckCircle2
        size={17}
        strokeWidth={1.8}
      />
    );
  }

  if (type === "policy") {
    return (
      <ShieldCheck
        size={17}
        strokeWidth={1.8}
      />
    );
  }

  return (
    <Zap
      size={17}
      strokeWidth={1.8}
    />
  );
}

function Header({ onMobileMenuToggle }) {
  const navigate = useNavigate();

  // =========================================================
  // MERCHANT INFORMATION
  // =========================================================

  const merchant = {
    id: 1,
    name: "Ramesh General Store",
    business_type: "Grocery",
    city: "Pune",
  };

  // =========================================================
  // HEADER STATE
  // =========================================================

  const [profileOpen, setProfileOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  // null | "profile" | "settings"
  const [accountPanel, setAccountPanel] = useState(null);

  // =========================================================
  // UI-ONLY APP SETTINGS
  //
  // These are application preferences only.
  // They are separate from business Policies.
  // =========================================================

  const [settings, setSettings] = useState({
    notifications: true,
    appearance: "light",
  });

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // =========================================================
  // DERIVED VALUES
  // =========================================================

  const unreadCount = notifications.filter(
    (notification) =>
      notification.status === "unread"
  ).length;

  // =========================================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // HEADER ACTIONS
  // =========================================================

  function toggleNotifications() {
    setNotificationsOpen((value) => !value);
    setProfileOpen(false);
  }

  function toggleProfile() {
    setProfileOpen((value) => !value);
    setNotificationsOpen(false);
  }

  function openAccountPanel(panel) {
    setProfileOpen(false);
    setNotificationsOpen(false);
    setAccountPanel(panel);
  }

  function closeAccountPanel() {
    setAccountPanel(null);
  }

  // =========================================================
  // SETTINGS
  // =========================================================

  function toggleNotificationsSetting() {
    setSettings((current) => ({
      ...current,
      notifications: !current.notifications,
    }));
  }

  function changeAppearance(mode) {
    setSettings((current) => ({
      ...current,
      appearance: mode,
    }));
  }

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  function markNotificationAsRead(id) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              status: "read",
            }
          : notification
      )
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        status: "read",
      }))
    );
  }

  // =========================================================
  // SIGN OUT
  // =========================================================

  function handleSignOut() {
    localStorage.removeItem("selectedMerchant");
    navigate("/login");
  }

  return (
    <>
      {/* =========================================================
          HEADER
      ========================================================== */}

      <header className="fixed left-0 right-0 top-0 z-40 flex h-20 items-center border-b border-border bg-white shadow-md">
        <div className="flex h-full w-full items-center">

          {/* =====================================================
    PAYPARTNER LOGO
====================================================== */}

<div className="flex h-full w-[150px] shrink-0 items-center border-r border-border bg-white px-4 sm:w-[210px] sm:px-5 lg:w-[256px] lg:px-6">
  <button
    type="button"
    onClick={() => {
      window.location.href = "/overview";
    }}
    aria-label="Go to Overview"
    className="flex items-center border-0 bg-transparent p-0 outline-none focus:outline-none focus:ring-0"
  >
    <img
      src="/src/assets/paypartner_logo.png"
      alt="PayPartner"
      className="h-auto w-32 object-contain object-left sm:w-40 lg:w-44"
    />
  </button>
</div>

          {/* =====================================================
              HEADER SPACER
          ====================================================== */}

          <div className="min-w-0 flex-1 px-3 sm:px-6 lg:px-8" aria-hidden="true" />

          {/* =====================================================
              HEADER ACTIONS
          ====================================================== */}

          <div className="flex shrink-0 items-center gap-1 px-2 sm:gap-5 sm:px-6 lg:px-8">

            {/* Mobile Menu */}

            <button
              type="button"
              onClick={onMobileMenuToggle}
              aria-label="Open navigation"
              className="rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-primary/5 hover:text-navy focus:outline-none focus:ring-2 focus:ring-primary/30 lg:hidden"
            >
              <Menu
                size={21}
                strokeWidth={1.8}
              />
            </button>

            {/* =================================================
                NOTIFICATIONS
            ================================================== */}

            <div
              className="relative"
              ref={notificationsRef}
            >
              <button
                type="button"
                onClick={toggleNotifications}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                className="relative rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-primary/5 hover:text-navy hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <Bell
                  size={21}
                  strokeWidth={1.8}
                />

                {settings.notifications &&
                  unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-xl border border-border bg-white shadow-lg">

                  {/* Notification Header */}

                  <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-navy">
                        Notifications
                      </h2>

                      <p className="mt-0.5 text-xs text-text-secondary">
                        {unreadCount > 0
                          ? `${unreadCount} unread notification${
                              unreadCount > 1
                                ? "s"
                                : ""
                            }`
                          : "You're all caught up"}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="shrink-0 text-xs font-semibold text-primary transition hover:text-navy"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}

                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.map(
                      (notification) => {
                        const isUnread =
                          notification.status ===
                          "unread";

                        return (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              markNotificationAsRead(
                                notification.id
                              )
                            }
                            className={`flex w-full gap-3 border-b border-border px-4 py-4 text-left transition last:border-b-0 sm:px-5 ${
                              isUnread
                                ? "bg-primary/5 hover:bg-primary/10"
                                : "bg-white hover:bg-background"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                notification.type ===
                                "opportunity"
                                  ? "bg-warning/10 text-warning"
                                  : notification.type ===
                                    "verification"
                                  ? "bg-success/10 text-success"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p
                                  className={`text-sm ${
                                    isUnread
                                      ? "font-semibold text-navy"
                                      : "font-medium text-text"
                                  }`}
                                >
                                  {notification.title}
                                </p>

                                {isUnread && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                )}
                              </div>

                              <p className="mt-1 text-xs leading-5 text-text-secondary">
                                {notification.message}
                              </p>

                              <p className="mt-2 text-[11px] text-text-secondary">
                                {notification.createdAt}
                              </p>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                MERCHANT ACCOUNT
            ================================================== */}

            <div
              className="relative"
              ref={profileRef}
            >
              {/* Account Trigger */}

              <button
                type="button"
                onClick={toggleProfile}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-200 hover:bg-primary/5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 sm:gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCircle
                    size={22}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="hidden max-w-40 text-left sm:block">
                  <p className="truncate text-sm font-semibold text-navy">
                    {merchant.name}
                  </p>

                  <p className="text-xs text-text-secondary">
                    {merchant.business_type}
                  </p>
                </div>

                <ChevronDown
                  size={17}
                  className={`text-text-secondary transition-transform duration-200 ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                  strokeWidth={1.8}
                />
              </button>

              {/* Account Dropdown */}

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-72 overflow-hidden rounded-xl border border-border bg-white shadow-xl"
                >

                  {/* Account Header */}

                  <div className="border-b border-border bg-background px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserCircle
                          size={23}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">
                          {merchant.name}
                        </p>

                        <p className="mt-0.5 text-xs text-text-secondary">
                          Merchant account
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">

                    {/* Profile */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() =>
                        openAccountPanel("profile")
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 hover:bg-primary/5"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <UserCircle
                          size={18}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy">
                          Profile
                        </p>

                        <p className="mt-0.5 text-xs text-text-secondary">
                          View merchant information
                        </p>
                      </div>

                      <ChevronDown
                        size={16}
                        className="ml-auto -rotate-90 text-text-secondary"
                        strokeWidth={1.8}
                      />
                    </button>

                    {/* Settings */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() =>
                        openAccountPanel("settings")
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 hover:bg-primary/5"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-text-secondary">
                        <Settings
                          size={18}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy">
                          Settings
                        </p>

                        <p className="mt-0.5 text-xs text-text-secondary">
                          Manage basic preferences
                        </p>
                      </div>

                      <ChevronDown
                        size={16}
                        className="ml-auto -rotate-90 text-text-secondary"
                        strokeWidth={1.8}
                      />
                    </button>

                    <div className="my-1 border-t border-border" />

                    {/* Sign Out */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 hover:bg-error/5"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error/5 text-error">
                        <LogOut
                          size={18}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-error">
                          Sign out
                        </p>

                        <p className="mt-0.5 text-xs text-text-secondary">
                          Exit your merchant account
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          PROFILE PANEL
      ========================================================== */}

      {accountPanel === "profile" && (
        <div className="fixed inset-0 z-[60]">

          {/* Overlay */}

          <button
            type="button"
            aria-label="Close profile"
            onClick={closeAccountPanel}
            className="absolute inset-0 bg-navy/20 backdrop-blur-[1px]"
          />

          {/* Drawer */}

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Account
                </p>

                <h2 className="mt-1 text-xl font-semibold text-navy">
                  Profile
                </h2>
              </div>

              <button
                type="button"
                onClick={closeAccountPanel}
                aria-label="Close profile"
                className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <X
                  size={20}
                  strokeWidth={1.8}
                />
              </button>
            </div>

            {/* Profile Content */}

            <div className="flex-1 overflow-y-auto p-6">

              {/* Merchant Identity */}

              <div className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserCircle
                      size={32}
                      strokeWidth={1.7}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-navy">
                      {merchant.name}
                    </h3>

                    <p className="mt-1 text-sm text-text-secondary">
                      Merchant account
                    </p>
                  </div>
                </div>
              </div>

              {/* Merchant Information */}

              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Merchant information
                </p>

                <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">

                  {/* Business Name */}

                  <div className="flex items-center gap-4 px-5 py-4">
                    <Store
                      size={20}
                      strokeWidth={1.8}
                      className="shrink-0 text-primary"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-text-secondary">
                        Business name
                      </p>

                      <p className="mt-1 text-sm font-medium text-navy">
                        {merchant.name}
                      </p>
                    </div>
                  </div>

                  {/* Business Type */}

                  <div className="flex items-center gap-4 px-5 py-4">
                    <Store
                      size={20}
                      strokeWidth={1.8}
                      className="shrink-0 text-primary"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-text-secondary">
                        Business type
                      </p>

                      <p className="mt-1 text-sm font-medium text-navy">
                        {merchant.business_type}
                      </p>
                    </div>
                  </div>

                  {/* City */}

                  <div className="flex items-center gap-4 px-5 py-4">
                    <MapPin
                      size={20}
                      strokeWidth={1.8}
                      className="shrink-0 text-primary"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-text-secondary">
                        City
                      </p>

                      <p className="mt-1 text-sm font-medium text-navy">
                        {merchant.city}
                      </p>
                    </div>
                  </div>

                  {/* Merchant ID */}

                  <div className="flex items-center gap-4 px-5 py-4">
                    <Hash
                      size={20}
                      strokeWidth={1.8}
                      className="shrink-0 text-primary"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-text-secondary">
                        Merchant ID
                      </p>

                      <p className="mt-1 text-sm font-medium text-navy">
                        {merchant.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* =========================================================
          SETTINGS PANEL
      ========================================================== */}

      {accountPanel === "settings" && (
        <div className="fixed inset-0 z-[60]">

          {/* Overlay */}

          <button
            type="button"
            aria-label="Close settings"
            onClick={closeAccountPanel}
            className="absolute inset-0 bg-navy/20 backdrop-blur-[1px]"
          />

          {/* Drawer */}

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Account
                </p>

                <h2 className="mt-1 text-xl font-semibold text-navy">
                  Settings
                </h2>
              </div>

              <button
                type="button"
                onClick={closeAccountPanel}
                aria-label="Close settings"
                className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <X
                  size={20}
                  strokeWidth={1.8}
                />
              </button>
            </div>

            {/* Settings Content */}

            <div className="flex-1 overflow-y-auto p-6">

              <div className="space-y-4">

                {/* =================================================
                    NOTIFICATIONS
                ================================================== */}

                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Bell
                          size={19}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy">
                          Notifications
                        </p>

                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                          Receive notifications from PayPartner.
                        </p>
                      </div>
                    </div>

                    {/* Notification Toggle */}

                    <button
                      type="button"
                      onClick={toggleNotificationsSetting}
                      aria-label={
                        settings.notifications
                          ? "Disable notifications"
                          : "Enable notifications"
                      }
                      aria-pressed={settings.notifications}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 ${
                        settings.notifications
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          settings.notifications
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Current Status */}

                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">

                    <span
                      className={`h-2 w-2 rounded-full ${
                        settings.notifications
                          ? "bg-success"
                          : "bg-text-secondary"
                      }`}
                    />

                    <span className="text-xs font-medium text-text-secondary">
                      {settings.notifications
                        ? "Notifications enabled"
                        : "Notifications disabled"}
                    </span>
                  </div>
                </div>

                {/* =================================================
                    APPEARANCE
                ================================================== */}

                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-text-secondary">
                      <Settings
                        size={19}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold text-navy">
                        Appearance
                      </p>

                      <p className="mt-1 text-xs leading-5 text-text-secondary">
                        Choose your preferred appearance.
                      </p>

                      {/* Light / Dark Selector */}

                      <div className="mt-4 grid grid-cols-2 rounded-lg border border-border bg-background p-1">

                        <button
                          type="button"
                          onClick={() =>
                            changeAppearance("light")
                          }
                          aria-pressed={
                            settings.appearance ===
                            "light"
                          }
                          className={`rounded-md px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            settings.appearance ===
                            "light"
                              ? "bg-white text-navy shadow-sm ring-1 ring-border"
                              : "text-text-secondary hover:text-navy"
                          }`}
                        >
                          Light
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            changeAppearance("dark")
                          }
                          aria-pressed={
                            settings.appearance ===
                            "dark"
                          }
                          className={`rounded-md px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            settings.appearance ===
                            "dark"
                              ? "bg-navy text-white shadow-sm"
                              : "text-text-secondary hover:text-navy"
                          }`}
                        >
                          Dark
                        </button>
                      </div>

                      {/* Current Mode */}

                      <p className="mt-3 text-xs text-text-secondary">
                        Current mode:{" "}
                        <span className="font-semibold text-navy">
                          {settings.appearance ===
                          "light"
                            ? "Light"
                            : "Dark"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Header;