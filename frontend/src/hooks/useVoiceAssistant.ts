import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNearbyJobs, getJobs, applyForJob } from "@/services/jobService";
import { getTransactions, getExpenses } from "@/services/walletService";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AssistantState = "idle" | "listening" | "processing" | "speaking" | "error";
export type Lang = "en" | "hi" | "mr";

export interface JobPreview {
  _id: string;
  title: string;
  wage: number;
  location: string;
  skillRequired?: string;
}

export interface EarningsSummary {
  totalEarned: number;
  totalSpent: number;
  net: number;
}

export interface VoiceAssistantHook {
  state: AssistantState;
  transcript: string;
  response: string;
  jobCount: number | null;
  jobList: JobPreview[];
  earnings: EarningsSummary | null;
  applyingId: string | null;
  detectedLang: Lang;
  applyToJob: (id: string) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  cancelAll: () => void;
  isSupported: boolean;
}

type Intent =
  | "nearby_work"
  | "find_work"
  | "my_work"
  | "earnings"
  | "wallet"
  | "apply_job_idx"
  | "projects"
  | "home"
  | "profile";

const WORKER_BASE = "/dashboard/worker";

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE DETECTION
// Priority: Marathi → Hindi → English
// ─────────────────────────────────────────────────────────────────────────────
function detectLang(text: string): Lang {
  const t = text.toLowerCase();

  // Marathi-specific keywords (never used in Hindi)
  const mr = [
    "kaam", "paisa", "maze", "maza", "majha", "mazyacha", "aaj", "aaaj",
    "nauka", "naukri", "dikhva", "dakha", "kami", "kamava", "nazdik",
    "javalik", "aahe", "ahe", "hote", "karya", "nahi", "nako",
    "kiti", "kititi", "milale", "milala", "aarthik", "kharch",
  ];
  // Hindi-specific keywords
  const hi = [
    "kaam", "paisa", "paise", "mera", "meri", "aaj", "paas", "dikhao",
    "kamai", "kamayi", "chahiye", "kitna", "nazdik", "mere", "nikaliye",
    "shuru", "dobara", "samajh", "kripya", "mujhe", "batao", "dekho",
    "dikha", "kholo", "khul", "jao", "chalo", "abhi", "kal",
  ];

  // Marathi Unicode character check (Devanagari used for Marathi)
  const hasMrChars = /[\u0900-\u097F]/.test(text);

  // Simple heuristic: check Marathi-exclusive words first
  const mrExclusive = [
    "maze", "maza", "majha", "mazyacha", "javalik", "aahe", "ahe",
    "hote", "karya", "nako", "kiti", "milale", "milala", "aarthik",
    "dikhva", "dakha", "kami", "kamava",
  ];
  if (mrExclusive.some(k => t.includes(k))) return "mr";
  if (hasMrChars) return "mr"; // script check

  // Hindi check
  if (hi.some(k => t.includes(k))) return "hi";

  return "en";
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE STRINGS — all three languages
// ─────────────────────────────────────────────────────────────────────────────
const R = {
  findWork: {
    en: (n: number) => `Here are ${n} available jobs.`,
    hi: (n: number) => `${n} naukri mil gayi. Dekho.`,
    mr: (n: number) => `${n} kame sapadali. Paha.`,
  },
  noJobs: {
    en: () => "No jobs available right now.",
    hi: () => "Abhi koi kaam nahi mila.",
    mr: () => "Aata koi kaam nahi aahe.",
  },
  nearbyFound: {
    en: (n: number) => `Found ${n} job${n !== 1 ? "s" : ""} near you.`,
    hi: (n: number) => `Aapke paas ${n} kaam mila${n !== 1 ? "" : ""}. Dekho.`,
    mr: (n: number) => `Tumchya javalik ${n} kaam sapadali.`,
  },
  nearbyNone: {
    en: () => "No jobs available nearby right now.",
    hi: () => "Abhi aapke paas koi kaam nahi hai.",
    mr: () => "Aata javalik koi kaam nahi aahe.",
  },
  locationError: {
    en: () => "Could not get your location. Please allow location access.",
    hi: () => "Location nahi mili. Kripya location allow karen.",
    mr: () => "Location milali nahi. Krupaya location allow kara.",
  },
  myWork: {
    en: () => "Opening your current work assignments.",
    hi: () => "Aapka mौजuda kaam dikha raha hoon.",
    mr: () => "Tumcha sadhyacha kaam dakhavat aahe.",
  },
  earnings: {
    en: (e: number, s: number, n: number) =>
      `You earned ₹${e.toLocaleString()} and spent ₹${s.toLocaleString()}. Net income is ₹${n.toLocaleString()}.`,
    hi: (e: number, s: number, n: number) =>
      `Aapne ₹${e.toLocaleString()} kamaya aur ₹${s.toLocaleString()} kharch kiya. Net kamai ₹${n.toLocaleString()} hai.`,
    mr: (e: number, s: number, n: number) =>
      `Tumhi ₹${e.toLocaleString()} kamavsle ani ₹${s.toLocaleString()} kharch kesle. Net kamai ₹${n.toLocaleString()} aahe.`,
  },
  earningsError: {
    en: () => "Could not fetch your earnings. Please try again.",
    hi: () => "Kamai load nahi ho payi. Dobara koshish karen.",
    mr: () => "Kamai load zali nahi. Punha praytna kara.",
  },
  projects: {
    en: () => "Opening your portfolio and projects.",
    hi: () => "Aapka portfolio aur projects dikha raha hoon.",
    mr: () => "Tumcha portfolio ani projects dakhavat aahe.",
  },
  profile: {
    en: () => "Opening your profile.",
    hi: () => "Aapka profile khul raha hai.",
    mr: () => "Tumcha profile ughdat aahe.",
  },
  home: {
    en: () => "Going to your dashboard.",
    hi: () => "Dashboard par ja raha hoon.",
    mr: () => "Dashboard kade jat aahe.",
  },
  applied: {
    en: () => "Applied successfully!",
    hi: () => "Apply ho gaya!",
    mr: () => "Safaltapurwak apply zaale!",
  },
  applyError: {
    en: () => "Already applied or application failed.",
    hi: () => "Pehle se apply kiya hai ya application fail ho gayi.",
    mr: () => "Aadheech apply kele aahe kiva application fail zali.",
  },
  wallet: {
    en: () => "Opening your wallet.",
    hi: () => "Aapka wallet khol raha hoon.",
    mr: () => "Tumche wallet ughdat aahe.",
  },
  applyingJob: {
    en: (num: number) => `Applying for job ${num}...`,
    hi: (num: number) => `Job number ${num} ke liye apply kar raha hoon...`,
    mr: (num: number) => `Job number ${num} kariyta lagoo karat aahe...`,
  },
  invalidJobIndex: {
    en: () => "Sorry, I couldn't find a job with that number.",
    hi: () => "Maaf kijiye, us number ka kaam nahi mila.",
    mr: () => "Maaf kara, tya number che kaam sapadle nahi.",
  },
  fallback: {
    en: () => "Sorry, I didn't catch that. Try: find work, my earnings, or show nearby work.",
    hi: () => "Samajh nahi aaya. Bolein: 'kaam dikhao', 'meri kamai', ya 'paas mein kaam'.",
    mr: () => "Samajle nahi. Sanga: 'kaam dakha', 'maze paise', kiva 'javalik kaam'.",
  },
  micDenied: {
    en: () => "Microphone access denied. Please allow mic.",
    hi: () => "Microphone ki permission nahi mili. Kripya allow karen.",
    mr: () => "Microphone chi permission milali nahi. Krupaya allow kara.",
  },
  noSpeech: {
    en: () => "No speech detected. Please speak clearly.",
    hi: () => "Kuch suna nahi. Thoda zor se bolein.",
    mr: () => "Kahi aaikle nahi. Motthayne bola.",
  },
  voiceError: {
    en: () => "Voice error. Please try again.",
    hi: () => "Voice error. Dobara koshish karen.",
    mr: () => "Voice error. Punha praytna kara.",
  },
};

// helper to get the response in the right language
function r<T extends (...args: any[]) => string>(
  map: { en: T; hi: T; mr: T },
  lang: Lang,
  ...args: Parameters<T>
): string {
  return (map[lang] as any)(...args);
}

// TTS locale map
const ttsLocale: Record<Lang, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
};

