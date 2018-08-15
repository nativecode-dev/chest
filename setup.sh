#!/bin/sh -

BRANCH="$TRAVIS_BRANCH"
YARN=`which yarn`

while test $# -gt 0
do
  case "$1" in
    doc)    echo "Generating documentation"
        typedoc --mode modules --out ./doc ./packages/*/src/
      ;;
    build)  echo "Preparing build"
        $YARN install
        cd specs/data/single && $YARN install
        cd ../workspaces && $YARN install
        cd ../workspaces-lerna && $YARN install
      ;;
    git)    echo "Configuring Git options"
        git config --global user.email "opensource+nofrills@nativecode.com"
        git config --global user.name "Native Open Source"
        git config --global push.default simple
      ;;
    ssh)    echo "Configuring SSH credentials"
        set-up-ssh --key $encrypted_7baae619033b_key --iv $encrypted_7baae619033b_iv --path-encrypted-key deploy.enc
      ;;
  esac
  shift
done

exit 0
