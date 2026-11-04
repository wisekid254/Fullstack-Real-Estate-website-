import Listing from "../models/Listing.js";
import ApiError from "../utils/ApiError.js";
import { askClaude } from "../utils/claude.js";

// ── Feature 1: Property Valuation ─────────────────────────
export const valuateListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError("Listing not found", 404);

  // Get comparable listings from the same city and category
  const comparables = await Listing.find({
    _id: { $ne: listing._id },
    category: listing.category,
    type: listing.type,
    status: "active",
    "location.city": listing.location?.city,
  })
    .select("title price features location")
    .limit(10);

  const comparablesSummary = comparables
    .map(
      (c) =>
        `- ${c.title}: KES ${c.price?.toLocaleString()}, ${c.features?.bedrooms} bed, ${c.features?.bathrooms} bath, ${c.features?.area}m²`,
    )
    .join("\n");

  const prompt = `
You are a real estate valuation expert specialising in the Kenyan property market.

Analyse this property and determine if it is fairly priced:

PROPERTY BEING VALUED:
- Title: ${listing.title}
- Type: ${listing.type} (${listing.category})
- Location: ${listing.location?.address}, ${listing.location?.city}
- Price: KES ${listing.price?.toLocaleString()}
- Bedrooms: ${listing.features?.bedrooms}
- Bathrooms: ${listing.features?.bathrooms}
- Area: ${listing.features?.area}m²
- Furnished: ${listing.features?.furnished ? "Yes" : "No"}
- Amenities: ${listing.amenities?.join(", ") || "None listed"}
- Year built: ${listing.features?.yearBuilt || "Unknown"}

COMPARABLE LISTINGS IN ${listing.location?.city}:
${comparablesSummary || "No comparable listings found in database"}

Based on this data, provide:
1. A verdict: UNDERPRICED, FAIRLY PRICED, or OVERPRICED
2. An estimated fair market value in KES
3. A confidence score (0-100)
4. A brief explanation (2-3 sentences) in plain English
5. Key factors affecting the valuation

Respond in this exact JSON format:
{
  "verdict": "FAIRLY PRICED",
  "estimatedValue": 15000000,
  "confidenceScore": 78,
  "explanation": "Your explanation here",
  "factors": ["factor 1", "factor 2", "factor 3"]
}
`;

  const systemPrompt = `You are a Kenyan real estate expert. Always respond with valid JSON only, no markdown, no extra text.`;

  const raw = await askClaude(prompt, systemPrompt, 512);
  const result = JSON.parse(raw);

  res.json({ success: true, valuation: result });
};

// ── Feature 2: Natural Language Search ────────────────────
export const naturalLanguageSearch = async (req, res) => {
  const { query } = req.body;

  if (!query) throw new ApiError("Search query is required", 400);

  const parsePrompt = `
You are a real estate search parser for the Kenyan property market.

Parse this natural language search query and extract structured filters:
"${query}"

Common Kenyan cities: Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, Malindi, Naivasha, Eldoret, Karen, Westlands, Kilimani, Lavington, Runda, Muthaiga, Gigiri, Kileleshwa, Parklands, Lang'ata, South B, South C, Eastleigh, Kasarani, Ruaka, Kitisuru

Property categories: house, apartment, villa, land, commercial
Listing types: sale, rent

Extract and respond in this exact JSON format:
{
  "type": "sale or rent or null",
  "category": "house/apartment/villa/land/commercial or null",
  "city": "city name or null",
  "minPrice": number or null,
  "maxPrice": number or null,
  "bedrooms": number or null,
  "furnished": true/false/null,
  "amenities": ["amenity1"] or [],
  "keywords": "remaining search terms or null"
}

Examples:
- "3 bedroom house in Westlands under 20 million" → {"type":"sale","category":"house","city":"Westlands","maxPrice":20000000,"bedrooms":3}
- "furnished apartment for rent in Kilimani" → {"type":"rent","category":"apartment","city":"Kilimani","furnished":true}
- "villa with pool in Karen" → {"category":"villa","city":"Karen","amenities":["Pool"]}
`;

  const systemPrompt = `Parse real estate queries into JSON filters. Respond with valid JSON only.`;
  const raw = await askClaude(parsePrompt, systemPrompt, 256);
  const filters = JSON.parse(raw);

  // Build MongoDB query from parsed filters
  const query_obj = { status: "active" };

  if (filters.type) query_obj.type = filters.type;
  if (filters.category) query_obj.category = filters.category;
  if (filters.city)
    query_obj["location.city"] = { $regex: filters.city, $options: "i" };
  if (filters.bedrooms)
    query_obj["features.bedrooms"] = { $gte: filters.bedrooms };
  if (filters.furnished !== null && filters.furnished !== undefined)
    query_obj["features.furnished"] = filters.furnished;
  if (filters.minPrice || filters.maxPrice) {
    query_obj.price = {};
    if (filters.minPrice) query_obj.price.$gte = filters.minPrice;
    if (filters.maxPrice) query_obj.price.$lte = filters.maxPrice;
  }
  if (filters.amenities?.length > 0)
    query_obj.amenities = { $in: filters.amenities };
  if (filters.keywords)
    query_obj.$or = [
      { title: { $regex: filters.keywords, $options: "i" } },
      { description: { $regex: filters.keywords, $options: "i" } },
    ];

  const listings = await Listing.find(query_obj)
    .populate("agent", "name email")
    .sort({ createdAt: -1 })
    .limit(12);

  res.json({
    success: true,
    listings,
    total: listings.length,
    parsedFilters: filters,
    interpretation: `Showing ${listings.length} results for: "${query}"`,
  });
};

