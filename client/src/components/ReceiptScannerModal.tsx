import React, { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";

interface ReceiptData {
  merchant: string;
  total: number;
  date: string;
  categoryName: string;
  items: string[];
}

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanned: (data: ReceiptData) => void;
}

export default function ReceiptScannerModal({ isOpen, onClose, onScanned }: ReceiptScannerModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!imagePreview) {
      toast.error("Please upload or capture a receipt image first");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/ai/scan-receipt", { imageBase64: imagePreview });
      onScanned(res.data);
      toast.success("Receipt scanned successfully!");
      onClose();
    } catch (err) {
      toast.error("Receipt scanning failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--bg-surface, #1e1e2d)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 460,
          padding: 24,
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            🧾 AI OCR Receipt Scanner
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          Upload an image of your store receipt. AI Vision will automatically read the merchant, total, date, and items!
        </p>

        {/* Upload Box */}
        <div
          style={{
            border: "2px dashed var(--border)",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            background: "var(--bg-elevated)",
            marginBottom: 20,
            cursor: "pointer",
          }}
        >
          {imagePreview ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <img src={imagePreview} alt="Receipt Preview" style={{ maxHeight: 200, borderRadius: 8, objectFit: "contain" }} />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                style={{ fontSize: 12, color: "#f87171", background: "none", border: "none", cursor: "pointer" }}
              >
                🗑 Remove & Choose Another
              </button>
            </div>
          ) : (
            <label style={{ cursor: "pointer", display: "block" }}>
              <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>📷</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "block" }}>
                Click to upload receipt image
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Supports PNG, JPG, JPEG</span>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>
            Cancel
          </button>
          <button
            onClick={handleScan}
            disabled={loading || !imagePreview}
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #ec4899)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: imagePreview ? "pointer" : "not-allowed",
              opacity: imagePreview ? 1 : 0.6,
            }}
          >
            {loading ? "Scanning Receipt..." : "🔍 Scan with AI"}
          </button>
        </div>
      </div>
    </div>
  );
}
