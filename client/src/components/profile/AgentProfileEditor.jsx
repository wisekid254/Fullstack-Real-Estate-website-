import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../services/api";

const SPECIALIZATIONS = [
  "Residential",
  "Commercial",
  "Luxury",
  "Land",
  "Rentals",
  "Off-plan",
  "Investment",
  "Industrial",
];

const SERVICE_AREAS = [
  "Westlands",
  "Karen",
  "Kilimani",
  "Lavington",
  "Runda",
  "Muthaiga",
  "Gigiri",
  "Kileleshwa",
  "Parklands",
  "Nairobi CBD",
  "Lang'ata",
  "South B",
  "South C",
  "Kasarani",
  "Ruaka",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
];

const LANGUAGES = [
  "English",
  "Swahili",
  "French",
  "Arabic",
  "Hindi",
  "Somali",
  "Kikuyu",
  "Luo",
];
const RESPONSE_TIMES = [
  "Within 1 hour",
  "Within 3 hours",
  "Within 24 hours",
  "Within 48 hours",
];

export default function AgentProfileEditor({ user }) {
  const p = user?.agentProfile || {};

  const [form, setForm] = useState({
    phone: user?.phone || "",
    bio: p.bio || "",
    title: p.title || "Real Estate Agent",
    brokerage: p.brokerage || "",
    license: p.license || "",
    experience: p.experience || 0,
    teamType: p.teamType || "individual",
    minPrice: p.minPrice || 0,
    maxPrice: p.maxPrice || 0,
    salesLast12: p.salesLast12 || 0,
    totalSales: p.totalSales || 0,
    specializations: p.specializations || [],
    serviceAreas: p.serviceAreas || [],
    languages: p.languages || [],
    responseTime: p.responseTime || "Within 24 hours",
    social: {
      website: p.social?.website || "",
      linkedin: p.social?.linkedin || "",
      twitter: p.social?.twitter || "",
      facebook: p.social?.facebook || "",
    },
  });

  const [saving, setSaving] = useState(false);

  const toggle = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/users/agent-profile", form);
      toast.success("Agent profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Basic info */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-surface-900">Basic information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Professional title
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Senior Real Estate Agent"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Phone number
            </label>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="+254 700 000 000"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Brokerage / Company
            </label>
            <input
              value={form.brokerage}
              onChange={(e) =>
                setForm((f) => ({ ...f, brokerage: e.target.value }))
              }
              placeholder="e.g. Americorp Real Estate"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              License number
            </label>
            <input
              value={form.license}
              onChange={(e) =>
                setForm((f) => ({ ...f, license: e.target.value }))
              }
              placeholder="e.g. EARB/2024/001"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Years of experience
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={form.experience}
              onChange={(e) =>
                setForm((f) => ({ ...f, experience: Number(e.target.value) }))
              }
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Response time
            </label>
            <select
              value={form.responseTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, responseTime: e.target.value }))
              }
              className="input"
            >
              {RESPONSE_TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            Agent type
          </label>
          <div className="flex gap-2">
            {["individual", "team"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, teamType: t }))}
                className={
                  "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors " +
                  (form.teamType === t
                    ? "bg-brand-500 text-white border-brand-500"
                    : "border-surface-200 text-surface-600 hover:border-brand-300")
                }
              >
                {t === "individual" ? "Individual Agent" : "Team"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Tell clients about yourself, your experience and what makes you different..."
            rows={4}
            maxLength={1000}
            className="input resize-none"
          />
          <p className="text-xs text-surface-400 mt-1 text-right">
            {form.bio.length}/1000
          </p>
        </div>
      </div>

      {/* Sales statistics */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-surface-900">Sales statistics</h3>
        <p className="text-xs text-surface-400">
          These show on your public agent card like Zillow — price range, sales
          last 12 months and total sales
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Min deal price (KES)
            </label>
            <input
              type="number"
              min={0}
              value={form.minPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, minPrice: Number(e.target.value) }))
              }
              placeholder="e.g. 5000000"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Max deal price (KES)
            </label>
            <input
              type="number"
              min={0}
              value={form.maxPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxPrice: Number(e.target.value) }))
              }
              placeholder="e.g. 50000000"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Sales last 12 months
            </label>
            <input
              type="number"
              min={0}
              value={form.salesLast12}
              onChange={(e) =>
                setForm((f) => ({ ...f, salesLast12: Number(e.target.value) }))
              }
              placeholder="e.g. 24"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Total career sales
            </label>
            <input
              type="number"
              min={0}
              value={form.totalSales}
              onChange={(e) =>
                setForm((f) => ({ ...f, totalSales: Number(e.target.value) }))
              }
              placeholder="e.g. 150"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="card p-6">
        <h3 className="font-semibold text-surface-900 mb-3">Specializations</h3>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle("specializations", s)}
              className={
                "px-3 py-1.5 rounded-lg text-sm border transition-colors " +
                (form.specializations.includes(s)
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-surface-200 text-surface-600 hover:border-brand-300")
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Service areas */}
      <div className="card p-6">
        <h3 className="font-semibold text-surface-900 mb-3">Service areas</h3>
        <div className="flex flex-wrap gap-2">
          {SERVICE_AREAS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggle("serviceAreas", a)}
              className={
                "px-3 py-1.5 rounded-lg text-sm border transition-colors " +
                (form.serviceAreas.includes(a)
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-surface-200 text-surface-600 hover:border-brand-300")
              }
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="card p-6">
        <h3 className="font-semibold text-surface-900 mb-3">
          Languages spoken
        </h3>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => toggle("languages", l)}
              className={
                "px-3 py-1.5 rounded-lg text-sm border transition-colors " +
                (form.languages.includes(l)
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-surface-200 text-surface-600 hover:border-brand-300")
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Social links */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-surface-900">
          Social media and website
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Website
            </label>
            <input
              value={form.social.website}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  social: { ...f.social, website: e.target.value },
                }))
              }
              placeholder="https://yourwebsite.com"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              LinkedIn
            </label>
            <input
              value={form.social.linkedin}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  social: { ...f.social, linkedin: e.target.value },
                }))
              }
              placeholder="https://linkedin.com/in/yourname"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Twitter / X
            </label>
            <input
              value={form.social.twitter}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  social: { ...f.social, twitter: e.target.value },
                }))
              }
              placeholder="https://twitter.com/yourhandle"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Facebook
            </label>
            <input
              value={form.social.facebook}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  social: { ...f.social, facebook: e.target.value },
                }))
              }
              placeholder="https://facebook.com/yourpage"
              className="input"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn-primary px-8 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save agent profile"}
      </button>
    </motion.form>
  );
}
