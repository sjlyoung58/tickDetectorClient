import logging

import zmq
import zlib

# Local testing
HOST = "tcp://localhost"
PORT = 5555

# live Host
# HOST = 'tcp://infomancer.uk'
# PORT = 5551;

# Define the topics to subscribe to
SUBSCRIPTIONS = [
    "GalaxyTick",
    # "SystemTick",
    "FactionChanges",
    "FactionExpandedFrom",
    "Heartbeat",
    "HeartbeatZ"
]

def run():
    # print(zlib.__version__)
    context = zmq.Context()
    sock = context.socket(zmq.SUB)

    sock.connect(f"{HOST}:{PORT}")

    logging.info(f"Subscriber connected to {HOST}:{PORT}")

    for topic in SUBSCRIPTIONS:
        sock.subscribe(topic.encode())  # Encode topic for byte stream

    while True:
        msg = sock.recv_multipart()  # Receive a single message
        topic, compressed_payload = msg
        topic_str = topic.decode()

        if topic_str == "HeartbeatZ":
            try:
                payload = zlib.decompress(compressed_payload)  # Handle DEFLATE format
                logging.info(f"HeartbeatZ: {payload.decode()}")
            except zlib.error:
                logging.error(f"Error decompressing HeartbeatZ: {compressed_payload}")
        else:
            logging.info(f"{topic_str}: {compressed_payload.decode()}")  # No decompression for other topics


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run()

