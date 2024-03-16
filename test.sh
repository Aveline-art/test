#!/bin/bash

# major e11315cbbdfc3b6f344f7a71d7264cd9616f45a8
# minor f635a6158726d37b4a3fd18c6968a55d3ca330bc

DIFF_FILES=$(git diff --name-only 15acff35b628a48e9380cc734bf6d5e8066a44ab f635a6158726d37b4a3fd18c6968a55d3ca330bc)

if [[ $DIFF_FILES =~ "pyproject.toml" ]] || [[ $DIFF_FILES =~ "poetry.lock" ]]
then
    echo "we got a major change"
else
    echo "we got a patch or minor change"
fi
