import "dotenv/config";
import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import connectDB from "./db.js";

const seed = async () => {
  await connectDB();

  // Use the first user in the DB as the agent
  const agent = await User.findOne();
  if (!agent) {
    console.error(
      "No users found — register an account first, then run the seed",
    );
    process.exit(1);
  }

  await Listing.deleteMany({});

  const listings = [
    {
      title: "Modern 4-Bedroom Villa in Westlands",
      description:
        "Stunning contemporary villa with open-plan living, chef kitchen, and landscaped garden. Perfect for families seeking luxury in the heart of Nairobi.",
      price: 18500000,
      type: "sale",
      category: "villa",
      featured: true,
      location: {
        address: "14 Riverside Drive",
        city: "Nairobi",
        lat: -1.2637,
        lng: 36.8021,
      },
      features: {
        bedrooms: 4,
        bathrooms: 3,
        area: 320,
        parking: 2,
        furnished: true,
        yearBuilt: 2021,
      },
      amenities: ["Pool", "Gym", "Security", "Garden", "Backup Generator"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        },
      ],
      agent: agent._id,
    },
    {
      title: "Elegant 2-Bed Apartment in Kilimani",
      description:
        "Bright and spacious apartment on the 8th floor with panoramic city views. Walking distance to schools, malls, and restaurants.",
      price: 85000,
      type: "rent",
      category: "apartment",
      featured: true,
      location: {
        address: "Kilimani Road",
        city: "Nairobi",
        lat: -1.2921,
        lng: 36.7833,
      },
      features: {
        bedrooms: 2,
        bathrooms: 2,
        area: 95,
        parking: 1,
        furnished: true,
        yearBuilt: 2019,
      },
      amenities: ["Rooftop Terrace", "Security", "Elevator", "Gym"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        },
      ],
      agent: agent._id,
    },
    {
      title: "Spacious Family Home in Karen",
      description:
        "Charming 5-bedroom home on a half-acre lot in one of Nairobi's most sought-after neighbourhoods. Mature garden and large veranda.",
      price: 32000000,
      type: "sale",
      category: "house",
      featured: true,
      location: {
        address: "Karen Plains Road",
        city: "Nairobi",
        lat: -1.3345,
        lng: 36.7118,
      },
      features: {
        bedrooms: 5,
        bathrooms: 4,
        area: 380,
        parking: 3,
        furnished: false,
        yearBuilt: 2015,
      },
      amenities: ["Garden", "Staff Quarters", "Security", "Borehole"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
        },
      ],
      agent: agent._id,
    },
    {
      title: "Studio Apartment in Westlands",
      description:
        "Cosy fully-furnished studio, ideal for young professionals. All utilities included. 5 minutes from Sarit Centre.",
      price: 35000,
      type: "rent",
      category: "apartment",
      location: {
        address: "Westlands Avenue",
        city: "Nairobi",
        lat: -1.2683,
        lng: 36.8082,
      },
      features: {
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        parking: 1,
        furnished: true,
        yearBuilt: 2018,
      },
      amenities: ["WiFi", "Security", "Backup Power"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        },
      ],
      agent: agent._id,
    },
    {
      title: "Commercial Office Space in CBD",
      description:
        "Prime open-plan office on the 12th floor of a Grade A building. Fibre internet, 24-hour security, and ample parking.",
      price: 150000,
      type: "rent",
      category: "commercial",
      location: {
        address: "Kimathi Street",
        city: "Nairobi",
        lat: -1.2832,
        lng: 36.8219,
      },
      features: {
        bedrooms: 0,
        bathrooms: 2,
        area: 200,
        parking: 5,
        furnished: false,
      },
      amenities: ["Fibre Internet", "Conference Room", "Security", "Elevator"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        },
      ],
      agent: agent._id,
    },
    {
      title: "3-Bed Townhouse in Lavington",
      description:
        "Beautiful townhouse in a gated community of 8 units. Modern finishes, private garden, and excellent security.",
      price: 12000000,
      type: "sale",
      category: "house",
      location: {
        address: "Lavington Green",
        city: "Nairobi",
        lat: -1.2795,
        lng: 36.7724,
      },
      features: {
        bedrooms: 3,
        bathrooms: 3,
        area: 210,
        parking: 2,
        furnished: false,
        yearBuilt: 2020,
      },
      amenities: ["Gated Community", "Security", "Garden", "Fibre Internet"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800",
        },
      ],
      agent: agent._id,
    },
  ];

  await Listing.insertMany(listings);
  console.log(`✓ Seeded ${listings.length} listings for agent: ${agent.name}`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
