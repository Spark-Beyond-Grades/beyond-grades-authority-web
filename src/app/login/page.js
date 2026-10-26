"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FiArrowRight, FiBarChart2, FiCalendar, FiCheck, FiLock, FiShield, FiUsers } from "react-icons/fi";
import { signInWithMicrosoft } from "@/lib/authMicrosoft";
import { signInWithGoogle } from "@/lib/authGoogle";
import { authErrorMessage } from "@/lib/authErrorMessage.mjs";
import { authSync } from "@/lib/api";
import styles from "./login.module.css";

const providers = [
  { id: "microsoft", name: "Microsoft", signIn: signInWithMicrosoft },
  { id: "google", name: "Google", signIn: signInWithGoogle },
];

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const pending = useRef(false);
  const [activeProvider, setActiveProvider] = useState(null);
  const [msg, setMsg] = useState(null);

  const handleLogin = async (provider) => {
    if (pending.current) return;
    pending.current = true;
    setMsg(null);
    setActiveProvider(provider.id);
    try {
      const { idToken } = await provider.signIn();
      await authSync(idToken);
      router.push("/dashboard");
    } catch (error) {
      if (error?.status === 403) {
        router.push("/access-denied");
        return;
      }
      setMsg(authErrorMessage(error));
    } finally {
      pending.current = false;
      setActiveProvider(null);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.brand}>
          <Image src="/beyond_grades_logo.png" alt="" width={48} height={48} priority />
          <div><strong>Beyond Grades</strong><span>Tracking growth beyond grades</span></div>
        </div>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>THE AUTHORITY PORTAL</span>
          <h2 id="hero-title">Great experiences.<br /><span>Meaningful growth.</span></h2>
          <p>Bring your events, teams, and feedback together. Make every experience a step forward.</p>
          <div className={styles.growthCard}>
            <div className={styles.growthHeading}>
              <span className={styles.growthIcon}><FiBarChart2 aria-hidden="true" /></span>
              <div><strong>Growth starts here</strong><span>From participation to progress</span></div>
            </div>
            <div className={styles.journey}>
              {[
                { Icon: FiCalendar, title: "Create", text: "Plan your events" },
                { Icon: FiUsers, title: "Connect", text: "Bring teams together" },
                { Icon: FiBarChart2, title: "Grow", text: "Turn feedback into insight" },
              ].map(({ Icon, title, text }) => (
                <div key={title} className={styles.journeyStep}>
                  <Icon aria-hidden="true" /><strong>{title}</strong><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.heroFooter}><FiCheck aria-hidden="true" /> Built for the people behind every event</div>
      </section>
      <section className={styles.loginPanel} aria-labelledby="login-title">
        <div className={styles.mobileBrand}>
          <Image src="/beyond_grades_logo.png" alt="" width={44} height={44} priority />
          <strong>Beyond Grades</strong>
        </div>
        <div className={styles.loginContent}>
          <span className={styles.portalBadge}><FiShield aria-hidden="true" /> Authority access</span>
          <h1 id="login-title">Welcome back<span>.</span></h1>
          <p className={styles.intro}>Your next great event starts here. Sign in with the account registered with your institution.</p>
          <div className={styles.signInCard}>
            <div className={styles.cardHeading}><h2>Sign in to your workspace</h2><p>Choose your account provider to continue.</p></div>
            <div className={styles.providerList}>
              {providers.map((provider) => {
                const isActive = activeProvider === provider.id;
                return (
                  <button key={provider.id} type="button" onClick={() => handleLogin(provider)} disabled={activeProvider !== null} aria-busy={isActive} className={styles.providerButton}>
                    <span className={styles.providerIcon}>
                      {isActive ? <span className={styles.spinner} aria-hidden="true" /> : provider.id === "google" ? <FcGoogle size={22} aria-hidden="true" /> : <MicrosoftIcon />}
                    </span>
                    <span>{isActive ? `Signing in with ${provider.name}…` : `Continue with ${provider.name}`}</span>
                    <FiArrowRight className={styles.buttonArrow} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
            <p className={styles.status} role="status" aria-live="polite">{activeProvider ? "Complete sign-in in the popup window." : "Use your approved institutional account."}</p>
            {msg && <div className={styles.error} role="alert">{msg}</div>}
            <div className={styles.secureNote}><FiLock aria-hidden="true" /><span>Secure sign-in. No extra password to remember.</span></div>
          </div>
          <p className={styles.accessNote}><FiShield aria-hidden="true" /><span>Access is limited to authorized accounts.<br />Need access? Contact your institution’s administrator.</span></p>
        </div>
        <footer className={styles.footer}>Beyond Grades <span aria-hidden="true">/</span> Authority Portal</footer>
      </section>
    </main>
  );
}
