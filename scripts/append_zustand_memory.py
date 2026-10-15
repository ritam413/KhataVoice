"""
Append Zustand v5 state management memories and KV-05 completion to AgentMemory for KhataVoice.
"""

from agentmemory import create_memory

memories = [
    {
        "category": "architectural_decisions",
        "text": "Zustand v5 (zustand@^5.0.15) standardized as the global client-side state management library. Implemented slice architecture via useAppStore (src/lib/store/useAppStore.ts) separating UISlice (viewportMode, language, activeScreen, modals), VoiceSlice (voiceState, transcript, countdownSeconds, isSyncing mutex), and DataSlice (customers, inventory, ledger). Granular selector subscriptions using useShallow from 'zustand/react/shallow' prevent 60fps audio waveform canvas rendering from triggering re-render cascades across ledger tables and inventory grids on low-end Android phones.",
        "metadata": {"source": "RESEARCH-KV-14-ZUSTAND-STATE-MANAGEMENT", "domain": "client_state_management"}
    },
    {
        "category": "domain_invariants",
        "text": "Out-of-Tree Store Interactivity: Native Web Speech API event listeners and Supabase Realtime channel event handlers can directly read and mutate state via useAppStore.getState() and useAppStore.setState() without React hooks or wrapping listeners in React component trees.",
        "metadata": {"source": "src/lib/store/useAppStore.ts", "domain": "state_invariants"}
    },
    {
        "category": "domain_invariants",
        "text": "SSR Hydration Determinism in Next.js 14 App Router: All Zustand store initial state defaults must match exactly between server pre-rendering and client mounting (viewportMode: 'mobile', language: 'bn', activeScreen: 'home') to prevent React hydration mismatch warnings.",
        "metadata": {"source": "RESEARCH-KV-14-ZUSTAND-STATE-MANAGEMENT", "domain": "hydration_invariants"}
    },
    {
        "category": "beads_tickets",
        "text": "KV-05 (Tri-Tier Speech Adapter) and Zustand v5 state management architecture are fully IMPLEMENTED and VERIFIED. Unblocked downstream frontier tickets: KV-06 (Waveform Canvas Visualizer), KV-07 (Hybrid NLP Parser), KV-08 (Transcribe & Parse API Routes), and KV-14 (Dual-Mode Viewport Simulator).",
        "metadata": {"source": "Docs/Tickets/README.md", "ticket": "KV-05_KV-14", "status": "completed"}
    }
]

for mem in memories:
    try:
        create_memory(
            category=mem["category"],
            text=mem["text"],
            metadata=mem["metadata"]
        )
        print(f"Stored memory in {mem['category']}: {mem['text'][:60]}...")
    except Exception as e:
        print(f"Error storing memory: {e}")

print("AgentMemory update complete.")
