#!/system/bin/sh
# Magisk action button: show what the loader did in the last game start.
MODDIR=${0%/*}
[ -f "$MODDIR/blocked" ] && echo "Not active: $(cat "$MODDIR/blocked")"
r=/data/data/com.hg.titanquestultimate/files/bootstrap-status.json
if [ -f "$r" ]; then
 echo "Last game start:"; sed -n 's/^{[^{}]*"status":"\([^"]*\)".*/  status: \1/p' "$r"
 grep -o '"error":"[^"]*"' "$r" | head -1 | sed 's/"error":/  error: /'
else echo "The game has not been started with the loader yet."; fi
echo "Open the Titan Quest Mods app to choose a mod."
