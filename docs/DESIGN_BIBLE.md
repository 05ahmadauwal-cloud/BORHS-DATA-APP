# BORHS Design Bible

Status: Foundation v1  
Product category: Everyday Digital Wallet  
Primary market: Nigeria

## 1. Brand idea

BORHS helps people keep everyday digital life moving: stay connected, pay essential services, fund a trusted balance, serve other people, and earn through an agent network.

The product is not positioned as a bank, crypto wallet, or generic VTU storefront. It is an everyday utility wallet with a credible business layer.

Brand promise: **Everyday services. One dependable balance.**

Experience attributes:

- Calm, not loud
- Capable, not complicated
- Local, not stereotypical
- Premium, not luxurious
- Friendly, not playful
- Fast, but never rushed

## 2. Reference synthesis

The visual references contribute different principles:

- Minimal wallet reference: restraint, whitespace, soft geometry, floating navigation.
- Branded authentication reference: memorable first impression, confident logo scale, clean entry flow.
- Premium financial reference: balance-first hierarchy, compact actions, disciplined transaction rows, strong bottom navigation.

We borrow principles and hierarchy, never their colors, illustrations, financial terminology, or screen compositions.

## 3. Color semantics

### Brand teal

Core: `#0F766E`

Use for:

- Primary actions
- Selected navigation
- Focus states
- Brand moments
- Links and information states

Do not use teal to mean transaction success.

### Success green

Core: `#22C55E`

Use only for:

- Successful payment
- Delivered service
- Wallet credit
- Verified state
- Positive earnings

### Reward amber

Core: `#F59E0B`

Use for:

- Cashback
- Commissions
- Referral rewards
- Agent milestones
- Attention that is not an error

### Danger red

Core: `#EF4444`

Use for failure, destructive actions, blocked states, and irreversible warnings.

### Neutrals

- Canvas: `#F8FAFC`
- Surface: `#FFFFFF`
- Primary text: `#111827`
- Secondary text: `#6B7280`
- Stroke: `#E5E7EB`

Maximum visible color rule: one brand color plus one semantic color and neutrals per screen region. Network logos may retain their official colors.

## 4. Typography

Typeface: Inter only.

Weights:

- 700: balances, page titles, critical totals
- 600: section titles, buttons, transaction values
- 500: labels and navigation
- 400: body and supporting text

Rules:

- Sentence case everywhere.
- Do not use uppercase for ordinary headings.
- Tabular numerals for balances and transaction values.
- Currency symbol and amount stay together.
- Supporting copy should be short, direct, and human.

## 5. Spacing and layout

Base grid: 8px.

Allowed core spacing values: 8, 16, 24, 32, 40, 48.

4px is allowed only for optical relationships such as icon-to-label or title-to-caption spacing.

Mobile page gutter: 16px.  
Tablet and desktop gutter: 24px.  
Customer content should remain focused rather than stretching across wide screens.

## 6. Shape and elevation

- Buttons: 16px radius
- Inputs: 18px radius
- Cards: 24px radius
- Bottom sheets: 32px top radius
- Pills and avatars: fully rounded

Cards are separated primarily with whitespace and surface contrast. Borders are optional and subtle. Shadows communicate elevation, not decoration.

One standard card shell is used across customer screens. Specialized cards may change internal layout, not outer styling.

## 7. Iconography

Library: Lucide only.

Rules:

- Default stroke width: 2px
- Common sizes: 16, 20, 24px
- Action icons sit in rounded containers
- Do not mix filled and outline icon families
- Do not use emoji as permanent interface icons
- Network and payment-provider marks are treated as brand assets, not UI icons

## 8. Buttons

Only one primary action may dominate a screen or bottom sheet.

Variants:

- Primary: teal fill, white label
- Secondary: white/surface fill, neutral label, subtle stroke
- Danger: red fill for explicit destructive confirmation
- Text: no container; navigation or low-emphasis action only

