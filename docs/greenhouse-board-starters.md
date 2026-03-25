# Greenhouse Board Starters

Verified on March 25, 2026 as publicly accessible Greenhouse boards.

## Recommended Starter Set

Use this in `GREENHOUSE_BOARDS`:

```env
GREENHOUSE_BOARDS=stripe|Stripe;datadog|Datadog;figma|Figma;cloudflare|Cloudflare;robinhood|Robinhood;jumptrading|Jump Trading;c3iot|C3 AI;flexport|Flexport;coinbase|Coinbase;klaviyo|Klaviyo;indeedflex|Indeed Flex
```

## Why These

- `stripe|Stripe`: public board with intern and new grad roles.
- `datadog|Datadog`: public board with engineering and product interns.
- `figma|Figma`: public board with 2026 intern roles.
- `cloudflare|Cloudflare`: public board with software and product intern roles.
- `robinhood|Robinhood`: public board with multiple Summer 2026 intern roles.
- `jumptrading|Jump Trading`: public board with many campus intern roles.
- `c3iot|C3 AI`: public board with Summer 2026 software and data science interns.
- `flexport|Flexport`: public board with new grad and early-career operations roles.
- `coinbase|Coinbase`: public board for crypto and fintech roles; useful even when internship volume is seasonal.
- `klaviyo|Klaviyo`: public board with campus-style intern postings.
- `indeedflex|Indeed Flex`: usable Greenhouse board, though it skews more staffing and operations than traditional campus tech recruiting.

## Optional Next Wave

These are valid Greenhouse boards, but internship/new grad volume may be more seasonal:

```env
GREENHOUSE_BOARDS=airbnb|Airbnb;notion|Notion;dropbox|Dropbox;hubspotjobs|HubSpot
```

## Notes

- Greenhouse imports are board-scoped, not platform-wide.
- This starter set is now the app default when `GREENHOUSE_BOARDS` is not set.
- Your keyword filter still controls what gets saved. Boards with no matching internship-style roles will simply import nothing.
- If you want broader coverage, add Lever, Ashby, or SmartRecruiters separately instead of making the Greenhouse list too large.
