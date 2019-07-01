const commandTypes = {
  HELP: {
    command: '/help',
    regexp: /\/help/,
    help: '/help'
  },

  SERVER: {
    command: '/server',
    regexp: /(\/server) (stat|monit|del) (.+)/,
    help: '/server [stat | monit | del] [server-name] [--all]'
  },

  SITE: {
    command: '/site',
    regexp: /(\/server) (stat|monit|del) (.+)/,
    help: '/site [stat | monit | del] [server-name] [--all]'
  }
};

export default commandTypes;