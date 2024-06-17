import logging

import zmq
import zlib

# Local testing
# HOST = "tcp://localhost"
# PORT = 5555

# live Host
HOST = 'tcp://infomancer.uk'
PORT = 5551;

# Define the topics to subscribe to
SUBSCRIPTIONS = [
    "GalaxyTick",
    "SystemTick",
    "FactionChanges",
    "FactionExpandedFrom",
    "Heartbeat"
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
        payload = zlib.decompress(compressed_payload).decode()
        logging.info(f"{topic_str}: {payload}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run()

