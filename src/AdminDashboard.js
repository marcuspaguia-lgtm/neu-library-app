import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase"; 
function BorrowsTab() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, "borrows")).then(snap => {
      setBorrows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "borrows", id), { status });
    setBorrows(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const font = "'Barlow', sans-serif";
  const th = { padding: "10px 12px", textAlign: "left", fontSize: 12, color: "#666", fontWeight: "bold", borderBottom: "1px solid #ddd", background: "#f5f5f5", fontFamily: font };
  const td = { padding: "9px 12px", fontSize: 13, borderBottom: "1px solid #f0f0f0", fontFamily: font };

  if (loading) return <div style={{ padding: 24, textAlign: "center", color: "#888", fontFamily: font }}>Loading...</div>;

  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", fontFamily: font }}>
      <div style={{ background: "#1a56db", padding: "12px 16px" }}>
        <h3 style={{ color: "white", fontSize: 15, margin: 0, fontFamily: font }}>Borrow Requests ({borrows.length})</h3>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Book Title","Author","Requested By","Email","Status","Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {borrows.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#aaa", fontFamily: font }}>No borrow requests yet.</td></tr>
            ) : borrows.map(b => (
              <tr key={b.id}>
                <td style={td}><strong>{b.bookTitle}</strong></td>
                <td style={{ ...td, color: "#666" }}>{b.bookAuthor}</td>
                <td style={td}>{b.userName}</td>
                <td style={{ ...td, fontSize: 12, color: "#666" }}>{b.userEmail}</td>
                <td style={td}>
                  <span style={{
                    background: b.status === "approved" ? "#dcfce7" : b.status === "returned" ? "#eff6ff" : b.status === "rejected" ? "#fef2f2" : "#fefce8",
                    color: b.status === "approved" ? "#166534" : b.status === "returned" ? "#1e40af" : b.status === "rejected" ? "#dc2626" : "#854d0e",
                    padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: "bold"
                  }}>{b.status}</span>
                </td>
                <td style={{ ...td, display: "flex", gap: 6 }}>
                  {b.status === "pending" && <>
                    <button onClick={() => updateStatus(b.id, "approved")} style={{ padding: "4px 10px", background: "#16a34a", color: "white", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: font }}>Approve</button>
                    <button onClick={() => updateStatus(b.id, "rejected")} style={{ padding: "4px 10px", background: "#dc2626", color: "white", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: font }}>Reject</button>
                  </>}
                  {b.status === "approved" && (
                    <button onClick={() => updateStatus(b.id, "returned")} style={{ padding: "4px 10px", background: "#1d4ed8", color: "white", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: font }}>Mark Returned</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard({ setPage }) {
  const [tab, setTab] = useState("dashboard");
  const [visits, setVisits] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [newBook, setNewBook] = useState({ title: "", author: "", category: "", copies: 1, available: 1 });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", body: "", type: "info" });
  const [newUser, setNewUser] = useState({ displayName: "", email: "", role: "user", college: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vSnap, uSnap, bSnap, aSnap] = await Promise.all([
        getDocs(query(collection(db, "visits"), orderBy("timestamp", "desc"))),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "books")),
        getDocs(query(collection(db, "announcements"), orderBy("createdAt", "desc"))),
      ]);
      setVisits(vSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBooks(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAnnouncements(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const now = new Date();
  const font = "'Barlow', sans-serif";

  const filterVisits = (v) => {
    if (!v.timestamp) return false;
    const d = v.timestamp.toDate();
    if (filter === "today" && d.toDateString() !== now.toDateString()) return false;
    if (filter === "week" && (now - d) > 7 * 864e5) return false;
    if (filter === "month" && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
    if (filter === "custom" && dateFrom && new Date(dateFrom) > d) return false;
    if (filter === "custom" && dateTo && new Date(dateTo) < d) return false;
    if (filterCollege && v.college !== filterCollege) return false;
    if (filterPurpose && v.purposeOfVisit !== filterPurpose) return false;
    if (filterType === "employee" && !["faculty", "staff"].includes(v.userType?.toLowerCase())) return false;
    return true;
  };

  const filtered = visits.filter(filterVisits);
  const searched = filtered.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.college?.toLowerCase().includes(search.toLowerCase())
  );

  const byCollege = filtered.reduce((a, v) => { a[v.college] = (a[v.college] || 0) + 1; return a; }, {});
  const byPurpose = filtered.reduce((a, v) => { a[v.purposeOfVisit] = (a[v.purposeOfVisit] || 0) + 1; return a; }, {});

  const toggleBlock = async (id, current) => { await updateDoc(doc(db, "users", id), { isBlocked: !current }); fetchAll(); };
  const deleteUser = async (id) => { if (window.confirm("Delete this user?")) { await deleteDoc(doc(db, "users", id)); fetchAll(); } };
  const addBook = async () => { if (!newBook.title || !newBook.author) return alert("Fill in title and author."); await addDoc(collection(db, "books"), { ...newBook, createdAt: serverTimestamp() }); setNewBook({ title: "", author: "", category: "", copies: 1, available: 1 }); fetchAll(); };
  const deleteBook = async (id) => { if (window.confirm("Delete this book?")) { await deleteDoc(doc(db, "books", id)); fetchAll(); } };
  const addAnnouncement = async () => { if (!newAnnouncement.title || !newAnnouncement.body) return alert("Fill in title and body."); await addDoc(collection(db, "announcements"), { ...newAnnouncement, createdAt: serverTimestamp() }); setNewAnnouncement({ title: "", body: "", type: "info" }); fetchAll(); };
  const deleteAnnouncement = async (id) => { if (window.confirm("Delete this announcement?")) { await deleteDoc(doc(db, "announcements", id)); fetchAll(); } };
  const addUser = async () => { if (!newUser.email || !newUser.displayName) return alert("Fill in name and email."); await addDoc(collection(db, "users"), { ...newUser, isBlocked: false, createdAt: serverTimestamp() }); setNewUser({ displayName: "", email: "", role: "user", college: "" }); fetchAll(); };

  const colleges = ["College of Medicine","College of Law","School of Graduate Studies","School of International Relations","College of Nursing","College of Medical Technology","College of Physical Therapy","College of Respiratory Therapy","College of Midwifery","College of Informatics and Computing Studies","College of Engineering and Architecture","College of Accountancy","College of Business Administration","College of Criminology","College of Arts and Sciences","College of Education","College of Communication","College of Music","College of Agriculture"];

  const tabStyle = (t) => ({ padding: "12px 20px", border: "none", borderBottom: tab === t ? "3px solid #1a56db" : "3px solid transparent", background: "none", fontSize: 14, fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1a56db" : "#6b7280", cursor: "pointer", fontFamily: font });
  const inputStyle = { width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, marginBottom: 10, fontFamily: font };
  const btnBlue = { padding: "10px 20px", background: "#1a56db", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font };
  const btnRed = { padding: "6px 12px", background: "#dc2626", color: "white", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: font };
  const btnGray = { padding: "6px 12px", background: "#9ca3af", color: "white", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: font };
  const card = { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 20 };
  const th = { padding: "11px 14px", textAlign: "left", fontSize: 12, color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e5e7eb", background: "#f9fafb", fontFamily: font, textTransform: "uppercase", letterSpacing: "0.5px" };
  const td = { padding: "11px 14px", fontSize: 14, borderBottom: "1px solid #f3f4f6", fontFamily: font, color: "#374151" };

  if (loading) return <div style={{ padding: 60, textAlign: "center", fontFamily: font, color: "#6b7280" }}>Loading dashboard...</div>;

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "28px 24px", fontFamily: font }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 28, color: "#111827", margin: 0, fontFamily: font, fontWeight: 700 }}>Admin Dashboard</h2>
            <p style={{ color: "#9ca3af", fontSize: 14, margin: "4px 0 0", fontFamily: font }}>NEU Library Management System</p>
          </div>
          <button onClick={() => setPage("home")} style={btnBlue}>← Back to Site</button>
        </div>

        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, marginBottom: 24, display: "flex", overflowX: "auto" }}>
          {[["dashboard","📊 Dashboard"],["visits","📋 Visit Logs"],["users","👥 Users"],["books","📚 Books"],["announcements","📢 Announcements"],["borrows","📦 Borrows"]].map(([t, label]) => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{label}</button>
          ))}
        </div>

        {tab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                ["Total Visits", visits.length, "#1a56db", "#eff6ff"],
                ["Today", visits.filter(v => v.timestamp && v.timestamp.toDate().toDateString() === now.toDateString()).length, "#7c3aed", "#f5f3ff"],
                ["This Week", visits.filter(v => v.timestamp && (now - v.timestamp.toDate()) <= 7*864e5).length, "#d97706", "#fffbeb"],
                ["This Month", visits.filter(v => v.timestamp && v.timestamp.toDate().getMonth() === now.getMonth()).length, "#dc2626", "#fef2f2"],
                ["Total Users", users.length, "#059669", "#ecfdf5"],
                ["Total Books", books.length, "#0891b2", "#ecfeff"],
              ].map(([label, count, color, bg]) => (
                <div key={label} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: font }}>{count}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontFamily: font, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={card}>
                <h3 style={{ fontSize: 16, color: "#111827", marginBottom: 16, fontFamily: font, fontWeight: 700 }}>Visitors by College</h3>
                {Object.keys(byCollege).length === 0 ? <p style={{ color: "#9ca3af", fontSize: 13, fontFamily: font }}>No data yet.</p> :
                  Object.entries(byCollege).sort((a,b) => b[1]-a[1]).slice(0,6).map(([col, cnt]) => (
                    <div key={col} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, fontFamily: font }}>
                        <span style={{ color: "#374151" }}>{col}</span>
                        <span style={{ fontWeight: 700, color: "#1a56db" }}>{cnt}</span>
                      </div>
                      <div style={{ background: "#e5e7eb", borderRadius: 99, height: 6 }}>
                        <div style={{ background: "#1a56db", height: 6, borderRadius: 99, width: `${(cnt/Math.max(...Object.values(byCollege)))*100}%` }} />
                      </div>
                    </div>
                  ))
                }
              </div>
              <div style={card}>
                <h3 style={{ fontSize: 16, color: "#111827", marginBottom: 16, fontFamily: font, fontWeight: 700 }}>Visitors by Purpose</h3>
                {Object.keys(byPurpose).length === 0 ? <p style={{ color: "#9ca3af", fontSize: 13, fontFamily: font }}>No data yet.</p> :
                  Object.entries(byPurpose).sort((a,b) => b[1]-a[1]).map(([p, cnt]) => (
                    <div key={p} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, fontFamily: font }}>
                        <span style={{ color: "#374151" }}>{p}</span>
                        <span style={{ fontWeight: 700, color: "#7c3aed" }}>{cnt}</span>
                      </div>
                      <div style={{ background: "#e5e7eb", borderRadius: 99, height: 6 }}>
                        <div style={{ background: "#7c3aed", height: 6, borderRadius: 99, width: `${(cnt/Math.max(...Object.values(byPurpose)))*100}%` }} />
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {tab === "visits" && (
          <div>
            <div style={card}>
              <h3 style={{ fontSize: 16, color: "#111827", marginBottom: 16, fontFamily: font, fontWeight: 700 }}>Filter Visits</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {["all","today","week","month","custom"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", border: `1.5px solid ${filter === f ? "#1a56db" : "#e5e7eb"}`, borderRadius: 8, background: filter === f ? "#1a56db" : "white", color: filter === f ? "white" : "#374151", fontSize: 13, cursor: "pointer", fontWeight: 600, fontFamily: font }}>
                    {f === "all" ? "All Time" : f === "today" ? "Today" : f === "week" ? "This Week" : f === "month" ? "This Month" : "Custom Range"}
                  </button>
                ))}
              </div>
              {filter === "custom" && (
                <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: font }} />
                  <span style={{ color: "#9ca3af", fontFamily: font }}>to</span>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: font }} />
                </div>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <select value={filterCollege} onChange={e => setFilterCollege(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: font }}>
                  <option value="">All Colleges</option>
                  {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterPurpose} onChange={e => setFilterPurpose(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: font }}>
                  <option value="">All Purposes</option>
                  {["Study","Research","Borrowing","Returning","Printing","Thesis","Group Study","Online Class"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: font }}>
                  <option value="">All Types</option>
                  <option value="employee">Employees Only</option>
                </select>
                <input placeholder="Search name, email, college..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: font }} />
              </div>
            </div>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: "#1a56db", padding: "12px 18px" }}>
                <h3 style={{ color: "white", fontSize: 15, margin: 0, fontFamily: font, fontWeight: 700 }}>Visit Logs ({searched.length})</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Name","Email","College","Purpose","Type","Date & Time"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {searched.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontFamily: font }}>No visits found.</td></tr>
                    ) : searched.map(v => (
                      <tr key={v.id}>
                        <td style={td}><strong style={{ color: "#111827" }}>{v.name}</strong></td>
                        <td style={{ ...td, color: "#6b7280", fontSize: 13 }}>{v.email}</td>
                        <td style={{ ...td, fontSize: 13 }}>{v.college}</td>
                        <td style={td}><span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{v.purposeOfVisit}</span></td>
                        <td style={td}><span style={{ background: "#f0fdf4", color: "#166534", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{v.userType || "Student"}</span></td>
                        <td style={{ ...td, color: "#9ca3af", fontSize: 12 }}>{v.timestamp ? v.timestamp.toDate().toLocaleString("en-PH") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div>
            <div style={card}>
              <h3 style={{ fontSize: 16, color: "#111827", marginBottom: 16, fontFamily: font, fontWeight: 700 }}>Add New User</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input placeholder="Full Name" value={newUser.displayName} onChange={e => setNewUser({...newUser, displayName: e.target.value})} style={inputStyle} />
                <input placeholder="Email (@neu.edu.ph)" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={inputStyle} />
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={inputStyle}>
                  <option value="user">Regular User</option>
                  <option value="admin">Admin</option>
                </select>
                <select value={newUser.college} onChange={e => setNewUser({...newUser, college: e.target.value})} style={inputStyle}>
                  <option value="">Select College</option>
                  {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button style={btnBlue} onClick={addUser}>+ Add User</button>
            </div>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: "#7c3aed", padding: "12px 18px" }}>
                <h3 style={{ color: "white", fontSize: 15, margin: 0, fontFamily: font, fontWeight: 700 }}>All Users ({users.length})</h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Name","Email","Role","College","Status","Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontFamily: font }}>No users yet.</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id}>
                      <td style={td}><strong style={{ color: "#111827" }}>{u.displayName || "—"}</strong></td>
                      <td style={{ ...td, fontSize: 13, color: "#6b7280" }}>{u.email}</td>
                      <td style={td}><span style={{ background: u.role === "admin" ? "#fefce8" : "#eff6ff", color: u.role === "admin" ? "#854d0e" : "#1d4ed8", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{u.role || "user"}</span></td>
                      <td style={{ ...td, fontSize: 13 }}>{u.college || "—"}</td>
                      <td style={td}><span style={{ background: u.isBlocked ? "#fef2f2" : "#f0fdf4", color: u.isBlocked ? "#dc2626" : "#166534", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{u.isBlocked ? "Blocked" : "Active"}</span></td>
                      <td style={{ ...td, display: "flex", gap: 6 }}>
                        <button onClick={() => toggleBlock(u.id, u.isBlocked)} style={u.isBlocked ? {...btnBlue, padding: "5px 12px", fontSize: 12} : btnRed}>{u.isBlocked ? "Unblock" : "Block"}</button>
                        <button onClick={() => deleteUser(u.id)} style={btnGray}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "books" && (
          <div>
            <div style={card}>
              <h3 style={{ fontSize: 16, color: "#111827", marginBottom: 16, fontFamily: font, fontWeight: 700 }}>Add New Book</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input placeholder="Book Title" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} style={inputStyle} />
                <input placeholder="Author" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} style={inputStyle} />
                <input placeholder="Category" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} style={inputStyle} />
                <input placeholder="Total Copies" type="number" value={newBook.copies} onChange={e => setNewBook({...newBook, copies: parseInt(e.target.value), available: parseInt(e.target.value)})} style={inputStyle} />
              </div>
              <button style={btnBlue} onClick={addBook}>+ Add Book</button>
            </div>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: "#0891b2", padding: "12px 18px" }}>
                <h3 style={{ color: "white", fontSize: 15, margin: 0, fontFamily: font, fontWeight: 700 }}>Book Inventory ({books.length})</h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Title","Author","Category","Available","Total","Action"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {books.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontFamily: font }}>No books yet.</td></tr>
                  ) : books.map(b => (
                    <tr key={b.id}>
                      <td style={td}><strong style={{ color: "#111827" }}>{b.title}</strong></td>
                      <td style={{ ...td, color: "#6b7280" }}>{b.author}</td>
                      <td style={td}><span style={{ background: "#ecfeff", color: "#0e7490", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{b.category}</span></td>
                      <td style={td}><strong style={{ color: (b.available ?? b.copies) > 0 ? "#166534" : "#dc2626" }}>{b.available ?? b.copies}</strong></td>
                      <td style={td}>{b.copies}</td>
                      <td style={{ ...td, display: "flex", gap: 6 }}>
                        <button onClick={async () => { await updateDoc(doc(db, "books", b.id), { available: b.copies }); fetchAll(); }} style={{ ...btnBlue, padding: "5px 12px", fontSize: 12 }}>Reset</button>
                        <button onClick={() => deleteBook(b.id)} style={btnRed}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "announcements" && (
          <div>
            <div style={card}>
              <h3 style={{ fontSize: 16, color: "#111827", marginBottom: 16, fontFamily: font, fontWeight: 700 }}>Post New Announcement</h3>
              <input placeholder="Title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} style={inputStyle} />
              <textarea placeholder="Announcement body..." value={newAnnouncement.body} onChange={e => setNewAnnouncement({...newAnnouncement, body: e.target.value})} style={{ ...inputStyle, height: 90, resize: "vertical" }} />
              <select value={newAnnouncement.type} onChange={e => setNewAnnouncement({...newAnnouncement, type: e.target.value})} style={{ ...inputStyle, width: "auto" }}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
              </select>
              <button style={btnBlue} onClick={addAnnouncement}>Post Announcement</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {announcements.length === 0 ? (
                <div style={{ ...card, textAlign: "center", color: "#9ca3af", fontFamily: font }}>No announcements yet.</div>
              ) : announcements.map(a => (
                <div key={a.id} style={{ ...card, borderLeft: `4px solid ${a.type === "warning" ? "#f59e0b" : a.type === "success" ? "#10b981" : "#1a56db"}`, marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ fontSize: 15, color: "#111827", marginBottom: 6, fontFamily: font, fontWeight: 700 }}>{a.title}</h4>
                      <p style={{ fontSize: 14, color: "#6b7280", margin: 0, fontFamily: font }}>{a.body}</p>
                    </div>
                    <button onClick={() => deleteAnnouncement(a.id)} style={btnRed}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "borrows" && <BorrowsTab />}

      </div>
    </div>
  );
}