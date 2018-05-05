const log = require("./log")
const fbAssets = require("./fb-assets")
const getCommandHandler = require("./commands/command-handlers").getCommandHandler
const info = require("../package.json")

let botMode = 0
// 0: Normal, 1: Game Prepare, 2: Game Mode
let playerList = []
const playerTypes = ["村民", "狼人", "村民", "狼人"]
let game

class Game {
  constructor(data) {
    this.player = data.player.sort(() => (Math.random() > 0.5 ? -1 : 1))
    this.id = data.id
    this.el = data.el
    this.playerSet = []
    this.wolfs = []
    this.normals = []
    this.dark = true
    this.killed = []
  }
  say(statement) {
    setTimeout(() => {
      getCommandHandler("message").call(this.el, `message "${this.id}" ${statement}`)
    }, 1500)
  }
  pm(id, statement) {
    setTimeout(() => {
      getCommandHandler("message").call(this.el, `message "${id}" ${statement}`)
    }, 1000)
  }
  wolf() {
    if (this.playerSet.filter(e => (e.type !== "狼人" && e.live)).length === 0) {
      this.say("遊戲結束，狼人獲勝")
      this.end()
    } else if (this.playerSet.filter(e => (e.type === "狼人" && e.live)).length === 0) {
      this.say("遊戲結束，村民獲勝")
      this.end()
    } else {
      this.playerSet.filter(e => (e.type === "狼人" && e.live)).forEach((e) => {
        this.pm(e.name, "請輸入此回合要殺的對象（按編號）/kill [ID]")
        this.pm(e.name, this.playerSet.map((ele, i) => (`${i}: ${ele.name}${ele.type === "狼人" ? "(狼)" : ""}`)).join("\n"))
      })
    }
  }
  kill(id) {
    this.playerSet[id].live = false
    this.killed.push(this.playerSet[id])
    if (this.killed.length === 2) {
      this.day()
    }
  }
  vote(id, vid) {
    if (this.playerSet[this.player.indexOf(vid)].live) {
      this.say(`${vid}: 死人不能投票！`)
    } else if (!this.playerSet[this.player.indexOf(vid)].voted && this.playerSet[id].live) {
      this.playerSet[id].vote += 1
      this.playerSet[this.player.indexOf(vid)].voted = true
      this.say(`${this.playerSet[id].vote} 人已投給 ${this.playerSet[id].name}`)
      this.checkVote()
    } else if (!this.playerSet[this.player.indexOf(vid)].voted) {
      this.say(`${vid}: 不能投給死人`)
    } else {
      this.say(`${vid}: 不可重複投票`)
    }
  }
  checkVote() {
    if (this.playerSet.filter(e => (e.voted)).length === this.playerSet.filter(e => (e.live)).length) {
      const votes = this.playerSet.map(e => (e.vote))
      console.log(votes)
      this.playerSet[votes.indexOf(Math.max(...votes))].live = false
      this.say(`暴民投票殺死了 ${this.playerSet[votes.indexOf(Math.max(...votes))].name}`)
      this.GM()
    }
  }
  GM() {
    if (this.playerSet.filter(e => (e.type !== "狼人" && e.live)).length === 0) {
      this.say("遊戲結束，狼人獲勝")
      this.end()
    } else if (this.playerSet.filter(e => (e.type === "狼人" && e.live)).length === 0) {
      this.say("遊戲結束，村民獲勝")
      this.end()
    } else {
      this.night()
    }
  }
  day() {
    this.dark = false
    this.say("天亮了，請大家睜開眼睛")
    this.say(`${this.killed.map(e => (e.name)).join("，")} 被狼人殺死了`)
    this.killed = []
    this.say("開始投票處決")
    this.say("請輸入此回合要處決對象（按編號）/vote [ID]")
    this.say(this.playerSet.map((e, i) => `${i}: ${e.name}${e.live ? "" : "☠️"}`).join("\n"))
  }
  night() {
    this.dark = true
    this.say("天黑請閉眼")
    this.say("狼人請睜眼")
    this.wolf()
  }
  end() {
    this.say(this.playerSet.map(e => `[${e.live ? "😀 存活" : "☠️ 死亡"}] ${e.name}: ${e.type}`).join("\n"))
    playerList = []
    botMode = 0
  }
  get init() {
    this.say("系統已私下告知個人角色身份")
    this.player.forEach((e, i) => {
      if (i < 4) {
        this.playerSet.push({ type: playerTypes[i], name: e, live: true, vote: 0, voted: false })
        this.pm(e, `尼的身份為 ${playerTypes[i]}`)
      } else {
        this.playerSet.push({ type: "村民", name: e, live: true, vote: false, voted: 0 })
        this.pm(e, "尼的身份為 村民")
      }
    })
    this.night()
  }
}

/**
 * Returns the parsed attachment object as a String
 * @param {Object} attachment
 */
function parseAttachment(attachment) {
  const attachmentType = attachment.type.replace(/_/g, " ")

  let messageBody = ""

  switch (attachmentType) {
    case "sticker":
      messageBody = fbAssets.facebookStickers[attachment.packID][attachment.stickerID] || "sticker - only viewable in browser"
      break
    case "file":
      messageBody = `${attachment.name}: ${attachment.url}`
      break
    case "photo":
      messageBody = `${attachment.filename}: ${attachment.facebookUrl}`
      break
    case "share":
      messageBody = `${attachment.facebookUrl}`
      break
    case "video":
      messageBody = `${attachment.filename}: ${attachment.url}`
      break
    default:
      messageBody = `${attachmentType} - only viewable in browser`
      break
  }

  return `[${attachmentType}] ${messageBody}`
}

