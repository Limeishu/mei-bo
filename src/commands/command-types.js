const regexps = [
  /([A-z]+)\s+"(.*?)"\s+((.|\n)+)/,
  /([A-z]+)\s+((.|\n)+){0,}/,
  /([A-z]+)\s+"(.*?)"(?:\s+)?([0-9]+)?/,
]

/* Command type constants */
const commandTypes =
  {
    COLOR: {
      command: "color",
      regexp: regexps[0],
    },
    CONTACTS: {
      command: "contacts",
      help: "contacts",
    },
    HELP: {
      command: "help",
    },
    HISTORY: {
      command: "history",
      regexp: regexps[2],
      help: "history \"[thread name]\" [n]",
    },
    MESSAGE: {
      command: "message",
      regexp: regexps[0],
      help: "message \"[thread name]\" [message]",
    },
    RECENT: {
      command: "recent",
      regexp: regexps[1],
      help: "recent [n]",
    },
    REPLY: {
      command: "reply",
      regexp: regexps[1],
      help: "reply [message]",
    },
  }

module.exports = commandTypes
