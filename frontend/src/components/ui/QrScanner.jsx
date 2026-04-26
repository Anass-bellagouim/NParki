import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QrScanner({ onScan, onError }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    // Unique ID for the scanner container
    const scannerId = "html5qr-code-full-region";
    
    // Create the scanner instance
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerId,
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      /* verbose= */ false
    );

    // Render it
    html5QrcodeScanner.render(
      (decodedText) => {
        // Stop scanning after successful read to prevent multiple triggers
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        onScan(decodedText);
      },
      (error) => {
        if (onError) {
          onError(error);
        }
      }
    );

    scannerRef.current = html5QrcodeScanner;

    // Cleanup when component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner on unmount. ", error);
        });
      }
    };
  }, [onScan, onError]);

  return (
    <div id="html5qr-code-full-region" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden' }}></div>
  );
}
