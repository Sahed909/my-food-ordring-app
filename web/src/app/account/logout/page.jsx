import useAuth from "@/utils/useAuth";

function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: "#2563EB",
              marginBottom: 12,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14h1v1h-1zM17 17h3v3h-3zM20 20h1v1h-1z"
                fill="white"
              />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#111827",
              margin: 0,
            }}
          >
            QRMenu
          </h1>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            border: "1.5px solid #E5E7EB",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            Sign out
          </h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
            Are you sure you want to sign out of your account?
          </p>

          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            Sign Out
          </button>

          <a
            href="/"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: 14,
              color: "#6B7280",
              textDecoration: "none",
            }}
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}

export default LogoutPage;
