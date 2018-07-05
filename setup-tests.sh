#!/bin/bash

YARN=`which yarn`

cd specs/data/single
$YARN

cd ../workspaces
$YARN

cd ..
