# Mini App Process & Data Flows

## Overview

This document describes the technical process and data flows for the Farlinker Mini App — how data moves from Farcaster through the SDK, into the app, and out to the user.

---

## 1. SDK Initialization Sequence

```mermaid
sequenceDiagram
    participant User
    participant Warpcast as Warpcast Client
    participant WebView as Mini App WebView
    participant NextJS as Next.js Server
    participant SDK as Mini App SDK

    User->>Warpcast: Triggers mini app (share or direct)
    Warpcast->>NextJS: HTTP GET /mini-app
    NextJS-->>WebView: Serve page.tsx
    WebView->>SDK: React mounts, useEffect fires
    SDK->>SDK: sdk.actions.ready()
    SDK-->>Warpcast: postMessage: ready
    Warpcast-->>WebView: Hide splash screen
    WebView->>SDK: Read sdk.context
    Note over WebView,SDK: context.location<br/>context.user<br/>context.client
```

### Context Object Shape

```typescript
// Available after SDK init
sdk.context = {
  user: {
    fid: number,
    username: string,
    displayName: string,
    pfpUrl: string,
  },
  location: {
    // Share extension entry
    type: 'cast_share',
    cast: {
      hash: string,
      author: { fid, username, displayName, pfpUrl },
      text: string,
      timestamp: string,
      channelKey?: string,
    }
  } | {
    // Direct launch entry
    type: 'app',
  },
  client: {
    platformType: 'web' | 'mobile',
    clientFid: number,
    added: boolean,
    safeAreaInsets: { top, bottom, left, right },
  }
}
```

---

## 2. Cast Data Flow — Share Extension

When a user shares a cast to Farlinker, the data flows entirely through the SDK context. No API call is needed.

```mermaid
flowchart TD
    A[Warpcast sends cast_share context] --> B[useEffect reads sdk.context.location]
    B --> C[Extract cast data]
    C --> D[hash, author.username, author.pfpUrl,<br/>author.displayName, text]
    D --> E[Generate URLs]
    E --> F["enhanced: farlinker.xyz/{username}/{hash}"]
    E --> G["standard: farlinker.xyz/{username}/{hash}?preview=standard"]
    F & G --> H[Render UI]
    H --> I[CastPreview<br/>PFP + name + text]
    H --> J[FormatSelector<br/>enhanced vs standard cards]
    H --> K[ActionButtons<br/>copy + share]
```

### Data Dependencies

| Component | Data Required | Source |
|-----------|--------------|--------|
| CastPreview | author PFP, display name, text | `sdk.context.location.cast` |
| FormatSelector | generated URLs, example images | Computed from cast hash + username |
| ActionButtons | selected URL | State from FormatSelector |

---

## 3. Cast Data Flow — Direct Launch (Manual URL)

When no cast context is available, the user provides a URL and we fetch cast data via API.

```mermaid
sequenceDiagram
    participant User
    participant App as Mini App
    participant API as /api/cast-details
    participant Neynar as Neynar SDK
    participant Cache as Cast Cache

    User->>App: Pastes farcaster.xyz/username/0xhash
    App->>App: Parse URL → extract username + hash
    App->>API: POST { hash, username }
    API->>Cache: Check cache
    alt Cache hit
        Cache-->>API: Cached cast data
    else Cache miss
        API->>Neynar: lookupCastByHashOrWarpcastUrl()
        Neynar-->>API: Cast data
        API->>Cache: Store result
    end
    API-->>App: { hash, pfp, displayName, username, text, embeddedImage, aspectRatio }
    App->>App: Render same UI as share extension
```

---

## 4. URL Generation Logic

```mermaid
flowchart TD
    A["Input: username, hash, selectedFormat"] --> B{selectedFormat?}
    B -->|enhanced| C["farlinker.xyz/{username}/{hash}"]
    B -->|standard| D["farlinker.xyz/{username}/{hash}?preview=standard"]
    C --> E[Final URL string]
    D --> E
    E --> F[Used by Copy / Share actions]
```

### What Happens When the Generated URL is Opened

