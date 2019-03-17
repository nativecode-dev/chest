#!/bin/bash

YARN=`which yarn`

cd testables/single
$YARN

cd ../workspaces
$YARN

cd ..
