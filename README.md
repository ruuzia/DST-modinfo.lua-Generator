# DST-modinfo.lua-Generator
Generate code for your modinfo.lua file in your Don't Starve Together mod. The goal for this app is not only for new DST modders who don't know what they need in a modinfo.lua file, or to prevent the debugging struggle of missing a comma, but also just to avoid the tediousness of it all (especially configuration options).

Please feel free to report any issues or suggestions.

Importing code into the app uses [luajs](https://github.com/mherkender/lua.js/) to parse the code in javascript, and then uses the values of the globals in the result to fill out the form and configurations. So you can put in any lua you want to be evalutated, and the app will use the results of the variables that luajs returns. (Note: luajs does have limitations and known issues that you can find on it's README. But it shouldn't matter if you're just importing your modinfo.lua)

https://grassdne.github.io/DST-modinfo.lua-Generator/

### Supports
- name
- author
- description
- version
- dst_compatible
- dont_starve_compatible
- reign_of_giants_compatible
- hamlet_compatible
- shipwrecked_compatible
- forge_compatible
- gorge_compatible
- client_only_mod
- all_clients_require_mod
- icon_atlas
- icon
- forumthread
- api_version
- api_version_dst
- priority
- mod_dependencies
- server_filter_tags
- configuration_options
  - name
  - label
  - hover
  - default
  - __options__
  - data
  - description
  - hover

Options can be added by duplicating another option, creating a new one, generating option fields for all letters A-Z, or customizing an increment setting to generate many at once, or of course from importing code.
