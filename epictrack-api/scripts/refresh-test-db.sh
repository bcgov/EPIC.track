#!/bin/bash

set -euo pipefail


# Notes: 
# 1 If you are already forwarding the needed port, it will freak out, you can run 
#   sudo kill -9 $(sudo lsof -t -i :15432)
#   to kill whatever is using that port.
# 2 There might look like there is a lot of drop errors, this is because
#   ps_restore tries to overwrite existing data. We want to do the hard dump for a
#   cleaner test refresh.

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
unset PROD_PW
unset PGPASSWORD

echo "Database dump complete: ~/$DUMPFILENAME"



# Step 9: Switch to Test Environment
oc project c72cba-test
# Step 10: Start port-forwarding test DB
oc port-forward "$POD_NAME" ${LOCAL_PORT}:${REMOTE_PORT} &
PF_PID=$!
sleep 3 # Give it a moment to wait for connection

# Step 11: get DB credentials (test different than prod)
echo "Fetching test DB creds.."
TEST_USER=$(oc get secret patroni-epictrack-db -o jsonpath='{.data.superuser-username}' | base64 -d)
TEST_PW=$(oc get secret patroni-epictrack-db -o jsonpath='{.data.superuser-password}' | base64 -d)

export PGPASSWORD="$TEST_PW"

# Step 12: Drop all tables in test and restore dump to test
echo "Dropping Tables & restoring data"

if oc project | grep test ; then
    echo "Confirm we are on c72cba-test :(y/n)"
    read confirmed
    if [ $confirmed == "y" ]; then
        echo "Dropping test Database"
        psql -U "$TEST_USER" -p $LOCAL_PORT -h localhost -d app -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'app' AND pid <> pg_backend_pid();"
        sleep 1
        psql -U "$TEST_USER" -p $LOCAL_PORT -h localhost -d postgres -c "DROP DATABASE app;"
        echo "restoring database from $DUMPFILENAME"
        psql  -U "$TEST_USER" -p $LOCAL_PORT -h localhost -d postgres -c "CREATE DATABASE app;" || true
        psql  -U "$TEST_USER" -p $LOCAL_PORT -h localhost -d app -c "CREATE ROLE app;" || true
        pg_restore -h localhost -U "$TEST_USER" -p $LOCAL_PORT -d app -c ~/"$DUMPFILENAME"
    fi
fi

# Cleanup
unset TEST_PW
unset PGPASSWORD
kill $PF_PID
