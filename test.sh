#!/bin/bash

# major e11315cbbdfc3b6f344f7a71d7264cd9616f45a8
# minor f635a6158726d37b4a3fd18c6968a55d3ca330bc

DIFF_FILE_NAMES=$(git diff --name-only 15acff35b628a48e9380cc734bf6d5e8066a44ab e11315cbbdfc3b6f344f7a71d7264cd9616f45a8)

# Use grep to extract numbers and assign them to variables
DIFF_STATS=$(git diff --shortstat 15acff35b628a48e9380cc734bf6d5e8066a44ab e11315cbbdfc3b6f344f7a71d7264cd9616f45a8)
NO_FILES_CHANGED=$(echo $DIFF_STATS | grep -oE '[0-9]+' | head -1)
NO_LINES_CHANGED=$(echo $DIFF_STATS | grep -oE '[0-9]+' | tail -n+2 | paste -sd+ - | bc)

if [[ $DIFF_FILE_NAMES =~ "pyproject.toml" ]] || [[ $DIFF_FILE_NAMES =~ "poetry.lock" ]]
then
    echo "we got a major change"
elif [[ $NO_FILES_CHANGED -gt 5 ]] || [[ $NO_LINES_CHANGED -gt 100 ]]
then
    echo "we got a minor change"
else
    echo "we got a patch change"
fi

