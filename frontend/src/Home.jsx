/* Home.jsx */
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useCallback } from "react";
import Navbar from "./Navbar";

export default function Home() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6 },
    }),
  };

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1, delay: 0.5 } },
  };

  return (
    <div className="container relative">
      <style>{`
        .container { min-height: 100vh; display: flex; flex-direction: column; background: #f0f7fa; position: relative; overflow: hidden; font-family: Arial, sans-serif; }
        .particles { position: absolute; inset: 0; z-index: 0; }

        /* Hero Section */
        .hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 100px 20px 40px; position: relative; z-index: 10; max-height: 600px; }
        .hero-title { font-size: 2.8rem; font-weight: bold; color: #002F6C; margin-bottom: 15px; }
        .hero-text { font-size: 1.15rem; color: #333; max-width: 600px; line-height: 1.5; }

        .orange { color: #F58220; }

        /* Services Section */
        .services { padding: 60px 20px; background: #ffffff; }
        .section-title { text-align: center; font-size: 2.2rem; font-weight: bold; color: #002F6C; margin-bottom: 50px; }
        .service-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; max-width: 1100px; margin: 0 auto; }
        .service-card { background: #f9fbfd; padding: 25px 15px; border-radius: 16px; box-shadow: 0 8px 18px rgba(0,0,0,0.08); transition: all 0.3s ease; position: relative; text-align: center; overflow: hidden; }
        .service-card:hover { transform: translateY(-6px) scale(1.03); box-shadow: 0 12px 22px rgba(0,0,0,0.12); }
        .service-card h4 { font-size: 1.4rem; color: #002F6C; margin-bottom: 12px; }
        .service-card p { color: #555; font-size: 0.95rem; line-height: 1.5; }
        .service-card span { position: absolute; bottom: 18px; right: 18px; font-size: 1.6rem; color: #F58220; opacity: 0; }
        .service-card:hover span { opacity: 1; animation: arrowAnim 0.6s infinite alternate; }
        @keyframes arrowAnim { 0% { transform: translateX(0); } 100% { transform: translateX(8px); } }

        /* Footer */
        .footer { background: #002F6C; color: white; display: flex; justify-content: center; align-items: center; padding: 20px 0; font-size: 14px; position: relative; z-index: 10; }
      `}</style>

      {/* Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "#f0f7fa" } },
          particles: {
            number: { value: 50, density: { enable: true, area: 800 } },
            color: { value: ["#002F6C", "#F58220"] },
            shape: { type: "circle" },
            opacity: { value: 0.6 },
            size: { value: { min: 2, max: 5 } },
            move: { enable: true, speed: 1, outModes: { default: "out" } },
            links: { enable: true, color: "#002F6C", distance: 120, opacity: 0.25, width: 1 },
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" }, onClick: { enable: true, mode: "push" } },
            modes: { grab: { distance: 200, line_linked: { opacity: 0.5 } }, push: { quantity: 3 } },
          },
          retina_detect: true,
        }}
        className="particles absolute top-0 left-0 w-full h-full"
      />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <motion.h2 variants={heroVariants} initial="hidden" animate="visible" className="hero-title">
          Welcome to <span className="orange">OralVis</span>
        </motion.h2>
        <motion.p variants={heroVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="hero-text">
          AI-powered oral health platform. Upload dental images, get professional annotations, and receive detailed reports with personalized recommendations.
        </motion.p>
      </section>

      {/* Features Section */}
      <section className="services">
        <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="section-title">
          Our Services
        </motion.h3>
        <div className="service-grid">
          {[
            { title: "Patient Image Upload", desc: "Securely upload dental images and personal information for professional analysis." },
            { title: "Professional Image Annotation", desc: "Admins can annotate teeth images to highlight oral health issues and provide recommendations." },
            { title: "Comprehensive PDF Reports", desc: "Get downloadable reports with annotated images, oral health status, and treatment guidance." },
          ].map((feature, i) => (
            <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" whileInView="visible" whileHover={{ scale: 1.05 }} className="service-card">
              <h4>{feature.title}</h4>
              <p>{feature.desc}</p>
              <motion.span>→</motion.span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <motion.footer variants={footerVariants} initial="hidden" whileInView="visible" className="footer">
        <p>© {new Date().getFullYear()} OralVis. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}
