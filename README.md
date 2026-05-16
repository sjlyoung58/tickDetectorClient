# tickDetectorClient
Example clients & documentation for Zoy's Tick Detector

## Introduction
"The Tick" is a daily process that occurs in the "Background Simulation (BGS)" of the Frontier Developments online game Elite Dangerous. 

During the Tick process (simplified explanation), each populated system undergoes a multi-stage process in which various player inputs over the previous 24 hours are applied to calculate changes in the states and influence levels of the Factions in the System. The tick process starts with the State Pass during which changes to Faction states are applied. This is followed by the Influence Pass when new influence levels are calculated based on a combination of the states and player actions in various categories over the previous day.

For the first few years of the game, the tick process was relatively quick, completing in less than an hour. There were however latency issues, so the results of the tick took some time to become visible in game. The State Pass was very quickly followed by the Influence Pass, so for all intents and purposes attempts to see if a system had 'ticked' were based on waiting for new influence levels to be obsereved in the game (or via the EDDN network). Following the release of the Odyssey expansion on 18 May 2021 there was a huge increase in the number of stations present in the game which had a very significant impact on the duration of the tick process. One of the side effects of this was that it became possible to more easily observe discrete State Pass effects separately from Influence Pass effects. Zoy's Tick Detector looks for these state changes to indicate that the tick process has started. 

## ZeroMQ Pub/Sub Topics 
### Connection Details
- ZeroMQ Pub/Sub with a multipart message (Topic/Payload). Topic is not compressed, Payload *is* compressed with Zlib
- host 'tcp://infomancer.uk' 
- port 5551
- example clients are provided in this project
### Example Messages
#### Topic: HeartBeat
Heartbeat with status `startup` showing this is immediately following startup (or restart)
```json
{"status": "startup",
"timestamp": "2024-04-11T09:32:49.171Z",
"lastGalaxyTick": "2024-04-10T22:35:01.000Z",
"version": "0.1.2-alpha-td",
"info": "topics and message contents subject to change"}
```
Standard Heartbeat (every 5 minutes)
```json
{"status": "online",
"timestamp": "2024-03-29T13:02:32.422Z",
"lastGalaxyTick": "2024-03-28T23:22:19Z",
"version": "0.1.1-alpha",
"info": "topics and message contents subject to change"}
```
#### Topic: SystemTick
About 7000 per day
```json
{
  "system": "Gliese 9539",
  "systemAddress": 1458309206762,
  "schema": "notYetImplemented",
  "timeGapMins": "1074.0",
  "timestamp": "2024-04-13T14:51:37Z", 
  "dayCount": 1,
  "isColony": false,
  "metrics": {
    "tickPass": "Inf",
    "stateChange": false,
    "infChange": true,
    "infStates": false,
    "cmfInf": 0.685885,
    "cmfName": "Gliese 9539 Gold Natural Industries",
    "cmfHasExpanded": false,
    "cmfInfDrop": "0.0037",
    "cmfExpansionTax": false,
    "conflictEnded": false,
    "factionChanges": {
      "retreated": [],
      "arrived": []
    },
    "atRiskNNFactions": [],
    "facCount": 7,
    "population": 1200000000,
    "allFacSwing": 0.01275,
    "BGSActivityEstimate": { "label": "Medium", "value": 0.083, "bars": 2 },
    "activeConflictCount": 0,
    "lockedInf": 0
  }
}
```
A System Tick showing a retreat and an at-risk faction
```json
{
  "system": "HIP 33275",
  "systemAddress": 594609703259,
  "schema": "notYetImplemented",
  "timeGapMins": "172.3",
  "timestamp": "2024-04-13T04:22:36Z",
  "dayCount": 2,
  "isColony": true,
  "metrics": {
    "tickPass": "Either",
    "stateChange": true,
    "infChange": true,
    "infStates": true,
    "cmfInf": 0.458,
    "cmfName": "HIP 33275 Co",
    "cmfHasExpanded": false,
    "cmfInfDrop": "-0.0196",
    "cmfExpansionTax": false,
    "conflictEnded": false,
    "factionChanges": {
      "retreated": ["Xbaquitae Gold Comms Exchange"],
      "arrived": []
    },
    "atRiskNNFactions": [
      { "name": "Xbaquitae Gold Comms Exchange", "newInf": 0.032, "previousInf": 0.058, "retreatState": "Active" }
    ],
    "facCount": 5,
    "population": 500000,
    "allFacSwing": 0.097,
    "BGSActivityEstimate": { "label": "Medium", "value": 0.102, "bars": 2 },
    "activeConflictCount": 0,
    "lockedInf": 0
  }
}
```
A System Tick showing an active conflict (1 conflict, 2 factions locked, 13.5% of system INF unavailable)
```json
{
  "system": "Wolf 497",
  "systemAddress": "9467047650729",
  "schema": "notYetImplemented",
  "timeGapMins": "1174.4",
  "timestamp": "2026-05-16T14:18:49Z",
  "dayCount": 3,
  "isColony": false,
  "metrics": {
    "tickPass": "Either",
    "stateChange": true,
    "infChange": true,
    "infStates": true,
    "cmfInf": 0.661323,
    "cmfName": "Alchemy Den",
    "cmfHasExpanded": false,
    "cmfInfDrop": -0.0154,
    "cmfExpansionTax": false,
    "conflictEnded": false,
    "factionChanges": { "retreated": [], "arrived": [] },
    "atRiskNNFactions": [],
    "facCount": 7,
    "population": 1927340,
    "allFacSwing": 0.01921,
    "BGSActivityEstimate": { "label": "Low", "value": 0.04551, "bars": 1 },
    "activeConflictCount": 1,
    "lockedInf": 0.13527
  }
}
```
#### Topic: GalaxyTick
One Galaxy Tick message is expected per day

