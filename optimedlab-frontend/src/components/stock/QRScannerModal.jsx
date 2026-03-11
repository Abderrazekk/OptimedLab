// src/components/stock/QRScannerModal.jsx
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QRScannerModal = ({ onClose, onScanSuccess }) => {
  useEffect(() => {
    // Initialize the scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        // Stop scanning once we successfully read a code
        scanner.clear();
        onScanSuccess(decodedText);
      },
      // eslint-disable-next-line no-unused-vars
      (errorMessage) => {
        // html5-qrcode continuously throws errors when no QR is in frame, we ignore them
      }
    );

    // Cleanup when modal is closed
    return () => {
      scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Scan Product QR</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* The div where the camera feed will render */}
        <div id="qr-reader" className="w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300"></div>
        
        <p className="text-sm text-gray-500 text-center mt-4">
          Point your camera at the QR code printed on the product box.
        </p>
      </div>
    </div>
  );
};

export default QRScannerModal;