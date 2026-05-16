# project tickDetectorClient
This repository contains example client implementations in multiple languages for subscribing to Zoy's Tick Detector ZeroMQ Pub/Sub service, along with message format documentation. It is a reference/documentation repo — there is no application logic of its own. The tick detector service itself lives in `../eddn_client` (tickDetector processor).

## ZeroMQ protocol
Clients connect to a ZMQ Pub/Sub endpoint and receive multipart messages: `[topic, compressed_payload]`. The topic frame is plain text (not compressed); the payload frame is zlib-compressed JSON. Decompress with `zlib.inflateSync()` (or equivalent).

- **Host:** `tcp://infomancer.uk`
- **Port:** `5551`
- **Subscribe topics:** `HeartBeat`, `SystemTick`, `GalaxyTick`, `FactionChanges`, `FactionExpandedFrom`

### Topics and approximate volumes
| Topic | Frequency | Notes |
|---|---|---|
| `HeartBeat` | Every 5 minutes | Also sent immediately on startup with `"status": "startup"` |
| `SystemTick` | ~7000/day | One per system where a BGS tick change was detected |
| `GalaxyTick` | ~1/day | The first `SystemTick` of a new tick day (must show a state change) |
| `FactionChanges` | ~50/day | Systems where a faction arrived or retreated |
| `FactionExpandedFrom` | ~20/day | Source system of a concluded faction expansion |

## message shapes
Full documented examples are in `README.md`. Key fields worth noting:

**SystemTick / GalaxyTick** — `GalaxyTick` is structurally identical to `SystemTick`; the topic itself signals it is the first tick of the day.
- `metrics.tickPass` — `"State"`, `"Inf"`, or `"Either"`. Maps to which BGS phase triggered the detection.
- `metrics.infStates` — `true` if active states in the system affect influence on the state pass (see BGS domain knowledge below).
- `metrics.BGSActivityEstimate` — `{ label, value, bars }` where `label` is `"Low"/"Medium"/"High"`, `value` is the raw signal, and `bars` (1–3) is suitable for a bar-chart UI widget.
- `metrics.allFacSwing` — sum of absolute influence changes across all factions; a proxy for overall BGS activity.
- `metrics.atRiskNNFactions` — non-native factions with influence below ~5%; each entry has `name`, `newInf`, `previousInf`, `retreatState`.
- `isColony` — whether the system is a colonisation system (post-Trailblazers expansion).

**HeartBeat** — `status` is `"startup"` or `"online"`. `lastGalaxyTick` is the timestamp of the most recent galaxy tick the server has seen.

## example clients
Clients are held under `src/` in a `language/author/` hierarchy. Each is a self-contained example with no shared code.

| Language | Author | Path |
|---|---|---|
| Node.js (ESM) | zoy | `src/node/zoy/simple.mjs` |
| Python 3 | zoy | `src/python3/zoy/simple.py` |
| PHP | cluster-fox | `src/php/cluster-fox/listener.php` |
| Java | PeregrineSilverborne | `src/java/PeregrineSilverborne/tickdetector-java/` |
| C# (.NET) | syzuna | `src/dotnet/syzuna/TickDetector/` |

The Node.js client uses `zeromq@6.0.0-beta.19` (or higher) — the `zeromq` v6 API, not the older `zeromq` v5-compatible `zeromq.native` package. The Java client uses `jeromq-0.6.0`. All clients follow the same pattern: connect, subscribe to topics, loop receiving multipart frames, decompress payload, dispatch by topic string.

## BGS domain knowledge
The tick detector monitors Elite Dangerous BGS (Background Simulation) changes. Key concepts relevant to interpreting the messages:

**The daily tick** — each populated system undergoes a state pass (conflict resolution, retreats, expansion taxes) followed by an influence pass (player activity applied). There is no fixed tick time; systems tick at different times throughout the day.

**Influence** sums to 100% across all factions in a system. The `Influence` field in raw EDDN data is a fraction (0–1). The `cmfInf` field in SystemTick is also a fraction. Non-native factions below 2.5% influence are at risk of retreat.

**`tickPass` classification** — `"State"` means only state changes were detected; `"Inf"` means only influence changes; `"Either"` means both, or that `infStates` are present (certain active states can cause influence movement on the state pass, making the two passes indistinguishable).

**`infStates`** — states that affect influence on the state pass: `Blight`, `InfrastructureFailure`, `NaturalDisaster`, `PirateAttack`, `PublicHoliday`, `Retreat`, `Terrorism`.

**Expansion tax** — when a faction concludes an expansion, ~15% influence is removed from the source system on the state pass. Detected as a large `cmfInfDrop` on a faction with `Expansion` in `RecoveringStates`; published as `FactionExpandedFrom`.

**`isColony`** — systems created via the Trailblazers colonisation mechanic. BGS behaviour may differ from established systems.

For comprehensive BGS mechanics see `resources/bgsguide.pdf` in `../eddn_client` — *The Complete Elite Dangerous Background Simulation Guide 2025 v3.0* by Cmdr Purrfect.

## topics under consideration
- `ConflictEnded` — signal when a conflict (War, CivilWar, Election) concludes, based on `RecoveringStates` containing a conflict state.
- `Stats` — periodic summary: busiest systems, messages/second, counts by topic type.

## HTTP endpoint
A proof-of-concept endpoint exists at `http://tick.infomancer.uk/galtick.json` returning the latest Galaxy Tick. Not intended for heavy polling. The longer-term plan is a Socket.IO push implementation to avoid polling entirely.

## parked issues
See [.claude/parked_issues.md](.claude/parked_issues.md) for known issues awaiting attention.

## linked projects
- `../eddn_client` — the tick detector service itself; tickDetector processor publishes the ZMQ messages documented here. Also contains BGS reference documents and deep domain knowledge in its CLAUDE.md.
- `../TDDiscordBot` — Discord bot consuming TD ZMQ messages. Consumer requirements here may drive enhancements to tick message payloads.
- `../tickWebHook` — lightweight ZMQ subscriber that posts GalaxyTick and Heartbeat events to Discord via webhooks. Includes heartbeat monitoring with ZMQ reconnect. Deployed by external users as a self-hosted client.