The Galaxy Tick is just a special case of the System Tick i.e. the first System Tick detected (showing a state change) of the new tick process for that day, so the examples under SystemTick are valid for GalaxyTick
#### Topic: FactionChanges
About 50 per day
```json
{
  "system": "Dakshmandi",
  "systemAddress": 3583923685739,
  "isColony": false,
  "timestamp": "2024-04-13T02:39:33Z",
  "factionChanges": {
    "retreated": [],
    "arrived": ["Bluestar PMC"]
  }
}
```
#### Topic: FactionExpandedFrom
About 20 per day
```json
{
  "system": "Shapsugabus",
  "systemAddress": 9468120868281,
  "isColony": false,
  "timestamp": "2024-04-13T01:57:22Z",
  "faction": "Bluestar PMC",
  "InfDrop": "0.1383",
  "hasExpanded": true
}
```
## Topics Under Consideration
### Topic: ConflictEnded
### Topic: Stats
(the 'n' busiest systems, messages per second, message count by type )
## HTTP endpoints
Currently the server only supports HTTP, not HTTPS (until I find time to configure my Docker nginx container with LetsEncrypt certs)
There is currently one proof of concept http endpoint (for the latest Galaxy Tick) http://tick.infomancer.uk/galtick.json

*I WOULD PREFER THIS NOT TO BE POLLED UNTIL I HAVE HAD A CHANCE TO LOAD TEST MULTIPLE CLIENTS 'POLLING' THE URL (and see below)*

