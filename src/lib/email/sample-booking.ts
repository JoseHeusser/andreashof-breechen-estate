import type { Booking } from "@/lib/supabase/types";

// Fake booking that fills every placeholder in the email templates.
// Used by the admin "E-Mail-Vorlagen" tab and scripts/preview-emails.ts.
export const SAMPLE_BOOKING: Booking = {
  id: "preview01-1234-5678-abcd-000000000000",
  source: "web",
  status: "requested",
  arrival: "2027-08-13",
  departure: "2027-08-20",
  guests: 12,
  children: 2,
  needs_crib: true,
  pets: 1,
  needs_wheelchair: false,
  rents_dachboden: false,
  is_cleaning: false,
  reminder_balance_sent_at: null,
  reminder_arrival_sent_at: null,
  occasion: "Familienfeier",
  contact_name: "Max Mustermann",
  contact_email: "max.mustermann@example.com",
  contact_phone: "+49 170 1234567",
  message: "Wir freuen uns sehr auf das Gutshaus! Gibt es genug Platz für zwei Kinderwagen?",
  total_price_cents: 260000,
  deposit_amount_cents: 130000,
  internal_notes: null,
  airbnb_uid: null,
  created_at: "2027-01-10T10:00:00.000Z",
  updated_at: "2027-01-10T10:00:00.000Z",
};
