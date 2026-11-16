# Optional two-provider map scanner

The offline editor works without this service. This Worker performs two independent reads, then the client requests a second stage where each provider checks the other's structured result against the same masked image. No automatic route changes or billable retries. A complete scan normally makes four provider calls.

## Local checks

From the repository root: `node --test tests/map-scan*.test.mjs`.

Tests exercise the real adapters with synthetic provider HTTP responses; they do not prove live model availability or recognition accuracy. Provider keys were not available during development.

## Deployment setup

Use a Cloudflare account with Workers/Durable Objects and authorized paid API accounts for both providers. Deployment and ongoing costs require the owner's release authorization. This repository does not provision or deploy anything automatically.

Set Worker secrets `OPENAI_API_KEY`, `GEMINI_API_KEY`, and `DEVICE_TOKEN_HASHES` using Wrangler's secret input. Never put secrets in the TOML, app HTML, Git or shell history. `DEVICE_TOKEN_HASHES` is a JSON array of SHA-256 hex digests of separately generated 32-byte URL-safe random device tokens. Give each device only its own token. Remove its hash to revoke access. The service stores only a per-token request counter and short-lived lock, not images or findings.

Review `ALLOWED_ORIGINS` against the actual hosted app origin. Android's native bridge uses `https://appassets.androidplatform.net`. Model identifiers are intentionally blank in `wrangler.toml`; set both to account-authorized model IDs and verify availability using synthetic diagrams before release. Do not silently substitute models after a failed request. Review provider data-retention terms for the selected account/tier: `store:false` disables OpenAI response application storage but is not a promise of zero provider retention. Use appropriate paid Gemini API terms; do not send original maps or names to either provider.

Deploy the Worker only after authorization, then enter its HTTPS origin and device token in Map → AI scan → Scanner connection. Native transport support must be verified separately before Android release. No provider key is entered on the phone. Default limit: 20 stages/device/day (normally 10 full scans), with one active stage per device.

## Boundary

`POST /v1/map-scans` accepts only version, stage, a flattened PNG data URL, dimensions, generic revision, and (for crosscheck) the two validated generic findings. It rejects filenames, job metadata, original names and unknown protocol fields. PNG dimensions/signature and allowed chunks are checked; metadata/text chunks are rejected. A service cannot prove that visible text was masked: the user must review the flattened preview before consenting. CORS and bearer authorization apply. Payloads and provider response bodies are not logged or persisted by this service. Cloud/provider infrastructure policies are separate from application behavior.

Symbols and connections are constrained to generic IDs, known classes, normalized coordinates, printed values and port roles. Findings cannot contain free-text equipment names. Disagreements, malformed responses and provider failures remain review states.

### PDF annotation privacy bounds

The local renderer adds every visible annotation rectangle to automatic preview masks, including appearances with empty text contents. Hiding annotations omits those rectangles so the revealed diagram can be inspected. Movable labels and annotation bounds are limited to 500 per page; exceeding the limit, or invalid annotation geometry, sets `textAvailable:false` and requires manual privacy inspection. Local overlay labels are outside the scanner canvas. Raster text and flattened labels still require careful manual review.
