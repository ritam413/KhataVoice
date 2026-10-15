import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIRS = [
    r"c:\CCodes_WebDevelopment\hckthon\Next Founders\public\showcase",
    r"c:\CCodes_WebDevelopment\hckthon\Next Founders\Docs\showcase",
    r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\92f8b659-4074-436a-bf00-5ca0f8a8e090"
]

for d in OUTPUT_DIRS:
    os.makedirs(d, exist_ok=True)

def save_screenshot(page, filename):
    for d in OUTPUT_DIRS:
        path = os.path.join(d, filename)
        page.screenshot(path=path, full_page=False)
        print(f"[OK] Saved: {path}", flush=True)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1440x900 viewport with 2x device scale factor for crisp 2880x1800 4K Retina quality
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2
        )
        page = context.new_page()

        print("Navigating to http://localhost:3000...", flush=True)
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(2)

        # -------------------------------------------------------------
        # 1. Kirana Mobile Home Screen (Mobile Handset Simulator)
        # -------------------------------------------------------------
        print("Capturing 1: Kirana Mobile Home Screen...", flush=True)
        mobile_btn = page.locator("button:has-text('Kirana Mobile')")
        if mobile_btn.count() > 0:
            mobile_btn.click(force=True)
            time.sleep(1)
        save_screenshot(page, "01_kirana_mobile_home.png")

        # -------------------------------------------------------------
        # 2. Voice Entry & AI Transaction Extraction Modal
        # -------------------------------------------------------------
        print("Capturing 2: Voice Entry & AI Transaction Extraction...", flush=True)
        mic_cta = page.locator("button[aria-label*='Record Spoken Transaction']").first
        if mic_cta.count() > 0:
            mic_cta.click(force=True)
            time.sleep(1)

        # Inside modal, click the first preset
        voice_modal = page.locator("div[role='dialog'][aria-label='Voice Entry Modal']")
        preset_item = voice_modal.locator("button").filter(has_text="₹").first
        if preset_item.count() > 0:
            preset_item.click(force=True)
            # Give it 1.2s to process speech and display countdown & parsed transaction card
            time.sleep(1.2)
        save_screenshot(page, "02_voice_entry_ai_parsing.png")

        # -------------------------------------------------------------
        # 3. Retail Bharat Soundbox Confirmed & Dual-Sync Commit
        # -------------------------------------------------------------
        print("Capturing 3: Retail Bharat Soundbox Confirmed...", flush=True)
        # Wait 3.5s for countdown to finish and dual-sync commit
        time.sleep(3.8)
        save_screenshot(page, "03_retail_soundbox_confirmed.png")

        # Close the voice modal
        done_btn = page.locator("button:has-text('Done / Return Home')")
        if done_btn.count() > 0:
            done_btn.click(force=True)
            time.sleep(1)

        # -------------------------------------------------------------
        # 4. Cultural WhatsApp Debt Recovery Modal
        # -------------------------------------------------------------
        print("Capturing 4: Cultural WhatsApp Debt Recovery Modal...", flush=True)
        # Switch to desktop command to easily click the debtor WhatsApp action
        desktop_btn = page.locator("button:has-text('Desktop Command')")
        if desktop_btn.count() > 0:
            desktop_btn.click(force=True)
            time.sleep(1)

        # Click the WhatsApp button in the debtor table
        wa_btn = page.locator("button[title*='WhatsApp'], button[aria-label*='WhatsApp']").first
        if wa_btn.count() > 0:
            wa_btn.click(force=True)
            time.sleep(1.2)
        save_screenshot(page, "04_cultural_whatsapp_recovery.png")

        # Close WhatsApp modal
        close_btn = page.locator("button[aria-label='Close modal'], button[aria-label='Close'], button:has-text('✕')").first
        if close_btn.count() > 0:
            close_btn.click(force=True)
            time.sleep(0.8)

        # -------------------------------------------------------------
        # 5. Desktop Merchant Command Center (Live Realtime Stream)
        # -------------------------------------------------------------
        print("Capturing 5: Desktop Merchant Command Center...", flush=True)
        # Ensure desktop view is active and modal is closed
        time.sleep(0.5)
        save_screenshot(page, "05_desktop_command_center.png")

        # -------------------------------------------------------------
        # 6. Judge Economics & Working Capital ROI Simulator
        # -------------------------------------------------------------
        print("Capturing 6: Judge Economics & Working Capital ROI Simulator...", flush=True)
        judge_btn = page.locator("button:has-text('Judge Tour')")
        if judge_btn.count() > 0:
            judge_btn.click(force=True)
            time.sleep(1.2)
        save_screenshot(page, "06_judge_economics_simulator.png")

        # -------------------------------------------------------------
        # 7. Architecture & Scalability Inspector (Bonus)
        # -------------------------------------------------------------
        print("Capturing 7: Architecture & Scalability Inspector...", flush=True)
        arch_btn = page.locator("button:has-text('Arch Inspector')")
        if arch_btn.count() > 0:
            arch_btn.click(force=True)
            time.sleep(1.2)
        save_screenshot(page, "07_architecture_inspector.png")

        browser.close()
        print("ALL 7 SHOWCASE IMAGES CAPTURED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    run()
