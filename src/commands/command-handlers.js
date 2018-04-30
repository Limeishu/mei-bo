const helpers = require("../helpers")
const commandTypes = require("./command-types")
/* Store regexps that match raw commands */

const commandShortcuts = {
  h: commandTypes.HISTORY,
  m: commandTypes.MESSAGE,
  r: commandTypes.REPLY,
}

/**
 * Matches a raw command on a given regex and returns the available arguments
 * @param {Regex} regexp
 * @param {String} rawCommand
 */
function parseCommand(regexp, rawCommand) {
  if (regexp) return rawCommand.match(regexp)

  // return a 1-item array if no regex i.e. 1 word commands (contacts, etc.)
  return [rawCommand.trim()]
}

/**
 * Command register. All commands get bound to the Messer instance, which allows
 * the api (and others) to be referenced and used within the functions.
 */
const commands = {
  /**
   * Sends message to given user
   * @param {String} rawCommand
   */
  [commandTypes.MESSAGE.command](rawCommand) {
    return new Promise((resolve, reject) => {
      const argv = parseCommand(commandTypes.MESSAGE.regexp, rawCommand)
      if (!argv) return reject("Invalid message - check your syntax")

      const rawReceiver = argv[2]
      const message = argv[3]

      if (message.length === 0) return reject("No message to send - check your syntax")

      return this.getThreadByName(rawReceiver)
        .then(receiver =>
          this.api.sendMessage(message, receiver.threadID, (err) => {
            if (err) return reject(err)

            return resolve(`Sent message to ${receiver.name}`)
          }))
        .catch(() => reject(`User '${rawReceiver}' could not be found in your friends list!`))
    })
  },

  /**
   * Replies with a given message to the last received thread.
   * @param {String} rawCommand
   */
  [commandTypes.REPLY.command](rawCommand) {
    return new Promise((resolve, reject) => {
      if (this.lastThread === null) return reject("ERROR: You need to receive a message on Messer before using `reply`")

      const argv = parseCommand(commandTypes.REPLY.regexp, rawCommand)
      if (!argv || !argv[2]) return reject("Invalid command - check your syntax")

      // var body = rawCommand.substring(commandTypes.REPLY.length).trim()

      return this.api.sendMessage(argv[2], this.lastThread, (err) => {
        if (err) return reject(err)

        return resolve()
      })
    })
  },

  /**
   * Displays users friend list
   */
  [commandTypes.CONTACTS.command]() {
    return new Promise((resolve) => {
      const friendsList = helpers.objectValues(this.userCache).filter(u => u.isFriend)
      if (friendsList.length === 0) return resolve("You have no friends :cry:")

      return resolve(friendsList
        .sort((a, b) => ((a.fullName || a.name) > (b.fullName || b.name) ? 1 : -1))
        .reduce((a, b) => `${a}${b.fullName || b.name}\n`, ""))
    })
  },

  /**
   * Displays usage instructions
   */
  [commandTypes.HELP.command]() {
    return new Promise(resolve => resolve(`Commands:\n${helpers.objectValues(commandTypes).reduce((a, b) => `${a}\t${b.command}: ${b.help}\n`, "")}`))
  },

  /**
   * Retrieves last n messages from specified friend
   * @param {String} rawCommand
   */
  [commandTypes.HISTORY.command](rawCommand) {
    return new Promise((resolve, reject) => {
      const argv = parseCommand(commandTypes.HISTORY.regexp, rawCommand)
      if (!argv) return reject("Invalid command - check your syntax")

      const DEFAULT_COUNT = 5

      const rawThreadName = argv[2]
      const messageCount = argv[3] ? parseInt(argv[3].trim(), 10) : DEFAULT_COUNT
      // Find the given receiver in the users friendlist
      return this.getThreadByName(rawThreadName)
        .then(thread =>
          this.api.getThreadHistory(thread.threadID, messageCount, undefined, (err, history) => {
            if (err) return reject(err)

            if (history.length === 0) return resolve("")

            // make sure we have all the senders cached
            const senderIds = Array.from(new Set(history.map(message => message.senderID)))

            return Promise.all(senderIds.map(id => this.getThreadById(id)))
              .then(() => resolve(history.reduce((a, b) => `${a}${b.name}: ${b.body}\n`, "")))
          }))
        .catch(() => reject(`User '${rawThreadName}' could not be found in your friends list!`))
    })
  },

  /**
   * Changes the color of the thread that matches given name
   * @param {String} rawCommand
   */
  [commandTypes.COLOR.command](rawCommand) {
    return new Promise((resolve, reject) => {
      const argv = parseCommand(commandTypes.COLOR.regexp, rawCommand)
      if (!argv) return reject("Invalid command - check your syntax")

      let color = argv[3]
      if (!color.startsWith("#")) {
        color = this.api.threadColors[color]
        if (!color) return reject(`Color '${argv[3]}' not available`)
      }
      // check if hex code is legit (TODO: regex this)
      if (color.length !== 7) return reject(`Hex code '${argv[3]}' is not valid`)


      const threadName = argv[2]
      // Find the thread to send to

      return this.getThreadByName(threadName)
        .then(thread =>
          this.api.changeThreadColor(color, thread.theadID, (err) => {
            if (err) return reject(err)

            return resolve()
          }))
        .catch(() => reject(`Thread '${threadName}' couldn't be found!`))
    })
  },

  /**
   * Retrieves last n messages from specified friend
   * @param {String} rawCommand
   */
  [commandTypes.RECENT.command](rawCommand) {
    return new Promise((resolve, reject) => {
      const argv = parseCommand(commandTypes.RECENT.regexp, rawCommand)
      if (!argv) return reject("Invalid command - check your syntax")

      const DEFAULT_COUNT = 5

      const threadCount = argv[2] ? parseInt(argv[2].trim(), 10) : DEFAULT_COUNT

      const threadList = helpers.objectValues(this.threadCache)
        .slice(0, threadCount)
        .reduce((a, b, i) => `${a}[${i}] ${b.name}\n`, "")

      return resolve(threadList)
    })
  },
}

module.exports = {
  getCommandHandler(rawCommandKeyword) {
    let command = commandShortcuts[rawCommandKeyword]
    if (command) {
      command = command.command
    } else {
      command = rawCommandKeyword
    }

    return commands[command]
  },
}
