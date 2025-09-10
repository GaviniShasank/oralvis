import React, { useState, useEffect } from "react";
import axios from "axios";
import Doctorappbar from "./Doctorappbar";

export default function DoctorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data from the backend
  const fetchSubmissions = async () => {
    try {
      // Replace with your actual backend URL
      const response = await axios.get("https://oralvis-g0qh.onrender.com/admin/submissions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSubmissions(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to fetch submissions. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading patient data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <p>{error}</p>
      </div>
    );
  }

  // Helper function to count uploads per patient
  const getPatientData = () => {
    const patientMap = {};
    submissions.forEach(sub => {
      const patientId = sub.email; 
      if (!patientMap[patientId]) {
        patientMap[patientId] = {
          name: sub.patientName,
          lastUpload: new Date(sub.createdAt),
          uploads: 1,
          status: sub.status === "reported" ? "Completed" : "Pending",
        };
      } else {
        patientMap[patientId].uploads += 1;
        // Update last upload and status
        if (new Date(sub.createdAt) > patientMap[patientId].lastUpload) {
          patientMap[patientId].lastUpload = new Date(sub.createdAt);
        }
        if (sub.status === "reported") {
          patientMap[patientId].status = "Completed";
        }
      }
    });
    return Object.values(patientMap);
  };

  const patients = getPatientData();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f0f7fa", fontFamily: "Arial, sans-serif" }}>
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
        <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "15px" }}>Doctor Dashboard</h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "700px", lineHeight: "1.6", margin: "0 auto" }}>
          Overview of all patients, their uploads, and report status. You can see pending uploads and mark them as completed after reviewing.
        </p>
      </section>

      {/* Patients Table */}
      <section style={{ flex: 1, display: "flex", justifyContent: "center", padding: "20px" }}>
        <div style={{ width: "100%", maxWidth: "1200px", height: "100%" }}>
          <div
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              overflowX: "auto",
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#002F6C", color: "#fff" }}>
                  <th style={{ padding: "12px 15px", textAlign: "left" }}>Patient Name</th>
                  <th style={{ padding: "12px 15px", textAlign: "left" }}>Last Upload</th>
                  <th style={{ padding: "12px 15px", textAlign: "left" }}>Number of Uploads</th>
                  <th style={{ padding: "12px 15px", textAlign: "left" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid #ddd", transition: "background 0.3s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 15px", color: "#002F6C", fontWeight: "600" }}>{patient.name}</td>
                    <td style={{ padding: "12px 15px", color: "#333" }}>{patient.lastUpload.toLocaleDateString()}</td>
                    <td style={{ padding: "12px 15px", color: "#333" }}>{patient.uploads}</td>
                    <td style={{ padding: "12px 15px" }}>
                      <span
                        style={{
                          padding: "5px 12px",
                          borderRadius: "12px",
                          color: "#fff",
                          fontWeight: "600",
                          backgroundColor: patient.status === "Completed" ? "#4CAF50" : "#F58220",
                        }}
                      >
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}