import React, { useState, useEffect } from "react";
import Appbar from "./Appbar";
import api from "./api"; // ✅ use axios instance

export default function PatientDashboard() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/patient/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err.response?.data || err.message);
      }
    };

    fetchHistory();
  }, []);

  const downloadPDF = (url) => {
    if (url) window.open(url, "_blank");
    else alert("No report available yet!");
  };

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
      <Appbar />

      {/* Hero Section */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 20px 40px",
          background: "linear-gradient(135deg, #0f2027, #002F6C)",
          color: "#fff",
          borderBottomLeftRadius: "40px",
          borderBottomRightRadius: "40px",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "15px" }}>
          Welcome, Patient
        </h1>
        <p style={{ fontSize: "1.15rem", maxWidth: "600px", lineHeight: "1.6" }}>
          View all your uploaded dental images and download your detailed reports.
        </p>
      </section>

      {/* Table Section */}
      <section
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#002F6C",
              marginBottom: "20px",
            }}
          >
            Uploaded History
          </h2>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              background: "#fff",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "1rem",
                color: "#333",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#002F6C", color: "#fff" }}>
                  <th style={{ padding: "12px 15px", textAlign: "left" }}>Note</th>
                  <th style={{ padding: "12px 15px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "12px 15px", textAlign: "left" }}>Image</th>
                  <th style={{ padding: "12px 15px", textAlign: "left" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #ddd",
                        transition: "background 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f0f8ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "12px 15px" }}>
                        {item.note || "No Note"}
                      </td>
                      <td style={{ padding: "12px 15px" }}>
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px 15px" }}>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt="Dental Upload"
                            style={{
                              height: "60px",
                              width: "60px",
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td style={{ padding: "12px 15px" }}>
                        <button
                          onClick={() => downloadPDF(item.reportUrl)}
                          style={{
                            backgroundColor: "#4CAF50",
                            color: "#fff",
                            border: "none",
                            padding: "8px 15px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "all 0.3s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#3e8e41")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = "#4CAF50")
                          }
                        >
                          {item.reportUrl ? "Download PDF" : "Pending Report"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                      No history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