// ─────────────────────────────────────────────────────────────────────────────
// INTENT DETECTION — covers English, Hindi, Marathi keywords
// ─────────────────────────────────────────────────────────────────────────────
function detectIntent(raw: string): Intent | null {
  const t = raw.toLowerCase().trim();

  // NEARBY — check before find_work
  const nearbyKw = [
    "near me", "nearby", "paas mein", "aas paas", "near by",
    "close to me", "around me", "show work near", "work near", "jobs near",
    "kaam paas", "nazdik", "mere paas",
    // Marathi
    "javalik", "javalik kaam", "javalik naukri", "nazdik kaam",
  ];
  if (nearbyKw.some(kw => t.includes(kw))) return "nearby_work";

  // EARNINGS / FINANCES
  const earningsKw = [
    "earning", "earnings", "my earning", "show earning",
    "paisa", "paise", "kitna paisa", "kitna paise",
    "income", "salary", "finance", "finances",
    "kamai", "kamayi", "meri kamai", "kitna mila",
    "how much", "money", "payment", "rupee", "rupees",
    "today earning", "aaj ki kamai",
    // Marathi
    "maze paise", "maza paisa", "aarthik", "kiti milale", "kiti kamavle",
    "kamavlele", "kharch", "milale kititi",
  ];
  if (earningsKw.some(kw => t.includes(kw))) return "earnings";

  // MY WORK
  const myWorkKw = [
    "my work", "my job", "my jobs", "aaj ka kaam", "mera kaam",
    "meri job", "current work", "current job", "assigned", "booked job",
    "ongoing", "my task", "my assignment", "what work", "what job", "mujhe kaam",
    // Marathi
    "maza kaam", "maze kaam", "aajcha kaam", "sadhyacha kaam",
    "konte kaam", "konti naukri",
  ];
  if (myWorkKw.some(kw => t.includes(kw))) return "my_work";

  // WALLET
  const walletKw = [
    "wallet", "batua", "khata", "paishachi pishvi", "show wallet", "open wallet",
    "mera wallet", "maza wallet", "wallet dakha", "wallet ughda", "aple khate", "account balance"
  ];
  if (walletKw.some(kw => t.includes(kw))) return "wallet";

  // APPLY JOB INDEX
  const applyIdxKw = [
    "apply", "lagu kara", "lagoo kara", "arja", "pahila", "dusra", "tisra", "chautha",
    "first", "second", "third", "fourth", "ek", "don", "teen", "char", "do", "one", "two", "three", "four", "1", "2", "3", "4"
  ];
  if ((t.includes("apply") || t.includes("lagu") || t.includes("arja") || t.includes("lagoo")) && applyIdxKw.some(kw => t.includes(kw))) return "apply_job_idx";

  // PROJECTS / PORTFOLIO
  const projectsKw = [
    "project", "projects", "portfolio", "my portfolio", "show project",
    "project dikhao", "mera portfolio", "long term", "contractor work",
    // Marathi
    "maze portfolio", "prakalp", "prakalp dakha",
  ];
  if (projectsKw.some(kw => t.includes(kw))) return "projects";

  // PROFILE
  const profileKw = [
    "my profile", "profile", "mera profile", "edit profile", "account",
    // Marathi
    "maza profile", "maze profile",
  ];
  if (profileKw.some(kw => t.includes(kw))) return "profile";

  // HOME / DASHBOARD
  const homeKw = [
    "home", "dashboard", "go home", "main page", "main screen", "shuru",
    // Marathi
    "muku paan", "mukha paan",
  ];
  if (homeKw.some(kw => t.includes(kw))) return "home";

  // FIND WORK (most generic — check last)
  const findWorkKw = [
    "find work", "find job", "find jobs", "show work", "show jobs",
    "kaam dikhao", "kaam dhundho", "kaam chahiye", "job chahiye",
    "search work", "search job", "look for work", "look for job",
    "get work", "get job", "show me work", "dikhao",
    // Marathi
    "kaam dakha", "kaam dikhva", "kaam sanga", "naukri dakha",
    "naukri dikhva", "kaam", "konte kaam aahe",
  ];
  if (findWorkKw.some(kw => t.includes(kw))) return "find_work";

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TTS HELPER
// ─────────────────────────────────────────────────────────────────────────────
function speak(text: string, lang: Lang, onEnd?: () => void) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = ttsLocale[lang];
  utt.rate = 1.05;
  utt.pitch = 1;

  // Load voices and pick best match
  const pickVoice = () => {
    const voices = synth.getVoices();
    const preferred =
      voices.find(v => v.lang === ttsLocale[lang]) ||
      voices.find(v => v.lang.startsWith(ttsLocale[lang].split("-")[0])) ||
      voices.find(v => v.lang.startsWith("en")); // fallback to any English
    if (preferred) utt.voice = preferred;
    if (onEnd) utt.onend = onEnd;
    synth.speak(utt);
  };

  // Voices may not be loaded yet on first call
  if (synth.getVoices().length > 0) {
    pickVoice();
  } else {
    synth.onvoiceschanged = () => { synth.onvoiceschanged = null; pickVoice(); };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB NORMALIZER
// ─────────────────────────────────────────────────────────────────────────────
function normalizeJob(j: any): JobPreview {
  const loc =
    typeof j.location === "object"
      ? j.location?.address || "Location hidden"
      : j.location || "Location hidden";
  return { _id: j._id, title: j.title, wage: j.wage ?? 0, location: loc, skillRequired: j.skillRequired };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────
export function useVoiceAssistant(): VoiceAssistantHook {
  const navigate = useNavigate();
  const [state, setState] = useState<AssistantState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [jobList, setJobList] = useState<JobPreview[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<Lang>("en");

  const recognitionRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const stateRef = useRef<AssistantState>("idle");

  // Keep stateRef in sync with state so event handlers don't go stale
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // ── Apply to job ──────────────────────────────────────────────────────────
  const applyToJob = useCallback(async (id: string) => {
    setApplyingId(id);
    try {
      await applyForJob(id);
      setJobList(prev => prev.filter(j => j._id !== id));
      const msg = r(R.applied, detectedLang);
      setResponse(msg);
      speak(msg, detectedLang);
    } catch {
      const msg = r(R.applyError, detectedLang);
      setResponse(msg);
      speak(msg, detectedLang);
    } finally {
      setApplyingId(null);
    }
  }, [detectedLang]);

  // ── Nearby GPS jobs ───────────────────────────────────────────────────────
  const handleNearbyWork = useCallback(async (lang: Lang) => {
    setState("processing");
    setJobList([]);
    setEarnings(null);
    try {
      const position = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
      );
      const { latitude: lat, longitude: lng } = position.coords;
      const data = await getNearbyJobs(lat, lng, 10);
      const jobs: any[] = data?.data ?? [];
      const count = jobs.length;

      if (!mountedRef.current) return;
      setJobCount(count);
      setJobList(jobs.slice(0, 4).map(normalizeJob));

      const msg = count > 0
        ? r(R.nearbyFound, lang, count)
        : r(R.nearbyNone, lang);

      setResponse(msg);
      setState("speaking");
      speak(msg, lang, () => { if (mountedRef.current) setState("idle"); });
    } catch {
      if (!mountedRef.current) return;
      const msg = r(R.locationError, lang);
      setResponse(msg);
      setState("speaking");
      speak(msg, lang, () => { if (mountedRef.current) setState("idle"); });
    }
  }, []);

  // ── All jobs ──────────────────────────────────────────────────────────────
  const handleFindWork = useCallback(async (lang: Lang) => {
    setState("processing");
    setJobList([]);
    setEarnings(null);
    try {
      const data = await getJobs();
      const jobs: any[] = data?.data ?? [];
      setJobCount(jobs.length);
      setJobList(jobs.slice(0, 4).map(normalizeJob));

      const msg = jobs.length > 0
        ? r(R.findWork, lang, jobs.length)
        : r(R.noJobs, lang);

      setResponse(msg);
      setState("speaking");
      speak(msg, lang, () => { if (mountedRef.current) setState("idle"); });
    } catch {
      const msg = r(R.noJobs, lang);
      setResponse(msg);
      setState("speaking");
      speak(msg, lang, () => { if (mountedRef.current) setState("idle"); });
    }
  }, []);

  // ── Earnings ──────────────────────────────────────────────────────────────
  const handleEarnings = useCallback(async (lang: Lang) => {
    setState("processing");
    setJobList([]);
    setEarnings(null);
    try {
      const [txData, expData] = await Promise.all([getTransactions(), getExpenses()]);
      const jobEarnings = (txData?.data ?? []).filter(
        (tx: any) => tx.type === "credit" && tx.onModel === "Job"
      );
      const totalEarned = jobEarnings.reduce((acc: number, tx: any) => acc + (tx.amount ?? 0), 0);
      const totalSpent = (expData?.data ?? []).reduce((acc: number, e: any) => acc + (e.amount ?? 0), 0);
      const net = totalEarned - totalSpent;

      if (!mountedRef.current) return;
      setEarnings({ totalEarned, totalSpent, net });

      const msg = r(R.earnings, lang, totalEarned, totalSpent, net);
      setResponse(msg);
      setState("speaking");
      speak(msg, lang, () => { if (mountedRef.current) setState("idle"); });
      navigate(`${WORKER_BASE}/wallet`);
    } catch {
      const msg = r(R.earningsError, lang);
      setResponse(msg);
      setState("speaking");
      speak(msg, lang, () => { if (mountedRef.current) setState("idle"); });
    }
  }, [navigate]);

  // ── Command processor ─────────────────────────────────────────────────────
  const processCommand = useCallback(async (text: string) => {
    setState("processing");
    // We NO LONGER clear `jobList` and `earnings` here so the assistant keeps context!

    const lang = detectLang(text);
    setDetectedLang(lang);
    const intent = detectIntent(text);

    console.log("[VA] heard:", JSON.stringify(text), "| intent:", intent, "| lang:", lang);

    // Simple navigate + speak helper
    const reply = (msg: string, path?: string) => {
      setResponse(msg);
      if (path) navigate(path);
      setState("speaking");
      speak(msg, lang, () => { if (mountedRef.current) setState("idle"); });
    };

    switch (intent) {
      case "nearby_work":
        await handleNearbyWork(lang);
        return;

      case "find_work":
        await handleFindWork(lang);
        return;

      case "my_work":
        reply(r(R.myWork, lang), `${WORKER_BASE}/my-work`);
        return;

      case "wallet":
        reply(r(R.wallet, lang), `${WORKER_BASE}/wallet`);
        return;

      case "earnings":
        await handleEarnings(lang);
        return;

      case "apply_job_idx": {
        const words = text.split(/\s+/);
        let idx = -1;
        const map: Record<string, number> = {
          "first": 0, "1st": 0, "one": 0, "1": 0, "ek": 0, "pahila": 0, "pahile": 0,
          "second": 1, "2nd": 1, "two": 1, "2": 1, "do": 1, "don": 1, "dusra": 1, "dusre": 1,
          "third": 2, "3rd": 2, "three": 2, "3": 2, "teen": 2, "tin": 2, "tisra": 2, "tisre": 2,
          "fourth": 3, "4th": 3, "four": 3, "4": 3, "char": 3, "chautha": 3, "chauthe": 3
        };
        for (const w of words) {
           if (map[w] !== undefined) { idx = map[w]; break; }
        }

        // Default to first job if only 1 job exists and no specific number was parsed
        if (idx === -1 && jobList.length === 1) idx = 0;
        
        if (idx !== -1 && idx < jobList.length) {
            const job = jobList[idx];
            setResponse(r(R.applyingJob, lang, idx + 1));
            setState("speaking");
            await applyToJob(job._id);
        } else {
            reply(r(R.invalidJobIndex, lang));
        }
        return;
      }

      case "projects":
        reply(r(R.projects, lang), `${WORKER_BASE}/portfolio`);
        return;

      case "profile":
        reply(r(R.profile, lang), `${WORKER_BASE}/profile`);
        return;

      case "home":
        reply(r(R.home, lang), `${WORKER_BASE}`);
        return;

      default:
        reply(r(R.fallback, lang));
    }
  }, [handleNearbyWork, handleFindWork, handleEarnings, navigate, jobList, applyToJob]);

  // ── Start listening ───────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!isSupported) return;

    // Abort any existing session cleanly
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    // en-IN accepts Hindi, Marathi, and English in Chrome
    recognition.lang = "en-IN";

    setTranscript("");
    // Do NOT wipe out context variables here so follow-up commands (like apply) work!
    setState("listening");

    recognition.onresult = (event: any) => {
      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          const alts: string[] = [];
          for (let a = 0; a < r.length; a++) alts.push(r[a].transcript);
          // pick best alternative that matches an intent
          const best = alts.find(a => detectIntent(a.toLowerCase().trim()) !== null) ?? alts[0];
          finalText += best;
        } else {
          interim += r[0].transcript;
        }
      }

      setTranscript(finalText || interim);
      if (finalText) processCommand(finalText.trim().toLowerCase());
    };

    recognition.onerror = (event: any) => {
      if (!mountedRef.current) return;
      // Ignore 'aborted' errors — those are intentional cancels
      if (event.error === "aborted") return;
      setState("error");
      const lang = detectedLang;
      const msg =
        event.error === "not-allowed"     ? r(R.micDenied, lang) :
        event.error === "no-speech"       ? r(R.noSpeech, lang)  :
        event.error === "network"         ? "Network error. Check your connection and try again." :
        event.error === "audio-capture"   ? "No microphone found. Please connect a mic and try again." :
        event.error === "service-not-allowed" ? r(R.micDenied, lang) :
                                            r(R.voiceError, lang);
      setResponse(msg);
      recognitionRef.current = null;
      // Auto-recover: go back to idle after 3s
      setTimeout(() => { if (mountedRef.current) setState("idle"); }, 3000);
    };

    recognition.onend = () => {
      // Only reset to idle if we're still in listening state (not processing/speaking)
      if (mountedRef.current && stateRef.current === "listening") {
        setState("idle");
      }
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    // Start with error handling in case the API itself throws
    try {
      recognition.start();
    } catch (err: any) {
      console.error("[VA] recognition.start() threw:", err);
      setState("error");
      setResponse("Could not start voice recognition. Please reload and try again.");
      recognitionRef.current = null;
      setTimeout(() => { if (mountedRef.current) setState("idle"); }, 3000);
    }
  }, [isSupported, processCommand, detectedLang]);

  // ── Stop / Cancel ─────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (mountedRef.current) setState("idle");
  }, []);

  const cancelAll = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    window.speechSynthesis?.cancel();
    if (mountedRef.current) {
      setState("idle");
      setTranscript("");
      setResponse("");
      setJobCount(null);
      setJobList([]);
      setEarnings(null);
    }
  }, []);

  return {
    state, transcript, response,
    jobCount, jobList, earnings,
    applyingId, detectedLang,
    applyToJob, startListening, stopListening, cancelAll, isSupported,
  };
}
