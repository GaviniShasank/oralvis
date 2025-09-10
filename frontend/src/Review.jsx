// PatientReview.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Doctorappbar from "./Doctorappbar";

export default function PatientReview() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportFile, setReportFile] = useState(null);

  // ✅ Fetch uploads + signed URLs
  const fetchUploads = async () => {
    try {
      const response = await axios.get("https://oralvis-g0qh.onrender.com/admin/submissions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const uploadsWithUrls = await Promise.all(
        response.data.map(async (sub) => {
          let imageUrl = null;
          let annotatedUrl = null;
          let reportUrl = null;

          const tokenHeader = {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          };

          if (sub.originalImageKey) {
            const signed = await axios.get("https://oralvis-g0qh.onrender.com/get-url", {
              params: { key: sub.originalImageKey },
              ...tokenHeader,
            });
            imageUrl = signed.data.url;
          }

          if (sub.annotatedImageKey) {
            const signed = await axios.get("https://oralvis-g0qh.onrender.com/get-url", {
              params: { key: sub.annotatedImageKey },
              ...tokenHeader,
            });
            annotatedUrl = signed.data.url;
          }

          if (sub.pdfKey) {
            const signed = await axios.get("https://oralvis-g0qh.onrender.com/get-url", {
              params: { key: sub.pdfKey },
              ...tokenHeader,
            });
            reportUrl = signed.data.url;
          }

          return { ...sub, imageUrl, annotatedUrl, reportUrl };
        })
      );

      setUploads(uploadsWithUrls);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching uploads:", err);
      setError("Failed to fetch uploads");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  // ✅ Upload annotated image
  const handleUploadAnnotation = async (id) => {
    if (!reportFile) return alert("Please select an annotated image!");

    const formData = new FormData();
    formData.append("annotated", reportFile);

    try {
      await axios.post(`https://oralvis-g0qh.onrender.com/admin/annotate/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Annotation uploaded!");
      setReportFile(null);
      fetchUploads();
    } catch (err) {
      console.error("Error uploading annotation:", err);
      alert("Failed to upload annotation");
    }
  };

  // ✅ Generate PDF report
  const handleGenerateReport = async (id) => {
    try {
      const response = await axios.post(
        `https://oralvis-g0qh.onrender.com/admin/generate-report/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Report generated!");
      console.log("Report URL:", response.data.reportUrl);
      fetchUploads();
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading uploads...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#f0f7fa",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Doctorappbar />

      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #0f2027, #002F6C)",
          color: "#fff",
          padding: "80px 20px 40px",
          textAlign: "center",
          borderBottomLeftRadius: "40px",
          borderBottomRightRadius: "40px",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "15px" }}>
          Patient Upload Review
        </h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "700px", lineHeight: "1.6", margin: "0 auto" }}>
          Review uploaded dental images, upload annotations, and generate PDF reports.
        </p>
      </section>

      {/* Uploads List */}
      <section
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "30px 20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "1000px" }}>
          {uploads.map((upload, index) => (
            <div
  key={upload._id || index}
  style={{
    display: "flex",
    flexDirection: "column",
    background: "#000",   // black background
    color: "#fff",        // white text
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)", // stronger shadow for black box
    padding: "20px",
    marginBottom: "20px",
    transition: "transform 0.3s",
  }}
>

              {/* Patient Info */}
              <div style={{ marginBottom: "15px" }}>
                <p style={{ fontWeight: "600", marginBottom: "5px" }}>
                  <b>Patient:</b> {upload.patientName}
                </p>
                <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: "5px" }}>
                  <b>Note:</b> {upload.note || "No Note"}
                </p>
                <p>
                  Status:{" "}
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "12px",
                      color: "#fff",
                      backgroundColor:
                        upload.status === "reported"
                          ? "#4CAF50"
                          : upload.status === "annotated"
                          ? "#2196F3"
                          : "#F58220",
                      fontWeight: "600",
                    }}
                  >
                    {upload.status}
                  </span>
                </p>
              </div>

              {/* Images */}
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "15px" }}>
                {upload.imageUrl && (
                  <div>
                    <p style={{ fontWeight: "600", marginBottom: "5px" }}>Original Image</p>
                    <img
                      src={upload.imageUrl}
                      alt="Original"
                      style={{ height: "100px", width: "100px", borderRadius: "10px", objectFit: "cover" }}
                    />
                  </div>
                )}
                {upload.annotatedUrl && (
                  <div>
                    <p style={{ fontWeight: "600", marginBottom: "5px" }}>Annotated Image</p>
                    <img
                      src={upload.annotatedUrl}
                      alt="Annotated"
                      style={{ height: "100px", width: "100px", borderRadius: "10px", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>

              {/* Report Download */}
              {upload.reportUrl && (
                <a
                  href={upload.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    background: "#4CAF50",
                    color: "#000000ff",
                    padding: "8px 15px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "600",
                    marginBottom: "15px",
                  }}
                >
                  Download Report PDF
                </a>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                  type="file"
                  onChange={(e) => setReportFile(e.target.files[0])}
                  style={{ flex: "1" }}
                />
                <button
                  onClick={() => handleUploadAnnotation(upload._id)}
                  style={{
                    backgroundColor: "#2196F3",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Upload Annotation
                </button>
                <button
                  onClick={() => handleGenerateReport(upload._id)}
                  style={{
                    backgroundColor: "#FF9800",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Generate Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}