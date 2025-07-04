import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Bot, Cloud, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [lang, setLang] = useState("en");
  const t = (key) => translations[key][lang];

  // Enhanced cursor glow effect
  const [coords, setCoords] = useState({ x: -100, y: -100 });
  useEffect(() => {
    const move = (e) => setCoords({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Enhanced cursor glow */}
      <motion.div
        className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl w-80 h-80"
        animate={{ x: coords.x, y: coords.y }}
        transition={{ type: "spring", mass: 0.1, stiffness: 100, damping: 20 }}
      />
      <motion.div
        className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-2xl w-40 h-40"
        animate={{ x: coords.x, y: coords.y }}
        transition={{ type: "spring", mass: 0.2, stiffness: 80, damping: 15 }}
      />

      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold tracking-wide bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent"
        >
          MMD<span className="text-purple-400">Lab</span>
        </motion.h1>
        <nav className="flex gap-6 items-center">
          <button 
            onClick={() => setLang("en")} 
            className={`px-3 py-1 rounded-lg transition-all ${
              lang === "en" 
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" 
                : "opacity-60 hover:opacity-100 hover:bg-white/5"
            }`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang("es")} 
            className={`px-3 py-1 rounded-lg transition-all ${
              lang === "es" 
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" 
                : "opacity-60 hover:opacity-100 hover:bg-white/5"
            }`}
          >
            ES
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center gap-8 px-4 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h2 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              {t("tagline")}
            </span>
          </h2>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto text-slate-300 leading-relaxed">
            {t("sub")}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <a 
            href="#contact" 
            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
          >
            {t("cta")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a 
            href="#services" 
            className="inline-flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 px-8 py-4 text-lg font-semibold hover:bg-purple-500/20 transition-all duration-300"
          >
            {t("learn_more")}
          </a>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 mt-32 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400">{t(stat.label)}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative z-10 mt-32 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            {t("services_title")}
          </h3>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            {t("services_sub")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map(({ icon: Icon, key }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-purple-500/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={32} className="text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-white">{t(`${key}_title`)}</h4>
                <p className="text-slate-300 leading-relaxed">{t(`${key}_desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 mt-32 mb-24 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            {t("contact_title")}
          </h3>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {t("contact_sub")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="mailto:info@mmdlab.tech" 
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            >
              Email
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="https://wa.me/34604925311" 
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            >
              WhatsApp
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-purple-500/20">
        <p className="text-slate-400">
          © 2025 MMD Lab • <a href="https://miqueasmd.github.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">Portfolio</a>
        </p>
      </footer>
    </div>
  );
}

const services = [
  { icon: Brain, key: "training" },
  { icon: Bot, key: "automation" },
  { icon: Cloud, key: "cloud" },
];

const stats = [
  { value: "38", label: "projects_completed" },
  { value: "99%", label: "client_satisfaction" },
  { value: "24/7", label: "support_available" },
  { value: "5+", label: "years_experience" },
];

const translations = {
  tagline: {
    es: "Soluciones inteligentes que aceleran tu negocio",
    en: "Smart solutions to accelerate your business",
  },
  sub: {
    es: "Formación técnica, agentes de IA, automatización e integraciones Cloud.",
    en: "Technical Training, AI Agents & Automation and Cloud integrations",
  },
  cta: {
    es: "Hablemos",
    en: "Let's talk",
  },
  learn_more: {
    es: "Saber más",
    en: "Learn more",
  },
  services_title: {
    es: "Nuestros Servicios",
    en: "Our Services",
  },
  services_sub: {
    es: "Soluciones especializadas para impulsar tu transformación digital",
    en: "Specialized solutions to drive your digital transformation",
  },
  training_title: {
    es: "Formación Técnica",
    en: "Technical Training",
  },
  training_desc: {
    es: "Workshops prácticos y mentoring personalizado para equipos que quieren ir un paso por delante en tecnología.",
    en: "Hands-on workshops and personalized mentoring to keep your team ahead of the technology curve.",
  },
  automation_title: {
    es: "Agentes IA & Automatización",
    en: "AI Agents & Automation",
  },
  automation_desc: {
    es: "Diseñamos y desplegamos agentes de IA y flujos de automatización que ahorran horas de trabajo manual.",
    en: "We design and deploy AI Agents & Automation flows that save hours of manual work.",
  },
  cloud_title: {
    es: "Integraciones Cloud",
    en: "Cloud Integrations",
  },
  cloud_desc: {
    es: "Conectamos tus aplicaciones con una infraestructura robusta y escalable.",
    en: "We connect your applications to robust and scalable infrastructure.",
  },
  contact_title: {
    es: "¿Listo para empezar?",
    en: "Ready to get started?",
  },
  contact_sub: {
    es: "Cuéntame tu reto y te responderé con una propuesta personalizada.",
    en: "Tell me about your challenge and get a personalized proposal.",
  },
  projects_completed: {
    es: "Proyectos Completados",
    en: "Projects Completed",
  },
  client_satisfaction: {
    es: "Satisfacción Cliente",
    en: "Client Satisfaction",
  },
  support_available: {
    es: "Soporte Disponible",
    en: "Support Available",
  },
  years_experience: {
    es: "Años Experiencia",
    en: "Years Experience",
  },
}; 