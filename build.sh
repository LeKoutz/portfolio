#!/bin/bash

# Build ascii-art project
cd projects/ascii-art-web
go build -o ascii-art main.go
# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "Ascii-art built successfully"
else
    echo "Failed to build ascii-art"
fi

# Build groupie-tracker project
cd ../../projects/groupie-tracker
go build -o groupie-tracker main.go
if [ $? -eq 0 ]; then
    echo "Groupie-tracker built successfully"
else
    echo "Failed to build groupie-tracker"
fi

# Build the proxy server
cd ../../proxy
go build -o proxy main.go
if [ $? -eq 0 ]; then
    echo "Proxy server built successfully"
else
    echo "Failed to build proxy server"
fi