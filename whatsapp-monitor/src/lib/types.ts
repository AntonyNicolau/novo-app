export type SessionStatus = "disconnected" | "connecting" | "qr" | "connected";

export interface DashboardStats {
  total_sellers: number;
  online_sellers: number;
  offline_sellers: number;
  open_conversations: number;
  new_conversations_today: number;
  messages_sent_today: number;
  messages_received_today: number;
  avg_response_seconds: number;
  customers_waiting: number;
  whatsapp_disconnected: number;
  active_alerts: number;
}

export interface SellerOverview {
  id: string;
  name: string;
  photo_url: string | null;
  phone: string | null;
  work_start: string;
  work_end: string;
  session_status: SessionStatus;
  online: boolean;
  connected_at: string | null;
  last_activity_at: string | null;
  last_sync_at: string | null;
  messages_sent_today: number;
  messages_received_today: number;
  avg_response_seconds: number;
  online_seconds: number;
  offline_seconds: number;
  conversations_count: number;
  awaiting_count: number;
}

export interface Conversation {
  id: string;
  seller_id: string;
  customer_name: string | null;
  customer_phone: string;
  last_message: string | null;
  last_message_at: string | null;
  last_message_from: "customer" | "seller" | null;
  awaiting_reply: boolean;
  awaiting_since: string | null;
  messages_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  seller_id: string;
  direction: "in" | "out";
  body: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  type:
    | "whatsapp_disconnected"
    | "seller_offline"
    | "customer_waiting"
    | "no_activity"
    | "high_volume"
    | "sync_failure";
  severity: "info" | "warning" | "critical";
  seller_id: string | null;
  title: string;
  message: string | null;
  resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

export interface MetricRow {
  seller_id: string;
  date: string;
  messages_sent: number;
  messages_received: number;
  conversations_count: number;
  new_conversations: number;
  avg_response_seconds: number;
  online_seconds: number;
  offline_seconds: number;
}

export interface WhatsappSession {
  id: string;
  seller_id: string;
  status: SessionStatus;
  qr_code: string | null;
  phone_jid: string | null;
  online: boolean;
  connected_at: string | null;
  last_activity_at: string | null;
  last_sync_at: string | null;
}
