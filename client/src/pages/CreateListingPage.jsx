import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import listingService from "../services/listingService";
import uploadService from "../services/uploadService";

const CATEGORIES = ["house", "apartment", "villa", "land", "commercial"];
const AMENITY_OPTIONS = [
  "Pool",
  "Gym",
  "Security",
  "Garden",
  "WiFi",
  "Elevator",
  "Parking",
  "Backup Generator",
  "Staff Quarters",
  "Borehole",
  "Fibre Internet",
  "Conference Room",
  "Rooftop Terrace",
];

const DEFAULT_FORM = {
  title: "",
  description: "",
  price: "",
  type: "sale",
  category: "house",
  location: { address: "", city: "", country: "Kenya" },
  features: {
    bedrooms: "",
    bathrooms: "",
    area: "",
    parking: "",
    furnished: false,
    yearBuilt: "",
  },
  amenities: [],
};

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // ── Field helpers ───────────────────────────────────────
  const setField = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj = next;
      keys.slice(0, -1).forEach((k) => {
        obj[k] = { ...obj[k] };
        obj = obj[k];
      });
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const toggleAmenity = (a) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  // ── Image handling ──────────────────────────────────────
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setFiles((f) => [...f, ...selected]);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreviews((p) => [...p, { url: ev.target.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles((f) => f.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  };

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    setLoading(true);
    try {
      // 1. Upload images to Cloudinary
      toast.loading("Uploading images…", { id: "upload" });
      const { images } = await uploadService.uploadImages(files);
      toast.success("Images uploaded", { id: "upload" });

      // 2. Create listing
      const payload = {
        ...form,
        price: Number(form.price),
        images,
        features: {
          ...form.features,
          bedrooms: Number(form.features.bedrooms) || 0,
          bathrooms: Number(form.features.bathrooms) || 0,
          area: Number(form.features.area) || 0,
          parking: Number(form.features.parking) || 0,
          yearBuilt: Number(form.features.yearBuilt) || null,
        },
      };

      const data = await listingService.createListing(payload);
      toast.success("Listing created successfully!");
      navigate(`/listings/${data.listing._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  // ── Step validation ─────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return form.title && form.description && form.price;
    if (step === 2) return form.location.address && form.location.city;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-display-md text-surface-900 mb-1">
          Create a listing
        </h1>
        <p className="text-surface-500 text-sm mb-8">
          Fill in the details below to post your property
        </p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {["Basic info", "Location", "Features", "Photos"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={`w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center transition-colors ${
                step === i + 1
                  ? "bg-brand-500 text-white"
                  : step > i + 1
                    ? "bg-brand-100 text-brand-700 cursor-pointer"
                    : "bg-surface-100 text-surface-400"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </button>
            <span
              className={`text-sm hidden sm:block ${step === i + 1 ? "text-surface-900 font-medium" : "text-surface-400"}`}
            >
              {label}
            </span>
            {i < 3 && (
              <div
                className={`flex-1 h-px w-6 ${step > i + 1 ? "bg-brand-300" : "bg-surface-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="card p-6 space-y-5"
        >
          {/* ── Step 1: Basic info ────────────────────── */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Modern 3-Bedroom Apartment in Westlands"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Describe the property in detail…"
                  rows={5}
                  className="input resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Listing type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setField("type", e.target.value)}
                    className="input"
                  >
                    <option value="sale">For sale</option>
                    <option value="rent">For rent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                    className="input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Price (KES) *{" "}
                  {form.type === "rent" && (
                    <span className="text-surface-400 font-normal">
                      — per month
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="e.g. 15000000"
                  min={0}
                  className="input"
                  required
                />
              </div>
            </>
          )}

          {/* ── Step 2: Location ──────────────────────── */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Street address *
                </label>
                <input
                  value={form.location.address}
                  onChange={(e) => setField("location.address", e.target.value)}
                  placeholder="e.g. 14 Riverside Drive"
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    City *
                  </label>
                  <input
                    value={form.location.city}
                    onChange={(e) => setField("location.city", e.target.value)}
                    placeholder="e.g. Nairobi"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Country
                  </label>
                  <input
                    value={form.location.country}
                    onChange={(e) =>
                      setField("location.country", e.target.value)
                    }
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Latitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.location.lat || ""}
                    onChange={(e) => setField("location.lat", e.target.value)}
                    placeholder="-1.2921"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Longitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.location.lng || ""}
                    onChange={(e) => setField("location.lng", e.target.value)}
                    placeholder="36.8219"
                    className="input"
                  />
                </div>
              </div>
              <p className="text-xs text-surface-400">
                Tip: find lat/lng by right-clicking your property on Google Maps
              </p>
            </>
          )}

          {/* ── Step 3: Features + amenities ─────────── */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: "Bedrooms",
                    path: "features.bedrooms",
                    placeholder: "3",
                  },
                  {
                    label: "Bathrooms",
                    path: "features.bathrooms",
                    placeholder: "2",
                  },
                  {
                    label: "Area (m²)",
                    path: "features.area",
                    placeholder: "150",
                  },
                  {
                    label: "Parking",
                    path: "features.parking",
                    placeholder: "1",
                  },
                  {
                    label: "Year built",
                    path: "features.yearBuilt",
                    placeholder: "2020",
                  },
                ].map((f) => (
                  <div key={f.path}>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      {f.label}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.features[f.path.split(".")[1]] || ""}
                      onChange={(e) => setField(f.path, e.target.value)}
                      placeholder={f.placeholder}
                      className="input"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Furnished
                  </label>
                  <select
                    value={form.features.furnished}
                    onChange={(e) =>
                      setField("features.furnished", e.target.value === "true")
                    }
                    className="input"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-3">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        form.amenities.includes(a)
                          ? "bg-brand-500 text-white border-brand-500"
                          : "border-surface-200 text-surface-600 hover:border-brand-300"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Step 4: Photos ────────────────────────── */}
          {step === 4 && (
            <>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-3">
                  Property photos *{" "}
                  <span className="text-surface-400 font-normal">
                    (up to 5 images, max 5MB each)
                  </span>
                </label>

                {/* Drop zone */}
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-surface-200 rounded-xl cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
                  <svg
                    className="w-8 h-8 text-surface-300 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-surface-500">
                    Click to upload photos
                  </p>
                  <p className="text-xs text-surface-400 mt-1">
                    JPG, PNG, WebP
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFiles}
                    className="hidden"
                    disabled={files.length >= 5}
                  />
                </label>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((p, i) => (
                    <div
                      key={i}
                      className="relative group rounded-xl overflow-hidden h-24 bg-surface-100"
                    >
                      <img
                        src={p.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        ✕
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className={`btn-secondary ${step === 1 ? "invisible" : ""}`}
          >
            ← Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="btn-primary disabled:opacity-50"
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || files.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? "Publishing…" : "Publish listing"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
