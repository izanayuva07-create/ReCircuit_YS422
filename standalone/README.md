# ReCircuit Standalone Handover & Payout App

This folder contains the complete, modularized standalone web application for the **ReCircuit E-Waste Circular Marketplace & Live Handover Payout** system.

---

## 📁 Sub-File Structure

| File | Description |
| :--- | :--- |
| **`index.html`** | Clean HTML structure with responsive layout, dual portal split screens, modals, and stepper progress indicators. |
| **`styles.css`** | Comprehensive CSS stylesheet featuring curated palettes, glassmorphic cards, smooth transitions, responsive grid, and celebratory popup styling. |
| **`app.js`** | JavaScript logic managing real-time OTP generation, dispatch, verification, escrow payout release, wallet calculations, and multi-view switching. |

---

## 🚀 How to Run

1. **Double-click [`index.html`](index.html)** in this folder to open it directly in any web browser (Chrome, Edge, Brave, Safari, Firefox).
2. **Zero servers or background tools required** — operates completely offline with instant client-side simulation.

---

## 🔄 Interactive Workflow

1. **Step 1 (Collector)**: Tap **"I Have Arrived at Seller Doorstep"** ➔ Tap **"Send Receive OTP to Seller"**.
2. **Step 2 (Seller)**: Seller receives the 4-digit OTP ➔ Enters code (or taps **"Autofill OTP"**) ➔ Taps **"Verify OTP & Receive ₹4,500"**.
3. **Step 3 (Settlement)**: Escrow instantly credits ₹4,500 to the seller's wallet, updates the live header balance, and issues the CPCB Form 1 Green Handover Certificate.
