# LOVABLE_SPEC.md

## App
**Name (working):** List & Share  
**Type:** Peer-to-peer real-estate PWA  
**USP tagline:** **List. Share. Connect. Real estate made simple.**  
**Goal:** Let anyone create a property listing in <2 minutes, share it everywhere, and message directly with interested people.

---

## Routes & Page Intents
- `/` – **Home** (hero, search bar shell, CTA buttons, feature tiles)
- `/search` – **Search** (list of listings, filters; server endpoint exists, UI can be simple)
- `/listings/:id` – **Listing Detail** (gallery, price, contact actions, map)
- `/my-listings` – **Dashboard** (owner's listings, create/edit/delete)
- `/messages` – **Messages** (conversation list + thread)
- `*` – **Not Found**

---

## Entities (Data Models)

```ts
// users
interface User {
  id: string;           // uuid
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;    // ISO
}

// listings
interface Listing {
  id: string;                // uuid
  userId: string;            // FK -> users.id
  title: string;
  description: string;       // allow ~1200 chars
  price: number;             // numeric
  beds?: number;
  baths?: number;
  sizeSqft?: number;
  latitude?: number;
  longitude?: number;
  locationFormatted?: string;
  coverPhotoUrl?: string;
  gallery?: string[];        // image URLs
  contactName?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  youtubeUrl?: string;
  showApproximateLocation?: boolean;
  createdAt: string;         // ISO
  deletedAt?: string | null;
}

// messages (50-word max for content)
interface Message {
  id: string;            // uuid
  listingId: string;     // FK -> listings.id
  senderId: string;      // FK -> users.id
  recipientId: string;   // FK -> users.id
  content: string;       // <= 50 words (enforce server-side)
  createdAt: string;     // ISO
  readAt?: string | null;
}
```

---

## REST API Contract

### Listings

* `GET /api/listings?query=&page=&limit=` → `Listing[]`
* `GET /api/listings/:id` → `Listing` + owner (denormalized):

  ```json
  {
    "listing": { ...Listing fields... },
    "owner": { "id":"...", "name":"...", "avatarUrl":"..." }
  }
  ```
* (Auth) `GET /api/my-listings` → `Listing[]` (user's own)
* (Auth) `POST /api/listings` → create (body: Listing minus ids/timestamps)
* (Auth) `PATCH /api/listings/:id` → update owned listing
* (Auth) `DELETE /api/listings/:id` → soft delete (set `deletedAt`)

### Messages

* (Auth) `GET /api/listings/:id/messages` → thread for this listing between **current user** and **owner**

  ```json
  { "messages": [ { ...Message }, ... ] }
  ```
* (Auth) `POST /api/listings/:id/messages` → send message

  ```json
  { "content": "Hi! Is this still available?" }
  ```

  **Rules:** reject >50 words; return `201` with saved message.

### Auth

* Email magic-link / OTP is fine. Endpoints can be conventional:

  * `POST /api/auth/login` → start magic link / OTP
  * `POST /api/auth/verify` → finish; returns session
  * `GET /api/auth/me` → current user

---

## UX / UI Style (Zillow-like)

### 1) Hero (Home)

* **Background:** crisp photo, **no blur**, neutral overlay only.
* **Overlay:** `bg-black/30` (mobile) → `bg-black/25` (desktop).
* **Navbar:** white, thin border bottom, no transparency.
* **Typography:** big, tight tracking.

**Reference markup (use as guidance for the builder):**

```html
<section class="relative h-[420px] sm:h-[520px] overflow-hidden">
  <img src="/hero.jpg" class="absolute inset-0 w-full h-full object-cover" alt="" />
  <div class="absolute inset-0 bg-black/30 md:bg-black/25"></div>

  <nav class="absolute top-0 left-0 right-0 z-20 bg-white/95 border-b">
    <!-- logo + right-side actions -->
  </nav>

  <div class="relative z-10 mx-auto max-w-6xl px-4 pt-20 sm:pt-24">
    <h1 class="text-white font-extrabold tracking-tight leading-tight text-4xl sm:text-6xl">
      List. Share. Connect.
      <span class="block text-white/90 font-semibold">Real estate made simple.</span>
    </h1>
    <p class="mt-4 text-white/90 text-base sm:text-lg max-w-2xl">
      Create beautiful property listings in under 2 minutes and share them across Facebook, WhatsApp, and beyond.
    </p>
    <div class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
      <button class="btn btn-white btn-xl">Create Your First Listing</button>
      <button class="btn btn-white btn-xl">Search Properties</button>
    </div>
  </div>
</section>
```

### 2) Buttons (Zillow-style)

**Pill, chunky, crisp focus.** Define utility classes or variants:

```css
/* Global button styles (can be mapped to a component) */
.btn {
  @apply inline-flex items-center justify-center font-semibold rounded-full
         transition-colors select-none focus-visible:outline-none
         focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
         disabled:opacity-50 disabled:pointer-events-none;
}
.btn-primary { @apply bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:bg-blue-800; }
.btn-white   { @apply bg-white text-gray-900 border border-gray-200 shadow-md hover:bg-gray-100 active:bg-gray-200; }
.btn-outline { @apply bg-white text-gray-900 border border-gray-300 hover:bg-gray-50; }
.btn-ghost   { @apply bg-transparent text-blue-700 hover:bg-blue-50; }

.btn-sm { @apply h-9 px-4 text-sm; }
.btn-md { @apply h-11 px-5 text-base; }
.btn-lg { @apply h-14 px-7 text-base; }
.btn-xl { @apply h-[3.75rem] px-8 text-lg; }
```

### 3) Messages (Chat)

Clean bubbles, left/right, sticky composer.

```html
<div class="mx-auto max-w-3xl h-[calc(100vh-8rem)] flex flex-col border rounded-2xl overflow-hidden bg-white">
  <div class="h-14 flex items-center justify-between px-4 border-b bg-white">
    <div class="font-semibold">Chat with Alex</div>
    <div class="text-sm text-gray-500">Listing • #A123</div>
  </div>

  <div class="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gray-50">
    <!-- other person -->
    <div class="flex items-end gap-2">
      <img src="/avatar-seller.png" class="w-8 h-8 rounded-full" alt="" />
      <div>
        <div class="max-w-[75vw] md:max-w-[520px] rounded-2xl rounded-tl-sm bg-gray-100 text-gray-900 px-4 py-2 shadow-sm">
          Hi! Is this still available?
        </div>
        <div class="mt-1 text-xs text-gray-500">10:22 AM</div>
      </div>
    </div>

    <!-- me -->
    <div class="flex items-end gap-2 justify-end">
      <div>
        <div class="max-w-[75vw] md:max-w-[520px] rounded-2xl rounded-tr-sm bg-blue-600 text-white px-4 py-2 shadow-md">
          Yes, it is. Would you like to schedule a tour?
        </div>
        <div class="mt-1 text-right text-xs text-gray-500">10:24 AM • Read</div>
      </div>
      <img src="/avatar-me.png" class="w-8 h-8 rounded-full" alt="" />
    </div>
  </div>

  <div class="border-t bg-white p-3">
    <form class="flex items-center gap-2">
      <input type="text" placeholder="Write a message…"
        class="flex-1 h-12 px-4 rounded-full border border-gray-300 bg-white
               focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2" />
      <button class="btn btn-primary btn-md px-6">Send</button>
    </form>
  </div>
</div>
```

**Server rule:** reject messages > **50 words**.

### 4) Cards & Sections

* Section container: `mx-auto max-w-6xl px-4`
* Section titles: `text-2xl sm:text-3xl font-semibold tracking-tight`
* Cards: `bg-white border rounded-2xl shadow-md`, image `object-cover h-48 sm:h-56`

### 5) Typography (mobile-first, Zillow-like scale)

Extend Tailwind or apply CSS variables. Suggested sizes:

```ts
// tailwind.config.ts (snippet)
extend: {
  fontSize: {
    sm: ['0.95rem', { lineHeight: '1.4rem' }],
    base: ['1.05rem', { lineHeight: '1.6rem' }], // ~17px
    lg: ['1.25rem', { lineHeight: '1.8rem' }],
    xl: ['1.5rem', { lineHeight: '2rem' }],
    '2xl': ['1.75rem', { lineHeight: '2.2rem' }],
    '3xl': ['2rem', { lineHeight: '2.4rem' }],
  }
}
```

(Optionally in `index.css` add)

```css
html { font-size: clamp(16px, 2vw, 18px); }
```

---

## Non-functional Requirements

* **Mobile-first**: all layouts must look great on 360–430px widths.
* **Accessibility**: overlay must ensure text contrast (WCAG AA); focus rings on interactive elements.
* **SEO**: sensible `<title>`, meta description per route.
* **PWA**:

  * `public/manifest.webmanifest` (name, short\_name, start\_url `/`, display `standalone`, theme\_color `#ffffff`, icons 192/512).
  * Simple service worker to cache shell + images.
  * `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.

---

## Minimal Seed Data

```json
// POST /api/listings (example)
{
  "title": "Bright 2BR near City Park",
  "description": "South-facing unit with balcony and parking.",
  "price": 1850,
  "beds": 2,
  "baths": 1,
  "sizeSqft": 920,
  "latitude": 29.7604,
  "longitude": -95.3698,
  "locationFormatted": "Houston, TX",
  "coverPhotoUrl": "/seed/apt-1.jpg",
  "gallery": ["/seed/apt-1.jpg","/seed/apt-2.jpg"],
  "contactName": "Rakesh",
  "contactPhone": "+1-555-123-4567",
  "contactWhatsapp": "+1-555-123-4567",
  "youtubeUrl": "",
  "showApproximateLocation": true
}
```

---

## Acceptance Checklist

* [ ] Home hero uses **neutral overlay** (`bg-black/30`), **no blur**, big white headline.
* [ ] Buttons are **pill/rounded-full** with **white** (on hero) and **blue primary** variants.
* [ ] Messages page uses bubble layout; server enforces **≤ 50 words**.
* [ ] CRUD for listings + messaging endpoints implemented as above.
* [ ] `/my-listings` only returns the current user's listings.
* [ ] PWA manifest + basic SW present.
