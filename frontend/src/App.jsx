import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Signup from "./Signup.jsx";
import Signin from "./Signin.jsx";
import Upload from "./Uploadpage.jsx";
import Doctorsignin from "./Doctorsignin.jsx"
import Home from "./Home.jsx";
import ResetPassword from "./Reset.jsx";
import ForgotPassword from "./Forgotpassword.jsx";
import PatientDashboard from "./PatientDashboard.jsx";
import DoctorDashboard from "./DoctorDashboard.jsx";
import PatientReview from "./Review.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Navbar from "./Navbar.jsx";

function Layout() {
  const location = useLocation();
  const hideNavbar = ["/", "/uploadpage","/patientdashboard","/report","/doctordashboard","/review"].includes(location.pathname.toLowerCase());

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        backgroundColor: "#eeeeee",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxSizing: "border-box",
      }}
    >
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/doctorsignin" element={<Doctorsignin />} />
        <Route path="/resetpassword" element={<ResetPassword/>} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/uploadpage" element={<Upload />} />
        <Route path="/patientdashboard" element={<PatientDashboard/>} />
        <Route path="/doctordashboard" element={<DoctorDashboard/>} />
        <Route path="/review" element={<PatientReview/>} />
        w
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
