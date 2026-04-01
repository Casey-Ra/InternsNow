# Greenhouse Board Starters

Verified on April 1, 2026 as publicly accessible Greenhouse boards.

## Default Board Set (99 boards)

The app ships with 99 default boards when `GREENHOUSE_BOARDS` is not set. They are organized by category:

### Big Tech / Consumer (14)
`airbnb`, `discord`, `dropbox`, `figma`, `instacart`, `lyft`, `pinterest`, `reddit`, `roku`, `squarespace`, `twitch`, `peloton`, `duolingo`, `grammarly`

### AI / ML (10)
`anthropic`, `deepmind`, `xai`, `scaleai`, `togetherai`, `stabilityai`, `runwayml`, `databricks`, `descript`, `gleanwork`

### Fintech / Payments (12)
`stripe`, `coinbase`, `robinhood`, `brex`, `affirm`, `chime`, `sofi`, `marqeta`, `carta`, `nubank`, `mercury`, `toast`

### Quant / Trading (10)
`jumptrading`, `janestreet`, `imc`, `akunacapital`, `point72`, `dvtrading`, `arcesiumllc`, `capstoneinvestmentadvisors`, `aquaticcapitalmanagement`, `gcmgrosvenor`

### Enterprise SaaS / Dev Tools (18)
`datadog`, `hubspotjobs`, `okta`, `mongodb`, `elastic`, `twilio`, `gitlab`, `asana`, `fivetran`, `dbtlabsinc`, `airtable`, `amplitude`, `neo4j`, `zscaler`, `cockroachlabs`, `calendly`, `vercel`, `planningcenter`

### Defense / Aerospace / Hardware / Robotics (15)
`spacex`, `andurilindustries`, `waymo`, `nuro`, `lucidmotors`, `verkada`, `purestorage`, `psiquantum`, `astranis`, `planetlabs`, `apptronik`, `freeformfuturecorp`, `relativity`, `armada`, `rivian`

### Other (20)
`c3iot`, `flexport`, `klaviyo`, `indeedflex`, `gusto`, `lattice`, `opendoor`, `checkr`, `ziprecruiter`, `thetradedesk`, `doubleverify`, `hootsuite`, `lgelectronics`, `carvana`, `icapitalnetwork`, `underdogfantasy`, `greenhouse`, `babelstreet`, `eulerity`, `shield`

## Keyword Filter

Default keywords (matched against job title and description):

```
intern, internship, co-op, apprentice, apprenticeship, fellowship,
new grad, new graduate, entry level, entry-level, early career,
campus, rotational, rotation program
```

Override with `GREENHOUSE_KEYWORDS` env var (comma-separated).

## Environment Variable Override

To customize the board list, set `GREENHOUSE_BOARDS`:

```env
GREENHOUSE_BOARDS=stripe|Stripe;datadog|Datadog;figma|Figma
```

Format: `token|Display Name` separated by `;` or newlines.

## Notes

- Greenhouse imports are board-scoped, not platform-wide.
- Your keyword filter controls what gets saved. Boards with no matching roles will simply import nothing.
- Boards can go inactive seasonally — the sync gracefully handles boards that return zero matches.
- If you want broader coverage beyond Greenhouse, add Lever, Ashby, or SmartRecruiters as separate integrations.
