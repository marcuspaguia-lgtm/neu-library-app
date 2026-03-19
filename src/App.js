import { useState, useEffect } from "react";
import { signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, getDocs, query, where, limit } from "firebase/firestore";
import { auth, provider, db } from "./firebase";
import AdminDashboard from "./AdminDashboard";
import "./index.css";

const NEU_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/New_Era_University_seal.svg/1200px-New_Era_University_seal.svg.png";

const colleges = {
  "Professional & Medical Schools": ["College of Medicine","College of Law","School of Graduate Studies","School of International Relations"],
  "Health Sciences": ["College of Nursing","College of Medical Technology","College of Physical Therapy","College of Respiratory Therapy","College of Midwifery"],
  "Technology, Engineering & Architecture": ["College of Informatics and Computing Studies","College of Engineering and Architecture"],
  "Business & Professional Studies": ["College of Accountancy","College of Business Administration","College of Criminology"],
  "Arts, Sciences & Education": ["College of Arts and Sciences","College of Education","College of Communication","College of Music","College of Agriculture"],
};

function Navbar({ page, setPage, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
       <div className="navbar-brand" onClick={() => setPage("home")}>
  <div style={{
    width: 44, height: 44, background: "linear-gradient(135deg, #1a56db, #3f83f8)",
    borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(26,86,219,0.3)", flexShrink: 0
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 19h16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 7v12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 7v4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 7v4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
  <div className="navbar-title">
    <span style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" }}>NEU Library</span>
    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>Management System</span>
  </div>
</div>
        <div className="navbar-links">
          <span className={`nav-link${page==="home"?" active":""}`} onClick={() => setPage("home")}>Home</span>
          <span className={`nav-link${page==="about"?" active":""}`} onClick={() => setPage("about")}>About</span>
          {user ? (
            <>
              <span className={`nav-link${page==="checkin"?" active":""}`} onClick={() => setPage("checkin")}>Check-In</span>
              {user.role === "admin" && <span className={`nav-link${page==="admin"?" active":""}`} onClick={() => setPage("admin")}>Admin</span>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8 }}>
                <div className="user-avatar">{user.displayName?.charAt(0)}</div>
                <button className="nav-btn" onClick={onLogout}>Sign Out</button>
              </div>
            </>
          ) : (
            <>
              <span className={`nav-link${page==="login"?" active":""}`} onClick={() => setPage("login")}>Sign In</span>
              <button className="nav-btn" onClick={() => setPage("signup")}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer({ setPage }) {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={NEU_LOGO} alt="NEU" className="footer-logo" onError={e => e.target.style.display='none'} />
          <h3>NEU Library</h3>
          <p>The New Era University Library serves as the academic heart of the institution, providing resources and spaces for learning, research, and discovery.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li onClick={() => setPage("home")}>Home</li>
            <li onClick={() => setPage("about")}>About the Library</li>
            <li onClick={() => setPage("checkin")}>Library Check-In</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li>No. 9 Central Ave., New Era</li>
            <li>Quezon City, Philippines</li>
            <li>library@neu.edu.ph</li>
            <li>(02) 8981-4221</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} New Era University Library. All rights reserved.</span>
        <span>Established 1975</span>
      </div>
    </footer>
  );
}

function HomePage({ setPage }) {
  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">Est. 1975 · Quezon City, Philippines</div>
            <h1>Welcome to the <span>NEU Library</span></h1>
            <p>Your gateway to knowledge, research, and academic excellence. Access thousands of resources and facilities designed to support your learning journey.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => setPage("checkin")}>Check In to Library</button>
              <button className="btn-outline-white" onClick={() => setPage("about")}>About the Library</button>
            </div>
          </div>
          <div className="hero-image">
            <img src={NEU_LOGO} alt="NEU Seal" className="hero-seal" onError={e => e.target.style.display='none'} />
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="stats-bar-inner">
          {[["50,000+","Books & Journals"],["5","Reading Floors"],["200+","Seats Available"],["8AM–8PM","Operating Hours"]].map(([n,l]) => (
            <div className="stat-item" key={l}>
              <div className="stat-number">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-tag">Our Services</div>
            <h2>Library Facilities & Services</h2>
            <p>We offer a wide range of resources and services to support the academic needs of NEU students, faculty, and staff.</p>
          </div>
          <div className="cards-grid">
            {[
              ["📚","Book Circulation","Borrow from our extensive collection of textbooks, references, and academic journals for up to 3–7 days."],
              ["🖥️","Computer Terminals","Access the internet, academic databases, and digital resources at our computer workstations."],
              ["🖨️","Printing & Copying","Print and photocopy academic materials at affordable rates at our service center."],
              ["👥","Group Study Rooms","Reserve private study rooms for group projects and collaborative learning sessions."],
              ["🔬","Research Assistance","Our librarians are available to assist you with research inquiries and database navigation."],
              ["📰","Periodicals Section","Access newspapers, magazines, and academic journals in print and digital formats."],
            ].map(([icon, title, desc]) => (
              <div className="info-card" key={title}>
                <div className="card-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section hours-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-tag">Operating Hours</div>
            <h2>Library Hours</h2>
            <p>Plan your visit according to our schedule below.</p>
          </div>
          <table className="hours-table">
            <thead><tr><th>Day</th><th>Opening Time</th><th>Closing Time</th><th>Status</th></tr></thead>
            <tbody>
              {[["Monday","8:00 AM","8:00 PM","open"],["Tuesday","8:00 AM","8:00 PM","open"],["Wednesday","8:00 AM","8:00 PM","open"],["Thursday","8:00 AM","8:00 PM","open"],["Friday","8:00 AM","8:00 PM","open"],["Saturday","8:00 AM","5:00 PM","open"],["Sunday","—","—","closed"]].map(([day,open,close,status]) => (
                <tr key={day}>
                  <td><strong>{day}</strong></td>
                  <td>{open}</td><td>{close}</td>
                  <td><span className={status==="open"?"badge-open":"badge-closed"}>{status==="open"?"Open":"Closed"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AboutPage() {
  return (
    <div>
      <div className="about-hero">
        <h1>About the NEU Library</h1>
        <p>Serving the academic community of New Era University since 1975</p>
      </div>
      <div className="about-content">
        <h2>Our History</h2>
        <p>The New Era University Library has been an integral part of the institution since its founding in 1975. Located in the heart of the Quezon City campus, the library has grown from a modest collection to a comprehensive academic resource center.</p>
        <div className="about-mission">
          <p>"To support the academic mission of New Era University by providing access to quality information resources, fostering information literacy, and creating an environment conducive to learning, research, and scholarly inquiry."</p>
        </div>
        <h2>Vision & Mission</h2>
        <p>The NEU Library envisions itself as a dynamic, learner-centered information hub that empowers the university community through innovative services and comprehensive collections.</p>
        <h2>Library Policies</h2>
        <p>All library users must present a valid NEU ID upon entry. Food and drinks are not allowed inside the library. Mobile phones must be set to silent mode. Silence must be observed in all reading areas.</p>
        <h2>Contact</h2>
        <p>For inquiries: <strong>library@neu.edu.ph</strong> or call <strong>(02) 8981-4221</strong>.</p>
      </div>
    </div>
  );
}

function SignUpPage({ setPage, setUser }) {
  const [form, setForm] = useState({ displayName: "", email: "", password: "", confirmPassword: "", college: "", userType: "Student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError("");
    if (!form.displayName || !form.email || !form.password || !form.college) return setError("Please fill in all fields.");
    if (!form.email.endsWith("@neu.edu.ph")) return setError("Only @neu.edu.ph emails are allowed.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(result.user, { displayName: form.displayName });
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid, displayName: form.displayName, email: form.email,
        college: form.college, userType: form.userType, role: "user", isBlocked: false, createdAt: serverTimestamp(),
      });
      setUser({ ...result.user, displayName: form.displayName, role: "user" });
      setPage("checkin");
    } catch (e) { setError(e.message.replace("Firebase: ", "")); }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <img src={NEU_LOGO} alt="NEU" onError={e => e.target.style.display='none'} />
        <div className="login-hero-text">
          <h2>New Era University Library</h2>
          <p>Create your library account</p>
        </div>
      </div>
      <div className="login-body">
        <div className="login-card" style={{ maxWidth: 480 }}>
          <div className="login-card-header">
            <h3>Create Account</h3>
            <p>Register with your NEU institutional email</p>
          </div>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>{error}</div>}
          <div className="form-group"><label>Full Name</label><input placeholder="e.g. Juan dela Cruz" value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} /></div>
          <div className="form-group"><label>Institutional Email</label><input placeholder="yourname@neu.edu.ph" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div className="form-group">
            <label>College / School</label>
            <select value={form.college} onChange={e => setForm({...form, college: e.target.value})}>
              <option value="">— Select college —</option>
              {Object.entries(colleges).map(([group, items]) => (
                <optgroup key={group} label={group}>{items.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>User Type</label>
            <select value={form.userType} onChange={e => setForm({...form, userType: e.target.value})}>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="At least 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
          <div className="form-group"><label>Confirm Password</label><input type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} /></div>
          <button className="btn-checkin" onClick={handleSignUp} disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
          <button className="btn-signout" onClick={() => setPage("login")}>Already have an account? Sign In</button>
        </div>
      </div>
    </div>
  );
}

function PastVisits({ userId }) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, "visits"), where("userId", "==", userId), limit(5));
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, [userId]);
  if (history.length === 0) return <p style={{ fontSize: 13, color: "#9ca3af" }}>No past visits yet.</p>;
  return (
    <div>
      {history.map(v => (
        <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
          <div>
            <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, marginRight: 8 }}>{v.purposeOfVisit}</span>
            <span style={{ color: "#6b7280" }}>{v.college}</span>
          </div>
          <span style={{ color: "#9ca3af", fontSize: 12 }}>{v.timestamp ? v.timestamp.toDate().toLocaleDateString("en-PH") : "—"}</span>
        </div>
      ))}
    </div>
  );
}

function CheckInPage({ user, setUser, setPage }) {
  const [purpose, setPurpose] = useState("");
  const [college, setCollege] = useState("");
  const [userType, setUserType] = useState("Student");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const saveAndLoginUser = async (firebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, { uid: firebaseUser.uid, displayName: firebaseUser.displayName, email: firebaseUser.email, role: "user", isBlocked: false, createdAt: serverTimestamp() });
    }
    const userData = (await getDoc(userRef)).data();
    if (userData.isBlocked) { await auth.signOut(); setLoginError("Your account has been blocked. Please contact the library."); return; }
    const loggedInUser = { ...firebaseUser, role: userData.role };
    setUser(loggedInUser);
    if (userData.role === "admin") setPage("admin");
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    try {
      const result = await signInWithPopup(auth, provider);
      if (!result.user.email.endsWith("@neu.edu.ph")) { await auth.signOut(); setLoginError("Only @neu.edu.ph emails are allowed."); return; }
      await saveAndLoginUser(result.user);
    } catch (error) { if (error.code !== "auth/popup-closed-by-user") setLoginError("Login failed: " + error.message); }
  };

  const handleEmailLogin = async () => {
    setLoginError("");
    if (!email || !password) return setLoginError("Please enter email and password.");
    if (!email.endsWith("@neu.edu.ph")) return setLoginError("Only @neu.edu.ph emails are allowed.");
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveAndLoginUser(result.user);
    } catch (e) { setLoginError("Invalid email or password."); }
    setLoading(false);
  };

  const handleCheckin = async () => {
    if (!purpose || !college) return alert("Please fill in all fields.");
    setLoading(true);
    try {
      await addDoc(collection(db, "visits"), {
        userId: user.uid, name: user.displayName, email: user.email,
        purposeOfVisit: purpose, college, userType, timestamp: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e) { alert("Check-in failed. Please try again."); }
    setLoading(false);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (!user) return (
    <div className="login-page">
      <div className="login-hero">
        <img src={NEU_LOGO} alt="NEU" onError={e => e.target.style.display='none'} />
        <div className="login-hero-text">
          <h2>New Era University Library</h2>
          <p>Visitor Check-In System · {dateStr}</p>
        </div>
      </div>
      <div className="login-body">
        <div className="login-card" style={{ maxWidth: 440 }}>
          <div className="login-card-header"><h3>Sign In</h3><p>Use your NEU institutional account</p></div>
          {loginError && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>{loginError}</div>}
          <button className="btn-google" onClick={handleGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"/><path fill="#FBBC05" d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"/><path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"/></svg>
            Sign in with Google (NEU)
          </button>
          <div className="divider">or sign in with email</div>
          <div className="form-group"><label>Email</label><input placeholder="yourname@neu.edu.ph" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEmailLogin()} /></div>
          <button className="btn-checkin" onClick={handleEmailLogin} disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
          <button className="btn-signout" onClick={() => setPage("signup")}>Don't have an account? Sign Up</button>
          <div className="notice">⚠ Only @neu.edu.ph accounts are accepted</div>
        </div>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="login-page">
      <div className="login-hero">
        <img src={NEU_LOGO} alt="NEU" onError={e => e.target.style.display='none'} />
        <div className="login-hero-text"><h2>New Era University Library</h2><p>{dateStr}</p></div>
      </div>
      <div className="login-body">
        <div className="login-card success-card" style={{ maxWidth: 560 }}>
          <div className="success-circle">✓</div>
          <h3>Welcome to NEU Library!</h3>
          <p>Your visit has been recorded successfully.</p>
          <div className="success-details">
            {[["Name", user.displayName],["Email", user.email],["Purpose", purpose],["College", college],["Type", userType],["Time", timeStr],["Date", dateStr]].map(([k,v]) => (
              <div className="success-row" key={k}><span>{k}</span><span>{v}</span></div>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, color: "#6b7280", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>🕐 Your Visit History</h4>
            <PastVisits userId={user.uid} />
          </div>
          <button className="btn-checkin" onClick={() => { setSubmitted(false); setPurpose(""); setCollege(""); }}>Check In Again</button>
          <button className="btn-signout" onClick={() => { signOut(auth); setUser(null); }}>Sign Out</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-hero">
        <img src={NEU_LOGO} alt="NEU" onError={e => e.target.style.display='none'} />
        <div className="login-hero-text"><h2>New Era University Library</h2><p>Visitor Check-In System · {dateStr}</p></div>
      </div>
      <div className="login-body">
        <div className="login-card">
          <div className="user-bar-info" style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
            <div className="user-avatar">{user.displayName?.charAt(0)}</div>
            <div><div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{user.displayName}</div><div style={{ fontSize: 12, color: "#9ca3af" }}>{user.email}</div></div>
          </div>
          <div className="login-card-header" style={{ textAlign: "left", marginBottom: 20 }}><h3>Library Check-In</h3><p>Please complete your visit details.</p></div>
          <div className="form-group">
            <label>Purpose of Visit</label>
            <select value={purpose} onChange={e => setPurpose(e.target.value)}>
              <option value="">— Select purpose —</option>
              {["Study","Research","Borrowing a Book","Returning a Book","Printing / Photocopying","Thesis / Dissertation Work","Group Study","Online Class / E-Learning"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>College / School</label>
            <select value={college} onChange={e => setCollege(e.target.value)}>
              <option value="">— Select college —</option>
              {Object.entries(colleges).map(([group, items]) => (
                <optgroup key={group} label={group}>{items.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Visitor Type</label>
            <select value={userType} onChange={e => setUserType(e.target.value)}>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <button className="btn-checkin" onClick={handleCheckin} disabled={loading}>{loading ? "Recording..." : "Complete Check-In"}</button>
          <button className="btn-signout" onClick={() => { signOut(auth); setUser(null); }}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.isBlocked) {
              await auth.signOut();
              setUser(null);
            } else {
              setUser({ ...firebaseUser, role: userData.role });
            }
          } else {
            setUser({ ...firebaseUser, role: "user" });
          }
        } catch (e) {
          setUser({ ...firebaseUser, role: "user" });
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => { signOut(auth); setUser(null); setPage("home"); };

  if (authLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
      <img src="https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/New_Era_University_seal.svg/1200px-New_Era_University_seal.svg.png" style={{ width: 60, height: 60, borderRadius: "50%" }} alt="NEU" />
      <p style={{ color: "#6b7280", fontSize: 14 }}>Loading...</p>
    </div>
  );

  return (
    <div>
      <Navbar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "about" && <AboutPage />}
      {page === "checkin" && <CheckInPage user={user} setUser={setUser} setPage={setPage} />}
      {page === "login" && <CheckInPage user={user} setUser={setUser} setPage={setPage} />}
      {page === "signup" && <SignUpPage setPage={setPage} setUser={setUser} />}
      {page === "admin" && <AdminDashboard setPage={setPage} />}
      <Footer setPage={setPage} />
    </div>
  );
}