// ── Feature 6: AI Chatbot ──────────────────────────────────
export const chatWithAI = async (req, res) => {
  const { message, history = [], listingId, pageContext } = req.body;

  if (!message) throw new ApiError("Message is required", 400);

  let listingContext = "";
  if (listingId) {
    const listing = await Listing.findById(listingId).populate(
      "agent",
      "name email",
    );
    if (listing) {
      listingContext = `
CURRENT LISTING CONTEXT:
- Title: ${listing.title}
- Price: KES ${listing.price?.toLocaleString()} (${listing.type})
- Location: ${listing.location?.address}, ${listing.location?.city}
- Category: ${listing.category}
- Bedrooms: ${listing.features?.bedrooms}
- Bathrooms: ${listing.features?.bathrooms}
- Area: ${listing.features?.area}m²
- Furnished: ${listing.features?.furnished ? "Yes" : "No"}
- Amenities: ${listing.amenities?.join(", ") || "None"}
- Agent: ${listing.agent?.name} (${listing.agent?.email})
- Description: ${listing.description?.slice(0, 300)}
`;
    }
  }

  const systemPrompt = `You are nestHaven AI, a friendly and knowledgeable real estate assistant specialising in the Kenyan property market.

You help users with:
- Understanding the process of buying, selling and renting property in Kenya
- Explaining legal requirements and documentation needed
- Answering questions about specific listings
- Comparing properties
- Understanding mortgage and financing options in Kenya
- Neighbourhood information and market insights
- Investment advice for Kenyan real estate

${listingContext}
${pageContext ? `USER IS CURRENTLY ON: ${pageContext}` : ""}

Guidelines:
- Be concise, friendly and professional
- Use Kenyan context (KES currency, local areas, local laws)
- If asked about a specific listing, reference the context above
- For legal advice, recommend consulting a licensed Kenyan advocate
- Format responses clearly with bullet points when listing multiple items
- Keep responses under 300 words unless the question requires more detail`;

  // Build conversation history for Claude
  const messages = [
    ...history.map((h) => ({
      role: h.role,
      content: h.content,
    })),
    { role: "user", content: message },
  ];

  const response = await askClaude(
    messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
    systemPrompt,
    512,
  );

  res.json({
    success: true,
    response,
    role: "assistant",
  });
};

// ── Feature 3: Description Generator (bonus) ──────────────
export const generateDescription = async (req, res) => {
  const { title, category, type, price, location, features, amenities } =
    req.body;

  const prompt = `
Write a professional, compelling and SEO-optimised property listing description for nestHaven.

Property details:
- Title: ${title}
- Category: ${category}
- Listing type: For ${type}
- Price: KES ${Number(price)?.toLocaleString()}
- Location: ${location?.address}, ${location?.city}, Kenya
- Bedrooms: ${features?.bedrooms}
- Bathrooms: ${features?.bathrooms}
- Area: ${features?.area}m²
- Furnished: ${features?.furnished ? "Yes" : "No"}
- Year built: ${features?.yearBuilt || "Not specified"}
- Amenities: ${amenities?.join(", ") || "None specified"}

Write a 150-200 word description that:
1. Opens with an attention-grabbing first sentence
2. Highlights the best features
3. Mentions the location and its advantages
4. Uses professional real estate language
5. Ends with a call to action
6. Is written for the Kenyan market

Return only the description text, no title, no labels.
`;

  const description = await askClaude(
    prompt,
    "You are a professional real estate copywriter in Kenya. Write compelling property descriptions.",
    400,
  );

  res.json({ success: true, description });
};
