import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface QrScannerModalProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ onScan, onClose }) => {
  const qrRegionId = "uems-qr-scanner-region";
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Start scanning using html5-qrcode
    const html5Qrcode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5Qrcode;

    const startScanner = async () => {
      try {
        await html5Qrcode.start(
          { facingMode: "environment" }, // Back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // Success callback
            onScan(decodedText);
            stopScanner();
          },
          () => {
            // Silent error callback for scanning frames
          }
        );
      } catch (err) {
        console.error("Camera access failed: ", err);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Silent error
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '90%',
        maxWidth: '500px',
        padding: '2rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          color: 'hsl(var(--text-muted))',
          cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={24} style={{ color: 'hsl(var(--accent-indigo))' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Scan QR Ticket</h2>
        </div>

        <p style={{ color: 'hsl(var(--text-secondary))', textAlign: 'center', fontSize: '0.9rem' }}>
          Align the student's ticket QR code within the scanning frame.
        </p>

        <div id={qrRegionId} style={{
          width: '100%',
          maxWidth: '350px',
          aspectRatio: '1',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.1)',
          background: '#000'
        }}></div>

        <button onClick={onClose} className="btn-secondary" style={{ width: '100%' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};
