# Native save-root return substitution on Android

Build 5364, Redmi Note 8. A menu-only experiment verified a bounded native string
return substitution; it did not enable gameplay save routing or load a character.

The probe checked the GetUserSaveDataFolder export address and its first 16 bytes.
It called the getter using an AArch64 indirect 24-byte string return, retained the
output pointer from x8 in an interceptor, and assigned a test path using the game's
native string assignment function. Returned strings were destroyed using the
native destructor. The test path was not opened or written by the probe.

The interceptor was armed only for explicit probe calls on the probe thread.
Twenty armed calls returned the test path, each followed by an unarmed call that
returned the original Preferences/SaveData/ path. After detaching the interceptor,
one more call returned the original path. Process 20904 reported 20 substitutions,
20 completed iterations, restored=true and status=passed. No full allocator or
long-duration stability claim follows from this bounded test.

An earlier attempt inside the menu interceptor callback failed its substituted
return check. Scheduling the probe outside that callback passed. Callback nesting
is a suspected cause, not independently proven; the first attempt lacked callback
counts. The successful attempt ran from a deferred script callback, so this test
also does not establish safe production threading for broader engine operations.

The original loader was restored and its on-device SHA-256 checked against
`ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd`.
The game was launched again. No before/after save-content comparison was performed.

Next: use this ABI evidence to build a guarded, immutable profile binding, including
caravan paths and startup timing. Real write/read coverage, cloud behavior and
vanilla recovery remain required before exposing profile activation to users.
