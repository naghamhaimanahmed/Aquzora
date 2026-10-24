#!/usr/bin/env bash
# Downloads every photo the site uses from Unsplash into assets/img/,
# so the site works offline and inside pages that block outside images.
# Run from the project folder:  bash download-images.sh
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p assets/img
grep -oE 'photo\("[0-9a-f-]+", "[a-z0-9-]+"(, [0-9]+)?\)' assets/js/data.js | while read -r line; do
  id=$(echo "$line" | sed -E 's/photo\("([^"]+)".*/\1/')
  name=$(echo "$line" | sed -E 's/photo\("[^"]+", "([^"]+)".*/\1/')
  w=$(echo "$line" | grep -oE ', [0-9]+\)' | grep -oE '[0-9]+' || echo 900)
  out="assets/img/$name.jpg"
  if [ -s "$out" ]; then echo "have  $out"; continue; fi
  if curl -fsSL "https://images.unsplash.com/photo-$id?auto=format&fit=crop&w=$w&q=78&fm=jpg" -o "$out"; then
    echo "saved $out"
  else
    rm -f "$out"; echo "FAILED $name (photo-$id)" >&2
  fi
done
