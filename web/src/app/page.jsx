export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🍽️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QRMenu</h1>
        <p className="text-gray-500 mb-6">
          A smart QR-based restaurant ordering system. Scan a QR code at a
          restaurant to view the menu and place your order.
        </p>
        <p className="text-sm text-gray-400">
          Use the mobile app to manage your restaurant or scan a QR code to
          order.
        </p>
      </div>
    </div>
  );
}
