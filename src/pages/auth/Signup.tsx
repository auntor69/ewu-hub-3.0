import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

type Role = "student" | "faculty" | "admin" | "staff";

export default function Signup() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) { setErr("Passwords do not match"); return; }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName } }
    });
    if (error) { setLoading(false); setErr(error.message); return; }

    const user = data.user;
    if (!user) { setLoading(false); setErr("No user returned from Supabase"); return; }

    const { error: pErr } = await supabase
      .from("profiles")
      .insert({ user_id: user.id, role });
    if (pErr) { setLoading(false); setErr(pErr.message); return; }

    setLoading(false);
    nav("/login");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Create your EWU Hub account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={fullName} onChange={e => setFullName(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2"
              value={confirm} onChange={e => setConfirm(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={role} onChange={e => setRole(e.target.value as Role)}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white rounded-lg py-2 font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-purple-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}