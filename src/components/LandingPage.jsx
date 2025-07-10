import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Bot, Cloud, ArrowRight, Search, Layout, Link2, TrendingUp, X } from "lucide-react";
import React from 'react';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

export default function LandingPage() {
  const [lang, setLang] = useState("en");
  const [showLegalNotice, setShowLegalNotice] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
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
        {/* Animated Counters below services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <AnimatedCounters lang={lang} />
        </div>
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
              © 2025 MMD Lab • <a href="https://portfolio.mmdlab.tech" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">Portfolio</a>
            </p>
            <div className="flex gap-6 text-sm">
              <button 
                onClick={() => setShowLegalNotice(true)}
                className="text-slate-400 hover:text-purple-400 transition-colors"
              >
                {t("legal_notice")}
              </button>
              <button 
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-slate-400 hover:text-purple-400 transition-colors"
              >
                {t("privacy_policy")}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Notice Modal */}
      {showLegalNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900/95 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{t("legal_notice_title")}</h2>
              <button
                onClick={() => setShowLegalNotice(false)}
                className="text-slate-400 hover:text-white transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>{t("legal_notice_owner")}</p>
              <p>
                {t("legal_notice_email")}{" "}
                <a href="mailto:info@mmdlab.tech" className="text-purple-400 hover:text-purple-300 transition-colors">
                  info@mmdlab.tech
                </a>
              </p>
              <p>{t("legal_notice_activity")}</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900/95 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{t("privacy_policy_title")}</h2>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="text-slate-400 hover:text-white transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>{t("privacy_policy_data")}</p>
              <p>{t("privacy_policy_storage")}</p>
            </div>
          </motion.div>
        </div>
      )}
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
  { value: "EN/ES", label: "bilingual_support" },
  { value: "∞", label: "possible_integrations" },
];

// Component for related counters
// Slow animation: 2 seconds per unit
// Animate money by 1 each time, synchronized with hours
function AnimatedCounters({ lang }) {
  const [hours, setHours] = useState(100);
  const [money, setMoney] = useState(10000);
  // Slow animation: 2 seconds per unit
  React.useEffect(() => {
    if (hours < 300) {
      const timeout = setTimeout(() => setHours(hours + 1), 2000);
      return () => clearTimeout(timeout);
    }
  }, [hours]);
  // Animate money by 1 each time, synchronized with hours
  React.useEffect(() => {
    const target = hours * 100;
    const diff = target - money;
    if (diff > 0) {
      const intervalMs = 2000 / diff; // distribute the 2s among the remaining dollars/euros
      const interval = setInterval(() => {
        setMoney((prev) => {
          if (prev + 1 >= target) return target;
          return prev + 1;
        });
      }, intervalMs);
      return () => clearInterval(interval);
    }
  }, [hours, money]);
  const rawProductivity = 2 + (hours - 100) * 0.5;
  const productivity = Number.isInteger(rawProductivity) ? rawProductivity : rawProductivity.toFixed(1);
  const labels = {
    time: { es: 'Gana tiempo', en: 'Save time' },
    money: { es: 'Ahorra dinero', en: 'Save money' },
    productivity: { es: 'Productividad', en: 'Productivity' },
  };
  return (
    <>
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{hours}h</div>
        <div className="text-sm text-slate-400">{labels.time[lang]}</div>
      </div>
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{lang === 'es' ? '€' : '$'}{money.toLocaleString()}</div>
        <div className="text-sm text-slate-400">{labels.money[lang]}</div>
      </div>
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{productivity}x</div>
        <div className="text-sm text-slate-400">{labels.productivity[lang]}</div>
      </div>
    </>
  );
} 