import React from "react";
import { getDbAdapter } from "@/lib/db/supabase";
import { DEFAULT_MERCHANT_ID } from "@/lib/db/seed-data";
import { ViewportSimulator } from "@/components/layout/ViewportSimulator";
import { MainClientView } from "@/components/views/MainClientView";
import { DesktopCommandCenter } from "@/components/views/DesktopCommandCenter";

export default async function HomePage() {
  const db = getDbAdapter();
  const customers = await db.getCustomers(DEFAULT_MERCHANT_ID);
  const inventory = await db.getInventory(DEFAULT_MERCHANT_ID);
  const ledgerEntries = await db.getLedgerEntries(DEFAULT_MERCHANT_ID, 20);

  // Mobile Handset Screen View (Interactive KV-15 HomeScreen + VoiceEntryModal)
  const mobileContent = (
    <MainClientView
      initialCustomers={customers}
      initialInventory={inventory}
      initialLedger={ledgerEntries}
      merchantId={DEFAULT_MERCHANT_ID}
    />
  );

  // Desktop Merchant Command Center View (Interactive KV-18 Realtime Hub)
  const desktopContent = (
    <DesktopCommandCenter
      initialCustomers={customers}
      initialInventory={inventory}
      initialLedger={ledgerEntries}
      merchantId={DEFAULT_MERCHANT_ID}
    />
  );

  return (
    <ViewportSimulator desktopContent={desktopContent}>
      {mobileContent}
    </ViewportSimulator>
  );
}

