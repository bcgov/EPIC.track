#!/bin/bash

set -euo pipefail


# Notes: 
# 1 If you are already forwarding the needed port, it will freak out, you can run 
#   sudo kill -9 $(sudo lsof -t -i :15432)
#   to kill whatever is using that port.
# 2 There might look like there is a lot of drop errors, this is because
#   ps_restore tries to overwrite existing data. We want to do the hard dump for a
#   cleaner test refresh.

if ! oc whoami &> /dev/null; then
    echo "Need to login to OC"
    exit 1
fi
echo "OpenShift connection verified."


pg_isready -h localhost -p 5432 -U postgres >/dev/null
if [ $? -ne 0 ]; then
  echo "You need to have a local Postgres instance running on port ${LOCAL_DB_PORT}"
  exit 1
fi
echo "Local Postgres connection verified."

oc project c72cba-test

echo "Port-forwarding database pod..."
POD_NAME="patroni-epictrack-db-0"
LOCAL_PF_PORT=15432
LOCAL_DB_PORT=8432 # Change if your local DB is using a different port
REMOTE_PORT=5432

oc port-forward "$POD_NAME" ${LOCAL_PF_PORT}:${REMOTE_PORT} &
PF_PID=$!
sleep 5

echo "Fetching DB credentials..."
TEST_USER=$(oc get secret patroni-epictrack-db -o jsonpath='{.data.superuser-username}' | base64 -d)
TEST_PW=$(oc get secret patroni-epictrack-db -o jsonpath='{.data.superuser-password}' | base64 -d)

DUMPFILENAME="db_dump_$(date +%Y%m%d_%H%M%S).sqlc"
echo "Dump filename: $DUMPFILENAME"

export PGPASSWORD="$TEST_PW"

echo "Dumping database..."
pg_dump -h localhost -p $LOCAL_PF_PORT -U "$TEST_USER" -d app -F c -f ~/"$DUMPFILENAME"

echo "Cleaning up port-forward..."
kill $PF_PID
unset TEST_PW
unset PGPASSWORD

echo "Database dump complete: ~/$DUMPFILENAME"

# Now local

export PGPASSWORD="postgres"

psql  -U postgres -p $LOCAL_DB_PORT -h localhost -d postgres -c "CREATE ROLE app;CREATE ROLE demo" || true
pg_restore -h localhost -U postgres -p $LOCAL_DB_PORT -d postgres -c ~/"$DUMPFILENAME"

# Cleanup
unset TEST_PW
unset PGPASSWORD
