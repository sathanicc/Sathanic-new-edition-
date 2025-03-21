const { bot, setAfk, lang } = require('../lib/');

bot(
  {
    pattern: 'afk ?(.*)', // Command pattern to trigger AFK status
    desc: lang.plugins.afk.desc, // Description of the command
    type: 'misc', // Command type
  },
  async (message, match, ctx) => {
    try {
      // Case when the user wants to turn off AFK status
      if (match === 'off') {
        // Reset AFK status
        setAfk(false, '', 0, '', message.id);
        return await message.send(lang.plugins.afk.not_afk, { quoted: message.data }, 'text', ctx.p);
      }

      // If the user is not AFK and no reason is provided, show an example message
      if (!ctx.isAfk && !match) {
        return await message.send(lang.plugins.afk.example);
      }

      // If the user is not AFK, set their AFK status
      if (!ctx.isAfk) {
        ctx.reason = match || ''; // Set the AFK reason, if any
        ctx.isAfk = true; // Mark the user as AFK

        // Get the current time in seconds
        const now = Math.floor(Date.now() / 1000);
        
        // Set the AFK status in the system
        setAfk(true, match, now, message.participant, message.id);

        // Respond with a message, replacing #lastseen with the current timestamp
        return await message.send(match.replace('#lastseen', now));
      }

    } catch (error) {
      // Log error and send a generic error message to the user
      console.error('Error while processing AFK command:', error);
      return await message.send('An error occurred while processing your AFK request. Please try again.');
    }
  }
);