```mermaid
flowchart TD
    A[External platform crawler<br/>fetches Farlinker URL] --> B[middleware.ts<br/>validates /username/hash pattern]
    B --> C["app/[username]/[hash]/page.tsx"]
    C --> D[generateMetadata runs server-side]
    D --> E[detectPlatform<br/>userAgent]
    D --> F[fetchCastByUrl<br/>Neynar SDK + cache]
    D --> G[extractEmbedData<br/>images, dimensions]
    E & F & G --> H[selectPreviewImage]
    H --> I[buildTitleDescription]
    I --> J[Return Metadata<br/>og:image, og:title, og:description]

    C --> K{Visitor type?}
    K -->|Bot / Crawler| L[Gets metadata<br/>renders rich preview]
    K -->|Human user| M["ClientRedirect →<br/>farcaster.xyz/{username}/{hash}"]
```

---

## 5. Share / Copy Action Flow

```mermaid
flowchart TD
    A[User taps button] --> B{Which button?}

    B -->|Copy Link| C[navigator.clipboard.writeText]
    C --> D{Success?}
    D -->|Yes| E["Show 'Copied!' for 2s"]
    D -->|No| F[Textarea fallback]
    F --> G[Create hidden textarea<br/>select + execCommand copy]
    G --> E

    B -->|Share| H{navigator.share available?}
    H -->|Yes - mobile| I["navigator.share({url, title})"]
    I --> J[Native share sheet opens]
    H -->|No - desktop| C

    E & J --> K[Analytics event<br/>farlinker_miniapp_action]
```

---

## 6. State Management

The mini app uses React state only — no external state library needed given the simplicity.

```mermaid
stateDiagram-v2
    [*] --> Loading: Page mounts
    Loading --> SDKInit: useEffect fires
    SDKInit --> CheckContext: sdk.actions.ready()

    CheckContext --> ShareFlow: location.type = cast_share
    CheckContext --> ManualFlow: location.type = app

    ShareFlow --> CastReady: castData from SDK context
    ManualFlow --> WaitingForInput: Show URL input
    WaitingForInput --> Fetching: User submits URL
    Fetching --> CastReady: API returns cast data
    Fetching --> Error: API error

    Error --> WaitingForInput: User retries

    CastReady --> FormatSelection: Show cast preview + format cards
    FormatSelection --> FormatSelection: User toggles format
    FormatSelection --> ActionTaken: User taps Copy or Share
    ActionTaken --> Feedback: Show success feedback
    Feedback --> FormatSelection: Feedback timer expires
```

### Component State Tree

```
MiniAppPage (root)
│
├── isLoaded: boolean          — SDK initialized?
├── castData: Cast | null      — from SDK context or API
├── entrySource: 'cast_share' | 'manual'
│
├── FormatSelector
│   └── selectedFormat: 'enhanced' | 'standard'
│
├── URLDisplay
│   └── generatedUrl: string   — derived from castData + selectedFormat
│
└── ActionButtons
    └── copyFeedback: boolean  — shows "Copied!" temporarily
```

---

## 7. API Endpoints Used by Mini App

| Endpoint | Method | Used When | Request | Response |
|----------|--------|-----------|---------|----------|
| `/api/cast-details` | POST | Manual URL entry (no SDK context) | `{ hash, username? }` | `{ hash, pfp, displayName, username, text, embeddedImage, aspectRatio }` |

The share extension flow does **not** call any API — all cast data comes from the SDK context.

---

## 8. Manifest Configuration

```json
// public/.well-known/farcaster.json
{
  "accountAssociation": { ... },
  "miniapp": {
    "version": "1",
    "name": "Farlinker",
    "iconUrl": "https://farlinker.xyz/farlinker.png",
    "splashImageUrl": "https://farlinker.xyz/farlinker.png",
    "splashBackgroundColor": "#8B5CF6",
    "homeUrl": "https://farlinker.xyz/mini-app",
    "castShareUrl": "https://farlinker.xyz/mini-app/share"
  },
  "actions": [ ... ]
}
```

| Field | Purpose |
|-------|---------|
| `homeUrl` | Entry point when user launches app directly |
| `castShareUrl` | Entry point when user shares a cast to the app |
| `iconUrl` | App icon in mini app store and share sheet |
| `splashImageUrl` | Shown during SDK initialization |
| `splashBackgroundColor` | Background behind splash image |
