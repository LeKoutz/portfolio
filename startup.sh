#!/bin/bash

CONF="projects.conf"
ROOT=$(pwd)

# Start each project from projects.conf
while IFS=' ' read -r repo branch port || [ -n "$repo" ]; do
    case "$repo" in \#*|"") continue ;; esac
    case "$port" in -|"") continue ;; esac  # skip JS-only projects
    prefix=$(basename "$repo")
    echo "Starting $prefix on port $port..."
    cd "$ROOT/projects/$prefix"
    PORT=$port ./$prefix &
    if [ $? -eq 0 ]; then
        echo "✅ $prefix started successfully"
    else
        echo "❌ Failed to start $prefix"
        exit 1
    fi
done < "$ROOT/$CONF"

# Start the proxy server
echo "Starting proxy..."
cd "$ROOT/proxy"
./proxy