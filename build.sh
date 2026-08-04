#!/bin/bash

CONF="projects.conf"
ROOT=$(pwd)

# Build each project from projects.conf
while IFS=' ' read -r repo branch port buildpath || [ -n "$repo" ]; do
    case "$repo" in \#*|"") continue ;; esac
    case "$port" in -|"") continue ;; esac  # skip JS-only projects, no build needed
    buildpath=${buildpath:-.}    # default to . if not specified
    prefix=$(basename "$repo")
    echo "Building $prefix..."
    cd "$ROOT/projects/$prefix"
    go build -o "$prefix" "$buildpath"
    if [ $? -eq 0 ]; then
        echo "✅ $prefix built successfully"
    else
        echo "❌ Failed to build $prefix"
        exit 1
    fi
done < "$ROOT/$CONF"

# Build the proxy server
echo "Building proxy..."
cd "$ROOT/proxy"
go build -o proxy .
if [ $? -eq 0 ]; then
    echo "✅ Proxy server built successfully"
else
    echo "❌ Failed to build proxy server"
    exit 1
fi