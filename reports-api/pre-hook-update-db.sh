#! /bin/sh
cd /opt/app-root
echo 'starting upgrade'
export FLASK_APP=manage.py
flask db upgrade
