import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Appbar from "./Appbar";
import { UploadCloud } from "lucide-react";
import api from "./api"; // ✅ use configured axios instance

export default function UploadPage() {
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("note", note);

    try {
      const token = localStorage.getItem("token"); // 🔑 get JWT
      await api.post("/patient/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // ✅ send token
        },
      });
      alert("Uploaded successfully!");
      navigate("/patientdashboard");
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Upload failed!");
    }
  };

  return (
    <div style={{ background: "#f0f7fa", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <Appbar />

      {/* Hero Section */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "40vh",
          background: "linear-gradient(135deg, #0f2027, #002F6C)",
          padding: "0 20px",
          color: "#fff",
        }}
      >
        <UploadCloud size={64} color="#f58220" />
        <h1 style={{ fontSize: "2.8rem", fontWeight: "700", marginTop: "15px" }}>
          Upload Your Dental Images
        </h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "600px", lineHeight: "1.6" }}>
          Submit your dental images securely. Add notes for the admin and get professional
          annotations and reports.
        </p>
      </section>

      {/* Upload Form Section */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "60px 20px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            flex: "0 1 500px",
            background: "#fff",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            textAlign: "center",
            borderTop: "6px solid #f58220",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              marginBottom: "25px",
              color: "#002F6C",
            }}
          >
            Upload Form
          </h2>

          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label
              style={{
                fontWeight: "600",
                color: "#333",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Description
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Add any details for the admin..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                outline: "none",
                resize: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "30px", textAlign: "left" }}>
            <label
              style={{
                fontWeight: "600",
                color: "#333",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "#f58220",
              color: "#fff",
              border: "none",
              padding: "15px 0",
              width: "100%",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "1.1rem",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#e46f14")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#f58220")
            }
          >
            Upload
          </button>
        </form>
      </section>
    </div>
  );
}
