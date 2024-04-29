import zmq from 'zeromq'; // note needs npm install zeromq@6.0.0-beta.19 (or higher)

var sock;

// VPS Host
const host = 'tcp://infomancer.uk'
const port = 5551;

// Local testing
// const host = 'tcp://localhost'
// const port = 5556;

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
    const payload = msg.toString();
    console.log(`${sTopic}: ${payload}`);
  }
}

run();

process.on('SIGINT', () => {
  sock.close();
  console.log("Subscriber shutting down...");
});
