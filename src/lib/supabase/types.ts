// Hand-written for now (avoid the codegen round-trip). Mirrors 0001_initial_schema.sql.
export type BookingStatus =
  | "requested"
  | "accepted"
  | "deposit_paid"
  | "fully_paid"
  | "cancelled"
  | "completed";

export type BookingSource = "web" | "airbnb" | "manual";

export interface Booking {
  id: string;
  source: BookingSource;
  status: BookingStatus;
  arrival: string; // YYYY-MM-DD
  departure: string;
  guests: number;
  children: number;
  needs_crib: boolean;
  pets: number;
  needs_wheelchair: boolean;
  rents_dachboden: boolean;
  is_cleaning: boolean;
  reminder_balance_sent_at: string | null;
  reminder_arrival_sent_at: string | null;
  occasion: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  message: string | null;
  total_price_cents: number | null;
  deposit_amount_cents: number | null;
  internal_notes: string | null;
  airbnb_uid: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingRow {
  id: string;
  type: "base" | "special";
  label: string | null;
  price_per_night_cents: number;
  start_date: string | null;
  end_date: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface SettingsRow {
  key: string;
  value: unknown;
  updated_at: string;
}

export const STATUS_LABEL_DE: Record<BookingStatus, string> = {
  requested: "Angefragt — noch nicht geprüft",
  accepted: "Bestätigt — wartet auf Anzahlung",
  deposit_paid: "Anzahlung erhalten — wartet auf Restzahlung",
  fully_paid: "Vollständig bezahlt",
  cancelled: "Storniert",
  completed: "Aufenthalt abgeschlossen",
};

export const STATUS_COLOR: Record<BookingStatus, string> = {
  requested: "bg-amber-100 text-amber-900 border-amber-300",
  accepted: "bg-blue-100 text-blue-900 border-blue-300",
  deposit_paid: "bg-indigo-100 text-indigo-900 border-indigo-300",
  fully_paid: "bg-emerald-100 text-emerald-900 border-emerald-300",
  cancelled: "bg-stone-100 text-stone-700 border-stone-300 line-through",
  completed: "bg-stone-50 text-stone-600 border-stone-200",
};
