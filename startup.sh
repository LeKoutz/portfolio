#!/bin/bash

# Start ascii-art project
cd projects/ascii-art-web
PORT=8082 ./ascii-art &
if [ $? -eq 0 ]; then
    echo "Ascii-art started successfully"
else
    echo "Failed to start ascii-art"
fi

# Start groupie-tracker project
cd ../../projects/groupie-tracker
PORT=8083 ./groupie-tracker &
if [ $? -eq 0 ]; then
    echo "Groupie-tracker started successfully"
else
    echo "Failed to start groupie-tracker"
fi

# Start the proxy server
cd ../../proxy
PORT=$PORT ./proxy