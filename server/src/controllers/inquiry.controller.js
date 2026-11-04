import Inquiry from "../models/Inquiry.js";
import Listing from "../models/Listing.js";
import ApiError from "../utils/ApiError.js";
import { sendInquiryNotification } from "../utils/emailService.js";
import { createNotification } from "./notification.controller.js";

export const createInquiry = async (req, res) => {
  const { listingId, name, email, phone, message } = req.body;

  const listing = await Listing.findById(listingId).populate(
    "agent",
    "name email",
  );
  if (!listing) throw new ApiError("Listing not found", 404);

  const inquiry = await Inquiry.create({
    listing: listingId,
    name,
    email,
    phone,
    message,
  });

  // Send email to agent
  if (listing.agent?.email) {
    sendInquiryNotification({
      agentEmail: listing.agent.email,
      agentName: listing.agent.name,
      listingTitle: listing.title,
      buyerName: name,
      buyerEmail: email,
      buyerPhone: phone,
      message,
    }).catch(console.error);
  }

  // Create in-app notification for agent
  if (listing.agent?._id) {
    await createNotification({
      userId: listing.agent._id,
      type: "inquiry_received",
      title: "New inquiry received",
      message: name + ' is interested in "' + listing.title + '"',
      link: "/listings/" + listingId,
      data: { buyerName: name, buyerEmail: email, listingTitle: listing.title },
    });
  }

  res.status(201).json({ success: true, inquiry });
};

export const getMyInquiries = async (req, res) => {
  const inquiries = await Inquiry.find({ listing: { $in: [] } });
  res.json({ success: true, inquiries });
};
