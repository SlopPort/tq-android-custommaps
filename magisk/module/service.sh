#!/system/bin/sh
# tq_mods: injects the mod loader once per game process, early enough to come before the character list.
# The game kills itself after a second injection, so this one injection also carries TQ Android Perf with its
# add-ons (or TQ Traders alone). Perf 2.4+ and Traders 1.4+ stand back while this module is active; with older
# versions active this module does nothing and says so in the app. Status: <game files>/bootstrap-status.json
MODDIR=${0%/*}
PKG=com.hg.titanquestultimate
PERF=/data/adb/modules/tq_autopatch
TRADERS=/data/adb/modules/tq_traders
umask 077
while [ "$(getprop sys.boot_completed)" != 1 ]; do sleep 3; done
if [ -f "$MODDIR/worker.pid" ]; then
 old=$(cat "$MODDIR/worker.pid")
 case "$old" in *[!0-9]*|'') ;; *)
  if [ -r "/proc/$old/cmdline" ] && tr '\000' ' ' < "/proc/$old/cmdline" | grep -Fq "$MODDIR/service.sh"; then exit 0; fi;;
 esac
fi
echo $$ > "$MODDIR/worker.pid"
trap 'rm -f "$MODDIR/worker.pid"' EXIT
active() { [ -f "$1/service.sh" ] && [ ! -f "$1/disable" ] && [ ! -f "$1/remove" ]; }
knows_us() { grep -q tq_mods "$1/service.sh"; }
last=''
while [ ! -f "$MODDIR/disable" ] && [ ! -f "$MODDIR/remove" ]; do
 pid=$(pidof $PKG)
 case "$pid" in *[!0-9]*|'') sleep 1; continue;; esac
 start=$(sed 's/.*) //' "/proc/$pid/stat" 2>/dev/null | cut -d' ' -f20)
 key="$pid:$start"
 if [ "$key" = "$last" ]; then sleep 2; continue; fi
 last="$key"
 if [ -f "$MODDIR/handled" ] && [ "$(cat "$MODDIR/handled")" = "$key" ]; then continue; fi
 perf_on=0; active "$PERF" && [ ! -f "$PERF/paused" ] && [ -f "$PERF/patch.js" ] && perf_on=1
 blocked=''
 if [ $perf_on = 1 ] && ! knows_us "$PERF"; then blocked='Update TQ Android Perf to 2.4 or newer'
 elif [ $perf_on = 0 ] && active "$TRADERS" && ! knows_us "$TRADERS"; then blocked='Update TQ Traders to 1.4 or newer'; fi
 if [ -n "$blocked" ]; then echo "$blocked" > "$MODDIR/blocked"; echo "$key" > "$MODDIR/handled"; continue; fi
 rm -f "$MODDIR/blocked"
 # Once per process, even on error. Older-style modules also skip a process listed in their handled file.
 echo "$key" > "$MODDIR/handled"
 for d in "$PERF" "$TRADERS"; do [ -d "$d" ] && echo "$key" > "$d/handled"; done
 run="$MODDIR/run.js"; hosted=false
 if [ $perf_on = 1 ]; then
  params='{"mode":"apply"}'
  for f in plt snd slot uneg abbox strm getend menu; do
   [ -f "$PERF/no$f" ] || params=$(echo "$params" | sed "s/}\$/,\"$f\":true}/")
  done
  { echo '(function(){'; cat "$PERF/patch.js"
    for a in /data/adb/modules/*/tq-addon.js; do
     d=${a%/*}; [ -f "$a" ] && [ ! -f "$d/disable" ] && [ ! -f "$d/remove" ] && { echo; cat "$a"; }
    done
    echo; echo "const tqHostedInit=rpc.exports.init;(globalThis.__tqHosted=globalThis.__tqHosted||[]).push(function(s){return tqHostedInit(s,$params);});"
    echo '})();'; } > "$run"
  hosted=true
 elif active "$TRADERS" && [ -f "$TRADERS/standalone.js" ]; then
  { echo '(function(){'; cat "$TRADERS/standalone.js"
    echo; echo 'const tqHostedInit=rpc.exports.init;(globalThis.__tqHosted=globalThis.__tqHosted||[]).push(function(s){return tqHostedInit(s,{"mode":"apply"});});'
    echo '})();'; } > "$run"
  hosted=true
 else : > "$run"; fi
 cat "$MODDIR/loader.js" >> "$run"
 # Attach needs the process to finish starting; the character list is read many seconds later.
 sleep 0.5
 echo "Injecting PID $pid" > "$MODDIR/status.log"
 "$MODDIR/injector" -p "$pid" -s "$run" -P "{\"perfEnabled\":$hosted}" -e >> "$MODDIR/status.log" 2>&1
done
