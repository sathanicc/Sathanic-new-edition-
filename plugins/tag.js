const { bot, addSpace, forwardOrBroadCast, lang } = require('../lib/');

bot(
  {
    pattern: 'tag ?(.*)', // Command pattern
    onlyGroup: true, // Only works in groups
    desc: lang.plugins.tag.desc, // Description of the command
    type: 'group', // Type of the command (group related)
  },
  async (message, match) => {
    try {
      const participants = await message.groupMetadata(message.jid); // Get group participants
      const mentionedJid = participants.map(({ id }) => id); // Extract participant JIDs

      let responseMessage = '';

      if (match === 'all') {
        // Tag all participants
        responseMessage = participants
          .map((e, i) => `${i + 1}${addSpace(i + 1, participants.length)} @${e.id.split('@')[0]}`)
          .join('\n');
        
        return await message.send('```' + responseMessage.trim() + '```', {
          contextInfo: { mentionedJid },
        });
      }

      if (match === 'admin' || match === 'admins') {
        // Tag admins
        const adminJid = participants.filter(user => user.admin).map(({ id }) => id);
        responseMessage = adminJid.map(e => `@${e.split('@')[0]}`).join('\n');
        
        return await message.send(responseMessage.trim(), {
          contextInfo: { mentionedJid: adminJid },
        });
      }

      if (match === 'notadmin' || match === 'notadmins') {
        // Tag non-admins
        const nonAdminJid = participants.filter(user => !user.admin).map(({ id }) => id);
        responseMessage = nonAdminJid.map(e => `@${e.split('@')[0]}`).join('\n');
        
        return await message.send(responseMessage.trim(), {
          contextInfo: { mentionedJid: nonAdminJid },
        });
      }

      if (match || message.reply_message?.text) {
        // Send a custom message or the message being replied to
        return await message.send(match || message.reply_message.text, {
          contextInfo: { mentionedJid },
        });
      }

      // If no valid input is provided, show usage
      if (!message.reply_message) return await message.send(lang.plugins.tag.usage);

      // If no match, forward or broadcast the message
      forwardOrBroadCast(message.jid, message, { contextInfo: { mentionedJid } });

    } catch (error) {
      console.error('Error in tag command:', error);
      return await message.send(lang.plugins.general.error_message);
    }
  }
);
