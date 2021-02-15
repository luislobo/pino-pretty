'use strict'

const { LEVELS, LEVEL_NAMES } = require('./constants')

let customLevelNames = false

const nocolor = input => input
const plain = {
  default: nocolor,
  60: nocolor,
  50: nocolor,
  40: nocolor,
  30: nocolor,
  20: nocolor,
  10: nocolor,
  message: nocolor
}

const chalk = require('chalk')
const ctx = new chalk.Instance({ level: 3 })
const colored = {
  default: ctx.white,
  60: ctx.bgRed,
  50: ctx.red,
  40: ctx.yellow,
  30: ctx.green,
  20: ctx.blue,
  10: ctx.grey,
  message: ctx.cyan
}

/**
 * Custom colorizer based on the customLevels configuration
 * @param name name of the log level
 * @param label log level name
 * @param color log level color
 * @param background log level background (defaults to transparent)
 * @returns {*} colorized level
 */
function customColorizer ({ name, label, color, background = '' }) {
  return ctx[color] && ctx[background] ? ctx[background](ctx[color](label))
    : ctx[color] ? ctx[color](label) : ctx.white(label)
}

function colorizeLevel (level, colorizer, customLevels = {}) {
  if (Number.isInteger(+level)) {
    return Object.prototype.hasOwnProperty.call(customLevels, level)
      ? customColorizer(customLevels[level])
      : Object.prototype.hasOwnProperty.call(LEVELS, level)
        ? colorizer[level](LEVELS[level])
        : colorizer.default(LEVELS.default)
  }
  const levelNum = customLevelNames[level.toLowerCase()] || LEVEL_NAMES[level.toLowerCase()] || 'default'
  return customLevels[levelNum] ? customColorizer(customLevels[levelNum]) : colorizer[levelNum](LEVELS[levelNum])
}

function plainColorizer (level) {
  return colorizeLevel(level, plain)
}
plainColorizer.message = plain.message

function cacheCustomLevelNames (customLevels) {
  if (!customLevelNames && customLevels) {
    customLevelNames = {}
    for (const [levelNum, level] of Object.entries(customLevels)) {
      customLevelNames[level.label.toLowerCase()] = levelNum
    }
  }
}

function coloredColorizer (level, customLevels) {
  cacheCustomLevelNames(customLevels)
  return colorizeLevel(level, colored, customLevels)
}
coloredColorizer.message = colored.message

/**
 * Factory function get a function to colorized levels. The returned function
 * also includes a `.message(str)` method to colorize strings.
 *
 * @param {bool} [useColors=false] When `true` a function that applies standard
 * terminal colors is returned.
 *
 * @returns {function} `function (level) {}` has a `.message(str)` method to
 * apply colorization to a string. The core function accepts either an integer
 * `level` or a `string` level. The integer level will map to a known level
 * string or to `USERLVL` if not known.  The string `level` will map to the same
 * colors as the integer `level` and will also default to `USERLVL` if the given
 * string is not a recognized level name.
 */
module.exports = function getColorizer (useColors = false) {
  return useColors ? coloredColorizer : plainColorizer
}
