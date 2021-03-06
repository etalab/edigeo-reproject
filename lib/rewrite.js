'use strict'

const {padStart} = require('lodash')
const proj4 = require('proj4')

const {getReference} = require('./references')

function printCoord(coord) {
  return coord < 0 ? coord.toFixed(2) : '+' + coord.toFixed(2)
}

const l93 = getReference('LAMB93').proj4

function rewriteVEC(inputBuffer, mode, ccSrs) {
  return rewriteBase(inputBuffer, line => {
    if (line.length < 7 || line.substr(5, 2) === '00') {
      return line
    }
    const lineType = line.substr(0, 5)
    if (['CORCC', 'CM1CC', 'CM2CC'].includes(lineType)) {
      const coords = line.substr(8).split(';').filter(v => Boolean(v)).map(parseFloat)
      const reprojCoords = mode === 'L93toCC' ?
        proj4(l93, ccSrs, coords) :
        proj4(ccSrs, l93, coords)
      const lineValue = reprojCoords.map(printCoord).join(';') + ';'
      return `${lineType}${padStart(lineValue.length.toString(), 2, '0')}:${lineValue}`
    }
    return line
  })
}

function rewriteGEO(inputBuffer, ignfCode) {
  return rewriteBase(inputBuffer, line => {
    if (line.startsWith('RELSA')) {
      if (!line.includes('RGF93CC') && !line.includes('LAMB93')) {
        throw new Error('Not supported')
      }
      return `RELSA${padStart(ignfCode.length.toString(), 2, '0')}:${ignfCode}`
    }
    return line
  })
}

function rewriteBase(inputBuffer, rewriteLine) {
  const splittedContent = inputBuffer
    .toString('latin1')
    .split('\r\n')
    .map(rewriteLine)

  return Buffer.from(splittedContent.join('\r\n'), 'latin1')
}

module.exports = {printCoord, rewriteGEO, rewriteVEC}
