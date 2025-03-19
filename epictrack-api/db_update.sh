#!/bin/bash

if [[ -z "$VIRTUAL_ENV" ]]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "Virtual environment already active."
fi
export PYTHONPATH=$PWD/src/
echo "PYTHONPATH set to: $PYTHONPATH"
flask db upgrade

