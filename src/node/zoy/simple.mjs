import zmq from 'zeromq'; // note needs npm install zeromq@6.0.0-beta.19 (or higher)
import { inflateSync, unzipSync, gunzipSync } from 'zlib';

var sock;

// VPS Host
// const host = 'tcp://infomancer.uk'
// const port = 5551;

// Local testing
const host = 'tcp://localhost'
//const host = 'tcp://192.168.1.137'
const port = 5555;

const zmqURL = `${host}:${port}`;

async function run() {
  sock = new zmq.Subscriber;

 sock.connect(`${zmqURL}`);

  // Galaxy Tick - one per day usually
  sock.subscribe('GalaxyTick');
  
  // System Tick - every detected system change, ~7k per day
  sock.subscribe('SystemTick');

  // FactionChanges - factions arriving in and/or retreating from a System ~50 per day
  sock.subscribe('FactionChanges');
  
  // FactionExpanded - report of the System a faction expanded from
  sock.subscribe('FactionExpandedFrom');
  
  sock.subscribe('Heartbeat'); // every 5 minutes

  console.log(`Subscriber connected to ${zmqURL}`);

  for await (const [topic, msg] of sock) {
    const sTopic = topic.toString();
    const payload = msg;
    switch (sTopic) {
      // case 'GalaxyTick':
      //   processGalaxytick(payload);
      //   break;
      case 'SystemTick':
        processSystemTick(payload);
        break;
      // case 'FactionChanges':
      //   processFactionChanges(payload);
      //   break;
      // case 'FactionExpandedFrom':
      //   processFactionExpandedFrom(payload);
      //   break;
      case 'Heartbeat':
        processHeartbeat(payload);
        break;
      case 'HeartbeatZ':
        processHeartbeatZ(payload);
        break;
      default:
        console.log(`Unhandled topic: ${sTopic}`);
        break;
    };
  };
};

run();

function processFactionChanges(payload) { console.log(`FactionChanges: ${payload}`) };
function processFactionExpandedFrom(payload) { console.log(`FactionExpandedFrom: ${payload}`) };
function processGalaxytick(payload) { console.log(`Galaxytick: ${payload}`) };
function processSystemTick(payload) { console.log(`SystemTick: ${payload}`) };
function processHeartbeat(payload) { console.log(`Heartbeat: ${payload}`) };
// function processHeartbeatZ(payload) { console.log(`HeartbeatZ: ${inflateSync(payload)}`) };
function processHeartbeatZ(payload) { 
  console.log(`inflate HeartbeatZ: ${inflateSync(payload)}`);
  console.log(`unzip HeartbeatZ: ${unzipSync(payload)}`);
 };


process.on('SIGINT', () => {
  sock.close();
  console.log("Subscriber shutting down...");
});