/**
 * See the facebook-chat-api for detailed description of these events
 * https://github.com/Schmavery/facebook-chat-api/blob/master/DOCS.md#apilistencallback
 */
const eventHandlers = {
  /**
   * Handles the "message" event type
   * @param {Object} message
   */
  message(message) {
    this.getThreadById(message.threadID)
      .then((thread) => {
        if (message.senderID === this.user.userID && message.threadID !== this.user.userID) return

        const user = this.userCache[message.senderID]

        let sender = user.fullName || user.name
        let messageBody = message.body

        if (!user.isFriend && message.senderID !== this.user.userID) {
          sender = `${sender} [not your friend]`
        }

        // Bot Mode: Normal
        if (/@Mei Bo/.test(messageBody) && botMode === 0) {
          switch (true) {
            case /\/version/.test(messageBody):
              getCommandHandler("message").call(this, `message "${message.isGroup ? thread.name : sender}" Mei Bo v${info.version}`)
              break
            case /\/help/.test(messageBody):
              getCommandHandler("message").call(this, `message "${message.isGroup ? thread.name : sender}" 指令範例： @Mei Bo /[command]\n可用指令：\n/version 顯示當前版本號\n/help 列出此說明\n窩目前還笨笨ㄅ會做其他事，之後一定會變聰明的！`)
              break
            case /\/game/.test(messageBody):
              botMode = 1
              break
            default:
              getCommandHandler("message").call(this, `message "${message.isGroup ? thread.name : sender}" [Mei Bo v${info.version}]\nHi, 窩是機器人🤖️梅寶🤖️，請多多喵嗚\n指令說明請輸入 @Mei Bo /help`)
              break
          }
        }

        // Bot Mode: Game Prepare

        if (/\//.test(messageBody) && botMode === 1) {
          switch (true) {
            case /\/start/.test(messageBody):
              if (playerList.length > 3) {
                getCommandHandler("message").call(this, `message "${message.isGroup ? thread.name : sender}" 現在遊戲開始，房間裡有\n ${playerList.join("，")}`)
                game = new Game({ player: playerList, id: thread.name, el: this })
                game.init
                botMode = 2
              } else {
                getCommandHandler("message").call(this, `message "${message.isGroup ? thread.name : sender}" 人數不足！請湊足最少 4 人再開始遊戲`)
              }
              break
            case /\/end/.test(messageBody):
              botMode = 0
              playerList = []
              break
            case /\/join/.test(messageBody):
              if (playerList.filter(e => e === sender).length > 0) {
                getCommandHandler("message").call(this, `message "${message.isGroup ? thread.name : sender}" ${sender} 你已經在房間裡惹！\n目前房間裡有 ${playerList.length} 人`)
              } else {
                playerList.push(sender)
                getCommandHandler("message").call(this, `message "${message.isGroup ? thread.name : sender}" ${sender} 加入遊戲\n目前房間裡有 ${playerList.length} 人`)
              }
              break
            default:
              getCommandHandler("message").call(this, `message "${message.isGroup ? thread.name : sender}" 機器人🤖️梅寶🤖️ 現在為[狼人殺]模式\n\n輸入 /join 可加入遊戲\n輸入 /start 可開始遊戲\n輸入 /end 可終止遊戲\n\n[注意] 玩家必須先將梅寶加為好友才能使遊戲正常進行`)
              break
          }
        }

        // Bot Mode: Game Mode

        if (/\//.test(messageBody) && botMode === 2) {
          switch (true) {
            case /\/kill/.test(messageBody):
              if (game.dark) {
                game.kill(messageBody.match(/\/(.*?)\s+(.+)/)[2])
              }
              break
            case /\/vote/.test(messageBody):
              if (!game.dark) {
                game.vote(messageBody.match(/\/(.*?)\s+(.+)/)[2], sender)
              }
              break
            case /\/end/.test(messageBody):
              botMode = 0
              break
            default:
              getCommandHandler("message").call(this, `message "${message.isGroup ? thread.name : sender}" 機器人🤖️梅寶🤖️ 現在為[狼人殺]模式\n\n輸入 /join 可加入遊戲\n輸入 /start 可開始遊戲\n輸入 /end 可終止遊戲`)
              break
          }
        }

        if (message.isGroup) {
          sender = `(Group: ${thread.name}) ${sender}`
        }

        if (message.attachments.length > 0) {
          messageBody = message.attachments.reduce((prev, curr) => `${prev} ${parseAttachment(curr)};`, "")
        }

        log(`${this.lastThread !== message.threadID ? "\n" : ""}${sender} - ${messageBody}`, thread.color)

        process.stderr.write("\x07") // Terminal notification
        this.lastThread = message.threadID
      })
      .catch(err => log(err))
  },
  /**
   * Handles the "message" event type
   * @param {Object} ev
   */
  event(ev) {
    this.getThreadById(ev.threadID)
      .then((thread) => {
        let logMessage = "An event happened!"

        switch (ev.logMessageType) {
          case "log:thread-color":
            Object.assign(thread, { color: `#${ev.logMessageData.theme_color.slice(2)}` })
            logMessage = ev.logMessageBody
            break
          default:
            break
        }

        log(logMessage)
      })
  },
  typ() {

  },
  read_receipt() {

  },
  message_reaction() {

  },
}

module.exports = eventHandlers
