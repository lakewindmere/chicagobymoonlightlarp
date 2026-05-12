# Chicago In Moonlight

Chicago In Moonlight is a digital platform and character management system for a monthly **World of Darkness LARP (Live Action Role Playing)** experience set in Chicago. The application serves as a central hub for players to manage their character dossiers, submit downtime actions, and access the "Night Market" for event tickets and donations.

## 🌑 Features

### 🧛 Character Creator
A comprehensive digital ledger for personal record-keeping.
* **Identity Tracking:** Manage character name, clan, generation, predator type, and hunting pools.
* **Mechanical Tracking:** Update Attributes, Skills, Disciplines, and Blood Potency.
* **Health & Willpower:** Dynamic calculation of Health (Stamina + 3) and Willpower (Resolve + Composure).
* **Persistence:** Save dossiers locally as JSON files or sync them to a cloud registry for later retrieval.

### 📜 Downtime Actions (DTA)
A streamlined interface for players to submit narrative actions between game sessions
* **Narrative Submissions:** Submit up to three actions per cycle with storyteller preferences.
* **Feeding & Domain:** Log feeding routines, predator methodology, and domain status.
* **Plot Engagement:** Set risk tolerance levels and operational objectives to guide storyteller integration.

### 🏪 Night Market & Ticketing
An integrated store for managing event acquisitions.
* **Stripe Integration:** Secure checkout for LARP tickets and community donations.
* **Digital Credentials:** Automated generation of QR code passes for event entry upon successful purchase.
* **Community Chest:** A donation pool system to support fellow players.

### 🔍 Gatekeeper Portal
Internal tools for event staff to manage logistics.
* **Credential Scanning:** In-browser QR code scanner to admit guests and verify manifests.
* **Donation Management:** Real-time tracking and redemption of community ticket donations.

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Framer Motion](https://www.framer.com/motion/) for animations
* **Database:** [Supabase](https://supabase.com/) for character registry and downtime storage
* **Payments:** [Stripe](https://stripe.com/) API
* **Email:** [Resend](https://resend.com/) for order confirmations and digital credentials

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* Supabase Account
* Stripe Account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd chicagobymoonlightlarp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file with the following keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
    SUPABASE_SERVICE_ROLE_KEY=
    STRIPE_SECRET_KEY=
    STRIPE_WEBHOOK_SECRET=
    RESEND_API_KEY=
    NEXT_PUBLIC_BASE_URL=
    NEXT_PUBLIC_STAFF_PASSWORD=
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 📍 Event Details
Gatherings are held on the **last Saturday of every month**.
* **Location:** Palette & Chisel Academy of Fine Arts, 1012 N Dearborn St, Chicago, IL 60610.
* **Schedule:** Doors open at 5:00 PM; Court convenes strictly at 7:00 PM.

---
*Stay in the shadows.*