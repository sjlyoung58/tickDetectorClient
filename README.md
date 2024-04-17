# tickDetectorClient
Example clients & documentation for Zoy's Tick Detector

## Introduction
"The Tick" is a daily process that occurs in the "Background Simulation (BGS)" of the Frontier Developments online game Elite Dangerous. 

During the Tick process, each populated system undergoes a multi-stage process in which various player inputs over the previous 24 hours are applied to calculate changes in the states and influence levels of the Factions in the System. The tick process starts with the State Pass during which changes to Faction states are applied. This is followed by the Influence Pass when new influence levels are calculated based on a combination of the states and player actions in various categories over the previous day.

For the first few years of the game, the tick process was relatively quick, completing in less than an hour. There were however latency issues, so the results of the tick took some time to become visible in game. The State Pass was very quickly followed by the Influence Pass, so for all intents and purposes attempts to see if a system had 'ticked' were based on waiting for new influence levels to be obsereved in the game (or via the EDDN network). Following the release of the Odyssey expansion in 20?? there was a huge increase in the number of stations present in the game which had a very significant impact on the duration of the tick process. One of the side effects of this was that it became possible to observe discrete State Pass effects separately from Influence Pass effects. Zoy's Tick Detector looks for these state changes to indicate that the tick process has started. 

## HTTP endpoints
## ZeroMQ Pub/SubTopics
### HeartBeat
### GalaxyTick
### SystemTick
### FactionChanges
### FactionExpandedFrom
## Topics Under Consideration
### ConflictEnded
### Stats
(n busiest systems, messages per second, message count by type )
## Project Structure
The example clients are held in the following hierarchical structure under the project's top level `src` directory...
```
src                 // top level
    nodejs
            author
                    client1
                    client2
    python
            author
                    client1
...etc.
```

