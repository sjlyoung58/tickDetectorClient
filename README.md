# tickDetectorClient
Example clients & documentation for Zoy's Tick Detector

## Introduction
"The Tick" is a daily process that occurs in the "Background Simulation (BGS)" of the Frontier Developments online game Elite Dangerous. 

During the Tick process (simplified explanation), each populated system undergoes a multi-stage process in which various player inputs over the previous 24 hours are applied to calculate changes in the states and influence levels of the Factions in the System. The tick process starts with the State Pass during which changes to Faction states are applied. This is followed by the Influence Pass when new influence levels are calculated based on a combination of the states and player actions in various categories over the previous day.

For the first few years of the game, the tick process was relatively quick, completing in less than an hour. There were however latency issues, so the results of the tick took some time to become visible in game. The State Pass was very quickly followed by the Influence Pass, so for all intents and purposes attempts to see if a system had 'ticked' were based on waiting for new influence levels to be obsereved in the game (or via the EDDN network). Following the release of the Odyssey expansion on 18 May 2021 there was a huge increase in the number of stations present in the game which had a very significant impact on the duration of the tick process. One of the side effects of this was that it became possible to more easily observe discrete State Pass effects separately from Influence Pass effects. Zoy's Tick Detector looks for these state changes to indicate that the tick process has started. 

## HTTP endpoints
## ZeroMQ Pub/SubTopics
### HeartBeat
#### Example Messages
Heartbeat with status showing this is immediately following startup (or restart)
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
### SystemTick
About 7000 per day
#### Example Messages
```json
{
  "system": "Gliese 9539",
  "systemAddress": 1458309206762,
  "schema": "notYetImplemented",
  "timeGapMins": "1074.0",
  "timestamp": "2024-04-13T14:51:37Z",
  "dayCount": 1,
  "metrics": {
    "tickPass": "Inf",
    "stateChange": false,
    "infChange": true,
    "infStates": false,
    "cmfInf": 0.685885,
    "cmfHasExpanded": false,
    "cmfInfDrop": "0.0037",
    "cmfExpansionTax": false,
    "conflictEnded": false,
    "factionChanges": {
      "retreated": [],
      "arrived": []
    }
  }
}
```
A System Tick showing a retreat
```json
{
  "system": "HIP 33275",
  "systemAddress": 594609703259,
  "schema": "notYetImplemented",
  "timeGapMins": "172.3",
  "timestamp": "2024-04-13T04:22:36Z",
  "dayCount": 2,
  "metrics": {
    "tickPass": "Either",
    "stateChange": true,
    "infChange": true,
    "infStates": true,
    "cmfInf": 0.458,
    "cmfHasExpanded": false,
    "cmfInfDrop": "-0.0196",
    "cmfExpansionTax": false,
    "conflictEnded": false,
    "factionChanges": {
      "retreated": ["Xbaquitae Gold Comms Exchange"],
      "arrived": []
    }
  }
}
```
### GalaxyTick
#### Example Messages
One Galaxy Tick message is expected per day

The Galaxy Tick is just a special case of the System Tick (the first System Tick detected of the new tick process for that day), so the examples under SystemTick are valid for GalaxyTick
### FactionChanges
About 50 per day
#### Example Messages
```json
{
  "system": "Dakshmandi",
  "systemAddress": 3583923685739,
  "timestamp": "2024-04-13T02:39:33Z",
  "factionChanges": {
    "retreated": [],
    "arrived": ["Bluestar PMC"]
  }
}
```
### FactionExpandedFrom
About 20 per day
#### Example Messages
```json
{
  "system": "Shapsugabus",
  "systemAddress": 9468120868281,
  "timestamp": "2024-04-13T01:57:22Z",
  "faction": "Bluestar PMC",
  "InfDrop": "0.1383",
  "hasExpanded": true
}
```
## Topics Under Consideration
### ConflictEnded
### Stats
(the 'n' busiest systems, messages per second, message count by type )
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

