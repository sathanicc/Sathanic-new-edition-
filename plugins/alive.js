const { bot, aliveMessage, lang } = require('../lib/');

bot(
  {
    pattern: 'alive ?(.*)', // Command pattern to trigger the alive message
    desc: lang.plugins.alive.desc, // Description of the command
    type: 'misc', // Command type
  },
  async (message, match) => {
    try {
      // Retrieve the alive message details asynchronously
      const { msg, options, type } = await aliveMessage(match, message);
      
      // Send the response message with the appropriate options and type
      return await message.send(msg, options, type);
    } catch (error) {
      // Handle any errors that may occur during processing
      console.error('Error while processing alive command:', error);
      return await message.send('An error occurred while retrieving the alive message. Please try again.');
    }
  }
);
