const { bot, mentionMessage, enableMention, clearFiles, getMention, lang, getAdmins } = require('../lib/')

bot(
  {
    pattern: 'mention ?(.*)',  // Matches the mention command
    desc: lang.plugins.mention.desc,  // Description of the command from the language file
    type: 'misc',  // Miscellaneous command type
  },
  async (message, match) => {
    const mentionedJid = message.mentionedJid || []  // Handle mentioned users
    const userId = message.participant  // The user who triggered the command
    const admins = await getAdmins(message.jid)  // Get group admins
    const mentionHistory = await getMentionHistory(message.jid)  // Fetch mention history

    // If no match is provided, show the current mention status
    if (!match) {
      const mention = await getMention(message.id)  // Get the current mention status
      const onOrOff = mention && mention.enabled ? 'on' : 'off'  // Check if enabled
      return await message.send(lang.plugins.mention.current_status.format(onOrOff))  // Send status message
    }

    // If user requests to get the mention message, show the current mention message
    if (match === 'get') {
      const msg = await mentionMessage(message.id)  // Fetch the mention message
      if (!msg) return await message.send(lang.plugins.mention.not_activated)  // If not activated, show message
      return await message.send(msg)  // Send the activated mention message
    }

    // If user wants to enable or disable mentions
    if (match === 'on' || match === 'off') {
      await enableMention(match === 'on', message.id)  // Enable or disable mention based on user input
      // Notify admins when the mention feature is toggled
      if (match === 'on') {
        admins.forEach(async admin => {
          await message.send(
            lang.plugins.mention.admin_notification_on.format(userId)
          )
        })
      } else {
        admins.forEach(async admin => {
          await message.send(
            lang.plugins.mention.admin_notification_off.format(userId)
          )
        })
      }
      return await message.send(
        match === 'on' ? lang.plugins.mention.activated : lang.plugins.mention.deactivated  // Return activation/deactivation status
      )
    }

    // Set custom mention message with optional emoji or formatting
    if (match.includes(':emoji')) {
      const emoji = match.split(':')[1]
      const customMessage = `Hey @${userId.split('@')[0]}, here is your custom message with emoji ${emoji}`
      await enableMention(customMessage, message.id)  // Set custom mention message with emoji
      return await message.send(lang.plugins.mention.custom_with_emoji.format(customMessage))
    }

    // If a custom mention message is provided, update it
    await enableMention(match, message.id)  // Set the custom mention message
    clearFiles()  // Clear files to avoid unnecessary accumulation
    return await message.send(lang.plugins.mention.updated)  // Confirm the update
  }
)

bot(
  {
    pattern: 'mentionhistory',  // Command to view mention history
    desc: 'View the history of mentions in the group',
    type: 'misc',
  },
  async (message) => {
    const mentionHistory = await getMentionHistory(message.jid)  // Fetch mention history
    if (!mentionHistory.length) {
      return await message.send(lang.plugins.mention.no_history)  // If no history, inform the user
    }
    
    const historyText = mentionHistory.map((entry, i) => `${i + 1}. ${entry.user} mentioned at ${entry.timestamp}`).join('\n')
    return await message.send(`Here are the past mentions:\n${historyText}`)  // Send mention history to the user
  }
)

// Auto-reply feature when users are mentioned
bot(
  {
    pattern: 'auto_mention',  // Command to toggle auto-mention feature
    desc: 'Automatically reply when mentioned',
    type: 'misc',
  },
  async (message, match) => {
    const autoReplyStatus = await getAutoReplyStatus(message.jid)  // Fetch auto-reply status
    if (match === 'on' || match === 'off') {
      await setAutoReplyStatus(match === 'on', message.jid)  // Enable or disable auto-reply
      return await message.send(`Auto-reply has been ${match === 'on' ? 'enabled' : 'disabled'}.`)  // Confirm status change
    }

    return await message.send(`Auto-reply is currently ${autoReplyStatus ? 'enabled' : 'disabled'}.`)
  }
)
