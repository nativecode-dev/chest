#!/bin/bash

YARN=`which yarn`

cd specs/data/single
$YARN install

cd ../workspaces
$YARN install

cd ../workspaces-lerna
$YARN install

cd ..
