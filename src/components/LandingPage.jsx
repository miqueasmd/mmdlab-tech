import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Cloud, Lightbulb, ArrowRight, Search, Layout, Link2, TrendingUp } from "lucide-react";
import en from '../i18n/en.json';
import es from '../i18n/es.json';

export default function LandingPage() {
  // Spanish for browsers set to Spanish, English for everyone else
  const [lang, setLang] = useState(() =>
    navigator.language?.toLowerCase().startsWith("es") ? "es" : "en"
  );
  const dict = { en, es };
  const t = (key) => dict[lang][key];

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
          className="flex items-center gap-3 text-3xl font-bold tracking-wide"
        >
          <img src="/favicon.png" alt="" className="w-10 h-10 rounded-full" />
          <span className="bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            MMD<span className="text-purple-400">Lab</span>
          </span>
        </motion.h1>
        <nav className="flex gap-6 items-center">
          <button 
            onClick={() => setLang("en")} 
            className={`px-3 py-1 rounded-lg transition-all ${
              lang === "en" 
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" 
                : "opacity-60 hover:opacity-100 hover:bg-white/5"
            }`}
            aria-label="Switch language to English"
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
            aria-label="Cambiar idioma a español"
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
            aria-label={lang === 'es' ? 'Ir a la sección de contacto' : 'Go to contact section'}
          >
            {t("cta")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform self-center" />
          </a>
          <a 
            href="#services" 
            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            aria-label={lang === 'es' ? 'Ir a la sección de servicios' : 'Go to services section'}
          >
            {t("learn_more")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform self-center" />
          </a>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 mt-20 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8"
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
        <p className="text-center text-slate-400 mt-10">{t("training_note")}</p>
      </section>

      {/* Alternating Steps Section */}
      {/* Workflow/process section is fully internationalized using translation keys from i18n JSON files. */}
      <section className="relative z-10 max-w-5xl mx-auto my-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
          {t('workflow_title')}
        </h2>
        <div className="relative flex flex-col gap-6 md:gap-4">
          {/* Vertical timeline line (desktop only, always behind connectors) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-white/80 z-0 rounded-full" />
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center md:items-center relative z-10">
            {/* Left box */}
            <div className="w-full md:w-1/2 flex flex-col items-end pr-0 md:pr-8">
              <div className="flex items-center gap-4 bg-slate-900/60 border border-purple-500/20 rounded-2xl p-6 shadow-lg w-full md:max-w-md">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-3">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-extrabold text-white">1.</span>
                    {/* Step 1 title from translations */}
                    <h3 className="text-xl font-bold">{t('step1_title')}</h3>
                  </div>
                  {/* Step 1 description from translations */}
                  <p className="text-slate-300 text-sm">{t('step1_desc')}</p>
                </div>
              </div>
            </div>
            {/* Timeline column (desktop only) */}
            <div className="hidden md:flex flex-col items-center justify-center w-0 relative z-10">
              <span className="timeline-connector-left" />
            </div>
            <div className="hidden md:block w-1/2" />
          </div>
          {/* Step 2 */}
          <div className="flex flex-col md:flex-row items-center md:items-center relative z-10">
            <div className="hidden md:block w-1/2" />
            <div className="hidden md:flex flex-col items-center justify-center w-0 relative z-10">
              <span className="timeline-connector-right" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-start pl-0 md:pl-8">
              <div className="flex items-center gap-4 bg-slate-900/60 border border-purple-500/20 rounded-2xl p-6 shadow-lg w-full md:max-w-md">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-3">
                  <Layout className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-extrabold text-white">2.</span>
                    {/* Step 2 title from translations */}
                    <h3 className="text-xl font-bold">{t('step2_title')}</h3>
                  </div>
                  {/* Step 2 description from translations */}
                  <p className="text-slate-300 text-sm">{t('step2_desc')}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center md:items-center relative z-10">
            {/* Left box */}
            <div className="w-full md:w-1/2 flex flex-col items-end pr-0 md:pr-8">
              <div className="flex items-center gap-4 bg-slate-900/60 border border-purple-500/20 rounded-2xl p-6 shadow-lg w-full md:max-w-md">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-3">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-extrabold text-white">3.</span>
                    {/* Step 3 title from translations */}
                    <h3 className="text-xl font-bold">{t('step3_title')}</h3>
                  </div>
                  {/* Step 3 description from translations */}
                  <p className="text-slate-300 text-sm">{t('step3_desc')}</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center w-0 relative z-10">
              <span className="timeline-connector-left" />
            </div>
            <div className="hidden md:block w-1/2" />
          </div>
          {/* Step 4 */}
          <div className="flex flex-col md:flex-row items-center md:items-center relative z-10">
            <div className="hidden md:block w-1/2" />
            <div className="hidden md:flex flex-col items-center justify-center w-0 relative z-10">
              <span className="timeline-connector-right" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-start pl-0 md:pl-8">
              <div className="flex items-center gap-4 bg-slate-900/60 border border-purple-500/20 rounded-2xl p-6 shadow-lg w-full md:max-w-md">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-3">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-extrabold text-white">4.</span>
                    {/* Step 4 title from translations */}
                    <h3 className="text-xl font-bold">{t('step4_title')}</h3>
                  </div>
                  {/* Step 4 description from translations */}
                  <p className="text-slate-300 text-sm">{t('step4_desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Timeline connector styles */}
        <style jsx>{`
          @media (min-width: 768px) {
            .timeline-connector-left, .timeline-connector-right {
              position: relative;
              display: flex;
              align-items: center;
              height: 100%;
              min-height: 0;
            }
            .timeline-connector-left::before {
              content: '';
              position: absolute;
              right: 100%;
              top: 50%;
              transform: translateY(-50%);
              width: 40px;
              height: 3px;
              background: white;
              border-radius: 2px;
              margin-right: -2px;
            }
            .timeline-connector-left::after {
              content: '';
              position: absolute;
              right: -8px;
              top: 50%;
              transform: translateY(-50%);
              width: 16px;
              height: 16px;
              background: white;
              border: 3px solid #c4b5fd;
              border-radius: 50%;
              z-index: 2;
            }
            .timeline-connector-right::before {
              content: '';
              position: absolute;
              left: 100%;
              top: 50%;
              transform: translateY(-50%);
              width: 40px;
              height: 3px;
              background: white;
              border-radius: 2px;
              margin-left: -2px;
            }
            .timeline-connector-right::after {
              content: '';
              position: absolute;
              left: -8px;
              top: 50%;
              transform: translateY(-50%);
              width: 16px;
              height: 16px;
              background: white;
              border: 3px solid #c4b5fd;
              border-radius: 50%;
              z-index: 2;
            }
          }
        `}</style>
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
              aria-label={lang === 'es' ? 'Enviar email a MMD Lab' : 'Send email to MMD Lab'}
            >
              Email
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform self-center" />
            </a>
            <a 
              href="https://wa.me/34604925311" 
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              aria-label={lang === 'es' ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
            >
              WhatsApp
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform self-center" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-purple-500/20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <p className="text-slate-400">
              © 2026 Miqueas Molina Delgado • <a href="https://portfolio.mmdlab.tech" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">Portfolio</a> • <a href="https://www.linkedin.com/in/miqueas-molina-ai-solutions-engineer-agents-automation" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">LinkedIn</a>
            </p>
            {/* Static pages in public/, readable without JavaScript */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href={lang === "es" ? "/servicios-web/" : "/en/web-services/"} className="text-slate-400 hover:text-purple-400 transition-colors">
                {t("web_services")}
              </a>
              <a href={lang === "es" ? "/aviso-legal/" : "/en/legal-notice/"} className="text-slate-400 hover:text-purple-400 transition-colors">
                {t("legal_notice")}
              </a>
              <a href={lang === "es" ? "/privacidad/" : "/en/privacy/"} className="text-slate-400 hover:text-purple-400 transition-colors">
                {t("privacy_policy")}
              </a>
              <a href={lang === "es" ? "/condiciones/" : "/en/terms/"} className="text-slate-400 hover:text-purple-400 transition-colors">
                {t("terms_of_service")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const services = [
  { icon: Bot, key: "automation" },
  { icon: Lightbulb, key: "consulting" },
  { icon: Cloud, key: "cloud" },
];

// Figures given by the owner (2026-11-13): 39 projects on Upwork and about 12 on Malt; satisfaction as he states it
const stats = [
  { value: "+50", label: "projects_completed" },
  { value: "100%", label: "client_satisfaction" },
  { value: "EN / ES / FR", label: "trilingual_support" },
];
