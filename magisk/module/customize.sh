[ "$ARCH" = arm64 ] || abort "This module needs an arm64 (64-bit ARM) Android device"
set_perm_recursive "$MODPATH" 0 0 0755 0644
set_perm "$MODPATH/injector" 0 0 0700
set_perm "$MODPATH/service.sh" 0 0 0700
set_perm "$MODPATH/tqmods.sh" 0 0 0700
set_perm "$MODPATH/action.sh" 0 0 0700
ui_print "- Install the Titan Quest Mods app, add a mod and tap Play."
ui_print "- Your game app is not changed. Mods use separate copies of your characters."
old() { d=/data/adb/modules/$1; [ -f "$d/service.sh" ] && [ ! -f "$d/disable" ] && ! grep -q tq_mods "$d/service.sh"; }
old tq_autopatch && ui_print "! Update TQ Android Perf to 2.4 or newer: older versions would inject a second time."
old tq_traders && ui_print "! Update TQ Traders to 1.4 or newer: older versions would inject a second time."
ui_print "- Reboot to activate."
