#!/bin/bash

set -euo pipefail

# Step 1: Check OC Login
if ! oc whoami &> /dev/null; then
    echo "Need to login to OC"
    exit 1
fi
echo "Logged into OpenShift"

# Step 2: Switch to prod project
echo "Switching to project c72cba-prod..."
oc project c72cba-prod

# Step 3: Start port-forwarding in the background
echo "Port-forwarding database pod..."
POD_NAME="patroni-epictrack-db-0"
LOCAL_PORT=15432
REMOTE_PORT=5432

# Start port-forward in background and save PID to kill later
oc port-forward "$POD_NAME" ${LOCAL_PORT}:${REMOTE_PORT} &
PF_PID=$!
sleep 3  # Give it a moment to establish connection

# Step 4: Get credentials
echo "Fetching DB credentials..."
PROD_USER=$(oc get secret patroni-epictrack-db -o jsonpath='{.data.superuser-username}' | base64 -d)
PROD_PW=$(oc get secret patroni-epictrack-db -o jsonpath='{.data.superuser-password}' | base64 -d)

# Step 5: Create dump filename
DUMPFILENAME="db_dump_$(date +%Y%m%d_%H%M%S).sqlc"
echo "Dump filename: $DUMPFILENAME"

# Step 6: Export password so pg_dump can use it
export PGPASSWORD="$PROD_PW"

# Step 7: Dump the database
echo "Dumping database..."
pg_dump -h localhost -p $LOCAL_PORT -U "$PROD_USER" -d app -F c -f ~/"$DUMPFILENAME"

# Step 8: Cleanup
echo "Cleaning up port-forward..."
kill $PF_PID

echo "Database dump complete: ~/$DUMPFILENAME"