Minimum touch target: 44px.  
Default control height: 48px.  
Loading replaces the leading icon but does not change button width.

## 9. Inputs

Inputs use persistent labels above the field. Placeholder text is an example, never the only label.

Every input supports:

- Rest
- Focus
- Filled
- Disabled
- Error
- Success where verification is meaningful

Errors appear below the relevant field. Avoid generic toast-only validation.

## 10. Navigation

Customer mobile navigation has five destinations:

1. Home
2. Services
3. Transactions
4. Rewards
5. Profile

Wallet is a capability, not a primary destination. Balance, funding, and transfer remain visible from Home. Funding flows open as focused pages or sheets.

Desktop may translate the same information architecture into a rail or sidebar without adding destinations.

Admin navigation remains structurally separate because it serves operational work rather than customer tasks.

## 11. Core screen hierarchy

### Home

1. Greeting and notification access
2. Balance card
3. Fund and transfer actions
4. Contextual wallet statistics
5. Service grid
6. Recent transactions
7. One relevant promotion
8. Bottom navigation

The balance card is the hero. Promotions never outrank wallet state or frequent actions.

### Services

All service flows share one structure:

1. Compact header
2. Service identity and status
3. Primary form
4. Recent beneficiaries
5. Suggested or popular options
6. Sticky review/continue action

Selection, review, PIN authorization, processing, and result are consistent across data, airtime, electricity, cable, and exam PINs.

### Transactions

Rows prioritize:

1. Service identity
2. Recipient or purpose
3. Amount
4. Status
5. Time

Detail screens answer: what happened, who received it, was the wallet charged, what is the provider result, and what reference proves it?

### Rewards

Combines referrals, cashback, commissions, agent progress, and promotional codes. It must distinguish guaranteed balance from potential or pending earnings.

## 12. Transaction-state language

Canonical states:

- Ready
- Awaiting confirmation
- Processing
- Delivered
- Failed
- Refunded
- Reversed
- Needs attention

Every state combines icon, label, and supporting text. Color is never the only signal.

## 13. Motion and feedback

- Duration: 200–300ms
- Standard easing: `cubic-bezier(0.2, 0, 0, 1)`
- Animate opacity and transform only where possible
- No decorative looping motion
- Respect reduced-motion preferences
- Haptics are reserved for confirmed actions, success, and error on native devices

Skeletons match the final component geometry. Loading must never cause major layout shifts.

## 14. Content principles

- Say “Buy data,” not “Initiate data transaction.”
- Say “Wallet refunded,” not “Transaction reversed successfully.”
- Explain requirements before users encounter a blocked action.
- Never describe an incomplete transaction as successful.
- Keep provider names secondary unless the customer must act on them.
- Use Nigerian service terminology customers already recognize.

## 15. Accessibility baseline

- WCAG AA text contrast
- 44px minimum touch targets
- Visible keyboard focus
- Labels for every control
- Status never communicated by color alone
- Logical focus order in sheets and modals
- Reduced-motion support
- Currency and identifiers remain readable at large text sizes

## 16. Logo brief

The future mark should express dependable movement of everyday digital value. It may explore a distinctive B, connected paths, signal, exchange, or continuous flow—but must avoid generic shields, coins, lightning bolts, Wi-Fi icons, and bank buildings.

Required lockups:

- Symbol
- Horizontal wordmark
- App icon
- Monochrome mark
- Light and dark variants
- Receipt-safe mark
- Favicon

The logo is a separate identity workstream. It should not be finalized until the core Home and authentication compositions validate its visual weight.

## 17. Governance checklist

Before approving a screen:

- Is there only one dominant primary action?
- Does it use the 8px spacing rhythm?
- Does it use the standard card and control geometry?
- Are teal, green, and amber used semantically?
- Are prerequisites visible before action?
- Are loading, empty, error, processing, success, and refund states designed?
- Does it work at 320px width and with large text?
- Does it look like BORHS without relying on the logo?
