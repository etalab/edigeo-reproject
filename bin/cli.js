#!/usr/bin/env node
const argv = require('yargs').argv
const getStream = require('get-stream')

const {reprojectArchive} = require('../')

if (!argv.d && !argv.dep) {
  console.error('Erreur: Le code département doit être fourni via -d ou --dep')
  console.error('')
  console.error('Exemple :')
  console.error('  $ edigeo-reproject -d 36')
  process.exit(1)
}

const depCode = (argv.d || argv.dep).toString().padStart(2, '0')

getStream.buffer(process.stdin)
  .then(inputArchive => reprojectArchive(inputArchive, depCode, argv.m || argv.mode))
  .then(result => process.stdout.write(result))
  .catch(err => console.error('Erreur : ' + err.message))
