import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import listingService from "../services/listingService";
import uploadService from "../services/uploadService";
import SEO from "../components/common/SEO";
import useAuth from "../hooks/useAuth";
import aiService from "../services/aiService";

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
  location: {
    address: "",
    city: "",
    country: "Kenya",
    lat: "",
    lng: "",
  },
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

  // =========================
  // STATE
  // =========================
  const [form, setForm] = useState(DEFAULT_FORM);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // FIX:
  // This hook must be inside the component
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const { canPostProperty } = useAuth();

  // =========================
  // ACCESS CHECK
  // =========================
  if (!canPostProperty) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Access Restricted
          </h1>

          <p className="text-gray-600 mb-6">
            You do not have permission to post a property.
          </p>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // FORM FIELD HANDLER
  // =========================
  const setField = (path, value) => {
    const keys = path.split(".");

    setForm((prev) => {
      const updated = { ...prev };
      let current = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = {
          ...current[keys[i]],
        };

        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      return updated;
    });
  };

  // =========================
  // AMENITY HANDLER
  // =========================
  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // =========================
  // FILE HANDLER
  // =========================
  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) return;

    const newFiles = [...files, ...selectedFiles];

    setFiles(newFiles);

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // =========================
  // REMOVE FILE
  // =========================
  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);

    setFiles((prev) => prev.filter((_, i) => i !== index));

    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // AI DESCRIPTION GENERATOR
  // =========================
  const generateDescription = async () => {
    if (!form.title) {
      toast.error("Please enter a title first");
      return;
    }

    setGeneratingDesc(true);

    try {
      const data = await aiService.generateDescription({
        title: form.title,
        category: form.category,
        type: form.type,
        price: form.price,
        location: form.location,
        features: form.features,
        amenities: form.amenities,
      });

      setField("description", data.description);

      toast.success("AI description generated!");
    } catch (err) {
      console.error("AI description generation error:", err);

      toast.error(
        err?.response?.data?.message || "Failed to generate description",
      );
    } finally {
      setGeneratingDesc(false);
    }
  };

  // =========================
  // FORM SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a property title");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Please enter a property description");
      return;
    }

    if (!form.price) {
      toast.error("Please enter a property price");
      return;
    }

    if (!form.location.address || !form.location.city) {
      toast.error("Please enter the property location");
      return;
    }

    setLoading(true);

    try {
      let uploadedImages = [];

      // Upload images first
      if (files.length > 0) {
        const uploadResponse = await uploadService.uploadImages(files);

        uploadedImages =
          uploadResponse?.images || uploadResponse?.data?.images || [];
      }

      const listingData = {
        ...form,
        price: Number(form.price),

        features: {
          ...form.features,
          bedrooms: form.features.bedrooms ? Number(form.features.bedrooms) : 0,
          bathrooms: form.features.bathrooms
            ? Number(form.features.bathrooms)
            : 0,
          area: form.features.area ? Number(form.features.area) : 0,
          parking: form.features.parking ? Number(form.features.parking) : 0,
          yearBuilt: form.features.yearBuilt
            ? Number(form.features.yearBuilt)
            : null,
        },

        images: uploadedImages,
      };

      await listingService.createListing(listingData);

      toast.success("Property listed successfully!");

      navigate("/listings");
    } catch (err) {
      console.error("Create listing error:", err);

      toast.error(
        err?.response?.data?.message || "Failed to create property listing",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP VALIDATION
  // =========================
  const canProceed = () => {
    if (step === 1) {
      return form.title.trim() && form.description.trim() && form.price;
    }

    if (step === 2) {
      return form.location.address.trim() && form.location.city.trim();
    }

    if (step === 3) {
      return true;
    }

    if (step === 4) {
      return files.length > 0;
    }

    return false;
  };

  const STEPS = ["Basic info", "Location", "Features", "Photos"];

  // =========================
  // UI
  // =========================
  return (
    <>
      <SEO
        title="Create Property Listing | nestHaven"
        description="Create and publish a new property listing on nestHaven."
      />

      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-4">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Create Property Listing
            </h1>

            <p className="text-gray-600 mt-2">
              Add your property details and publish it on nestHaven.
            </p>
          </div>

          {/* STEPS */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((stepName, index) => {
                const stepNumber = index + 1;
                const active = step === stepNumber;

                return (
                  <div key={stepName} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        active
                          ? "bg-blue-600 text-white"
                          : step > stepNumber
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {stepNumber}
                    </div>

                    <span
                      className={`ml-2 hidden sm:block ${
                        active ? "text-blue-600 font-semibold" : "text-gray-500"
                      }`}
                    >
                      {stepName}
                    </span>

                    {index < STEPS.length - 1 && (
                      <div className="w-10 sm:w-20 h-px bg-gray-300 mx-3" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
          >
            {/* =========================
                STEP 1
            ========================= */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Basic Information
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Tell potential buyers or tenants about your property.
                  </p>
                </div>

                {/* TITLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="e.g. Modern 3 Bedroom Apartment in Kilimani"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* TYPE + CATEGORY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Type
                    </label>

                    <select
                      value={form.type}
                      onChange={(e) => setField("type", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>

                    <select
                      value={form.category}
                      onChange={(e) => setField("category", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PRICE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (KES)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="e.g. 15000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* DESCRIPTION + AI */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Property Description
                    </label>

                    <button
                      type="button"
                      onClick={generateDescription}
                      disabled={generatingDesc}
                      className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {generatingDesc ? "Generating..." : "✨ Generate with AI"}
                    </button>
                  </div>

                  <textarea
                    rows={7}
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Describe the property, its features, location and benefits..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    Enter a title and property details, then use AI to generate
                    a professional description.
                  </p>
                </div>
              </motion.div>
            )}

            {/* =========================
                STEP 2
            ========================= */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Property Location
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Where is the property located?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>

                  <input
                    type="text"
                    value={form.location.address}
                    onChange={(e) =>
                      setField("location.address", e.target.value)
                    }
                    placeholder="Street, building or estate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>

                    <input
                      type="text"
                      value={form.location.city}
                      onChange={(e) =>
                        setField("location.city", e.target.value)
                      }
                      placeholder="e.g. Nairobi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>

                    <input
                      type="text"
                      value={form.location.country}
                      onChange={(e) =>
                        setField("location.country", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>

                    <input
                      type="number"
                      value={form.location.lat}
                      onChange={(e) => setField("location.lat", e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>

                    <input
                      type="number"
                      value={form.location.lng}
                      onChange={(e) => setField("location.lng", e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========================
                STEP 3
            ========================= */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Property Features
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Add important features and amenities.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={form.features.bedrooms}
                      onChange={(e) =>
                        setField("features.bedrooms", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={form.features.bathrooms}
                      onChange={(e) =>
                        setField("features.bathrooms", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area (m²)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={form.features.area}
                      onChange={(e) =>
                        setField("features.area", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parking Spaces
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={form.features.parking}
                      onChange={(e) =>
                        setField("features.parking", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Built
                    </label>

                    <input
                      type="number"
                      value={form.features.yearBuilt}
                      onChange={(e) =>
                        setField("features.yearBuilt", e.target.value)
                      }
                      placeholder="e.g. 2024"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      checked={form.features.furnished}
                      onChange={(e) =>
                        setField("features.furnished", e.target.checked)
                      }
                      className="w-5 h-5"
                    />

                    <label className="text-sm font-medium text-gray-700">
                      Furnished
                    </label>
                  </div>
                </div>

                {/* AMENITIES */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Amenities
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {AMENITY_OPTIONS.map((amenity) => {
                      const selected = form.amenities.includes(amenity);

                      return (
                        <button
                          type="button"
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-4 py-3 rounded-xl border text-sm transition ${
                            selected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                          }`}
                        >
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========================
                STEP 4
            ========================= */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Property Photos
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Upload high-quality photos of your property.
                  </p>
                </div>

                {/* UPLOAD */}
                <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-500 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFiles}
                    className="hidden"
                  />

                  <div className="text-5xl mb-4">📷</div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    Upload Property Photos
                  </h3>

                  <p className="text-gray-500 text-sm mt-2">
                    Click to select multiple images
                  </p>
                </label>

                {/* PREVIEWS */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {previews.map((preview, index) => (
                      <div
                        key={preview}
                        className="relative group rounded-xl overflow-hidden"
                      >
                        <img
                          src={preview}
                          alt={`Property preview ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* =========================
                NAVIGATION
            ========================= */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    navigate(-1);
                  } else {
                    setStep((prev) => prev - 1);
                  }
                }}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                {step === 1 ? "Cancel" : "Back"}
              </button>

              {step < STEPS.length ? (
                <button
                  type="button"
                  disabled={!canProceed()}
                  onClick={() => setStep((prev) => prev + 1)}
                  className="px-7 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !canProceed()}
                  className="px-7 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Publishing..." : "Publish Property"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
