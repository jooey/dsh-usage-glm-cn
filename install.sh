#!/usr/bin/env sh
# install.sh — Add dsh-usage-glm-cn to the DSH web profile
set -e

PROFILE_DIR="${DSH_PROFILE_DIR:-$HOME/.dsh/profiles}"

if [ ! -d "$PROFILE_DIR" ]; then
  echo "Error: DSH profile directory not found at $PROFILE_DIR"
  echo "Set DSH_PROFILE_DIR to your profile directory and try again."
  exit 1
fi

cd "$PROFILE_DIR"
npm install dsh-usage-glm-cn --save --registry=https://registry.npmjs.org
echo ""
echo "Installed. Add the following entry to cordis.patch.yml:"
echo ""
echo "  - type: insert"
echo "    plugin: dsh-usage-glm-cn"
echo "    id: glm-cn-usage"
echo ""
echo "Then restart DSH or reload the profile."
