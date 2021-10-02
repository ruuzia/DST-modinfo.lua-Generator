# DST-modinfo.lua-Generator
Generate code for your modinfo.lua file in your Don't Starve Together mod.

Please feel free to report any issues or suggestions.

Importing code into the app uses [luajs](https://github.com/mherkender/lua.js/) to parse the code in javascript, and then uses the values of the globals in the result to fill out the form and configurations. So you can put in any lua you want to be evalutated, and the app will use the results of the variables that luajs returns. (Note: luajs does have limitations and known issues that you can find on it's README. But it shouldn't matter if you're just importing your modinfo.lua)

TODO:
  - Add button to duplicate configurations
  - Required fields system
  - Reset inputs

https://grassdne.github.io/DST-modinfo.lua-Generator/