My intention is to replace this with a [Socket IO](https://socket.io/) implementation so changes are pushed to clients removing the need for polling completely
## Project Structure
The example clients are held in the following hierarchical structure under the project's top level `src` directory...
```
src
    nodejs
            author
                    client1
                    client2
    python
            author
                    client1
...etc.
```

## Glossary

**activeConflictCount** — number of active conflicts in the system at the time of the tick. Calculated as the number of factions with `War`, `CivilWar`, or `Election` in `ActiveStates`, divided by 2 (conflicts are always between pairs). Locked factions = `activeConflictCount * 2`. See also *lockedInf*.

**Active States** — faction states currently in effect, such as Boom, Bust, Expansion, War, etc. The tick detector CRCs active states to detect BGS changes. See also *Pending States*, *Recovering States*.

**allFacSwing** — sum of the absolute influence changes across all factions in a system for the tick. A proxy for overall BGS activity level that day. Used to compute *BGSActivityEstimate*.

**Asset** — something a faction owns: a space station, planetary port, Odyssey settlement, installation, or megaship. Only factions with assets can enter conflicts for control of a system.

**atRiskNNFactions** — non-native factions in the system whose influence is low enough that retreat is a near-term risk (roughly below 5%). Each entry in the array carries `name`, `newInf`, `previousInf`, and `retreatState`.

**BGS (Background Simulation)** — the game system that governs faction influence, system states, market prices, and NPC behaviour in populated systems. Every action players take in a populated system affects the BGS.

**BGSActivityEstimate** — a derived estimate of Commander activity in the system, expressed as `{ label, value, bars }`. `label` is `"Low"`, `"Medium"`, or `"High"`. `bars` (0–5) is suitable for a bar-chart widget. Calculated from *allFacSwing* relative to population.

**Bucket model** — BGS influence is driven by four activity buckets: trade, exploration, combat, and missions. Each has logarithmic diminishing returns. Filling multiple buckets is more efficient than maximising one. The four buckets are the main levers Commanders use to shift faction influence.

**Civil War** — a conflict between two factions that share the same home system, which would otherwise go to war. Mechanically identical to a War. Detected as `conflictEnded` in tick data when `RecoveringStates` contains `CivilWar`.

**cmfInf** — the influence level (as a fraction 0–1) of the *Controlling Minor Faction* (the faction with the most influence in the system) at the time of the tick.

**cmfInfDrop** — the change in influence for the controlling faction since the previous tick observation. A large negative value on a faction with `Expansion` in `RecoveringStates` indicates an *expansion tax*.

**Conflict** — a locked contest between two factions that occurs when their influence levels converge and both have assets. Conflicts are either Wars or Elections depending on government ethos. During a conflict, only the combat bucket (for Wars) or election missions/trade (for Elections) affects the outcome. Influence is locked for both factions while the conflict runs.

**Conflict Resolution** — the first phase of the daily tick. Combat effort is tallied, winning days are awarded, and if a conflict concludes, spoils are distributed.

**Controlling faction** — the faction with the highest influence in a system; owns the controlling asset (the main station or port). The controlling faction benefits from trade, exploration, combat, and missions as influence levers.

**Coup** — triggered automatically when a non-controlling faction reaches 60% influence. Forces a mandatory War with the controlling faction.

**Daily tick** — the BGS's daily processing cycle. Runs in three phases in sequence: (1) *Conflict Resolution*, (2) *State Resolution*, (3) *Effort Distribution*. There is no single tick time; systems tick at different times throughout the day. Tick Detector refers to passes, and recognises 'State Pass' (1)&(2), and 'Inf Pass' (3). (1) and (2) are calculated quickly so are rarely seen separately in EDDN messages. (3), the Inf pass takes significant time to process, often several hours. Tick Detector sometimes declares the pass as 'Either'. This is when Inf altering states are present, so any observed change in Inf cannot be guaranteed to have occurred in (2) or (3).

**EDDN (Elite Dangerous Data Network)** — a community-run message relay through which third-party tools such as EDMC publish journal events from players' games. The tick detector consumes EDDN `FSDJump`, `Location` and `Carrier Jump` messages to detect BGS changes.

**Effort Distribution** — the third phase of the daily tick. Commander activity (trade, exploration, combat, missions) accumulated since the last tick is applied to faction influence levels.

**Election** — a conflict between two factions with matching "social" or "corporation" government ethos. Won by completing non-combat election missions and trade activity rather than combat zones. Mechanically similar to a War in duration and spoils.

**Expansion** — a global state triggered when a faction exceeds 75% influence in a system. After 10–14 days the faction expands into a nearby system. Expansion is the last remaining global state (it affects all systems the faction is present in). Triggers the *expansion tax* on conclusion.

**Expansion tax** — approximately 15% influence removed from the expansion source system on the *State Resolution* phase when an expansion concludes. Detected by the tick detector as a large `cmfInfDrop` on a faction with `Expansion` in `RecoveringStates`; published as the `FactionExpandedFrom` topic.

**Faction** — an in-game political entity present in one or more systems. Each faction has an influence level in every system it occupies. Factions are either Player Minor Factions (PMFs) or NPC factions. See also *Native faction*, *Non-native faction*.

**FSDJump / Location / CarrierJump** — the primary EDDN message types that carry BGS data. They contain a `Factions` array with per-faction `Influence`, `ActiveStates`, `PendingStates`, and `RecoveringStates`. The tick detector processes these to detect changes.

**Galaxy Tick** — the first *System Tick* of a new daily tick cycle that shows a state change. Published on the `GalaxyTick` topic. Structurally identical to a SystemTick message; the topic name alone signals its significance. Approximately one per day.

**Government Ethos** — the broad category of government type that determines whether two factions fight a War or an Election when they conflict. Criminals and Autocrats → War; Corporations vs Corporations → Election; Social vs Social → Election; others → War.

**Influence** — a faction's share of political power in a system, summing to 100% across all factions. Represented as a fraction (0–1) in EDDN data and in tick message fields. Below 2.5% triggers *Retreat* for non-native factions; above 75% triggers *Expansion*.

**infChange** — boolean in SystemTick metrics; `true` if influence values changed between the stored EDDN message and the new one, indicating the *Effort Distribution* phase has run, or Inf altering states were applied in the State pass.

**infStates** — boolean in SystemTick metrics; `true` if any faction in the system has an active state that can move influence on the *State Resolution* phase: Blight, InfrastructureFailure, NaturalDisaster, PirateAttack, PublicHoliday, Retreat, or Terrorism. When `true`, `tickPass` will be `"Either"` rather than `"Inf"` because the two phases cannot be cleanly distinguished.

**isColony** — boolean; `true` if the system was created via the Trailblazers colonisation mechanic (post-2024 update). BGS behaviour in colony systems may differ from established systems.

**lockedInf** — sum of influence (as a fraction 0–1) held by factions currently in active conflicts. Represents how much of the system's influence is unavailable for normal BGS manipulation while those conflicts run. E.g. `0.13527` means ~13.5% of system INF is locked. See also *activeConflictCount*.

**Native faction** — a faction in its home system. Native factions cannot retreat from their home system regardless of influence level. The tick detector uses database table `dta_faction.home_system_id` to determine if native, with a fast-path heuristic: if the faction name contains the system name, assume native.

**Non-native faction (NNF)** — a faction present in a system other than its home system, having arrived via expansion. Subject to retreat if influence falls below 2.5%. See *atRiskNNFactions*.

**Pending States** — states that will become active after the next tick. Not currently used by the tick detector.

**PMF (Player Minor Faction)** — an in-game faction associated with a player squadron. Mechanically identical to NPC factions; the distinction is that PMFs are actively managed by players. In some cases, player groups have also 'adopted' NPC factions.

**Recovering States** — states a faction is exiting. Used by the tick detector to detect expansion tax (`Expansion` in `RecoveringStates`) and conflict conclusion (`War`, `CivilWar`, or `Election` in `RecoveringStates`).

**Retreat** — a state entered by a *non-native* faction when its influence falls below 2.5%. After approximately 7 active days below 2.5%, the faction leaves the system permanently. Published as part of `factionChanges.retreated` in SystemTick and as a standalone `FactionChanges` topic message.

**stateChange** — boolean in SystemTick metrics; `true` if `ActiveStates` changed between the stored EDDN message and the new one, indicating the *State Resolution* phase has run.

**State Resolution** — the second phase of the daily tick. Faction states are introduced or concluded; retreats are processed; expansion tax is applied.

**System Tick** — a detected BGS change in a single system. Published on the `SystemTick` topic. About 7000 per day across the galaxy. Contains `metrics` with influence and state change details for the system.

**SystemAddress** — a unique 64-bit integer identifying a star system in Elite Dangerous. Used as the primary key for system data in EDDN messages and tick detector storage.

**tickPass** — classification of which BGS phase(s) triggered the detected change. `"State"` = only state changes seen; `"Inf"` = only influence changes seen; `"Either"` = both, or *infStates* are present making the two phases indistinguishable.

**timeGapMins** — elapsed time in minutes between the EDDN message that last updated the stored system data and the new message that triggered the tick detection. A proxy for how long ago the system was last observed.

**War** — a conflict between factions with differing government ethos (or anarchies). Won by completing the most combat zones (CZs) each day over 4–7 days. The losing faction's staked asset transfers to the winner. The `conflictEnded` flag in tick data fires when `RecoveringStates` contains `War`.

**Weekly server tick** — Frontier Developments' weekly server maintenance, every Thursday at 07:00 UTC. Updates PowerPlay 2.0 states and brings new colonised stations online. Has no effect on BGS faction influence or the daily tick. Entirely separate from the BGS daily tick.

