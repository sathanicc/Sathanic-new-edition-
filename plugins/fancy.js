const { bot, textToStylist, fontType, stylishTextGen, lang } = require('../lib')

// List of available font styles for better error handling and dynamic feedback
const availableFontTypes = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', 
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', 
  '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', 
  '41', '42', '43', '44', '45', '46', '47'
]

// Helper function to transform text to various formats
const transformText = (text, transformation) => {
  switch (transformation) {
    case 'uppercase':
      return text.toUpperCase()
    case 'lowercase':
      return text.toLowerCase()
    case 'titlecase':
      return text.replace(/\b\w/g, char => char.toUpperCase())
    default:
      return text
  }
}

bot(
  {
    pattern: 'fancy ?(.*)',
    fromMe: true,
    desc: lang.plugins.fancy.desc,
    type: 'misc',
  },
  async (message, match) => {
    const replyText = message.reply_message?.text

    // If no text is provided, show an example and instructions
    if (!match && !replyText) {
      return message.send(lang.plugins.fancy.example)
    }

    // Handle if the user asks for help
    if (match.toLowerCase() === 'help') {
      return message.send(
        `Here are the available font styles:\n${availableFontTypes.join(', ')}\nUse 'fancy <number>' or 'fancy <text>' to apply a style.`
      )
    }

    // Handle the transformation options (e.g., uppercase, lowercase)
    if (match.toLowerCase().startsWith('transform/')) {
      const transformation = match.split('/')[1].toLowerCase()
      const validTransformations = ['uppercase', 'lowercase', 'titlecase']
      
      if (!validTransformations.includes(transformation)) {
        return message.send('Invalid transformation type. Use uppercase, lowercase, or titlecase.')
      }
      
      const transformedText = transformText(replyText || match, transformation)
      return message.send(transformedText)
    }

    // If the input is a number, validate the font type range
    if (match && !isNaN(match) && (match < 1 || match > 47)) {
      return message.send(lang.plugins.fancy.invalid)
    }

    // If no font number is provided, use a random font type
    if (match === 'random') {
      const randomFont = Math.floor(Math.random() * availableFontTypes.length) + 1
      return message.send(stylishTextGen(randomFont.toString()))
    }

    // If a valid match exists, process it with the selected font
    const font = match ? fontType(match) : null
    const fancyText = replyText ? textToStylist(replyText, font) : stylishTextGen(match)

    // Provide a preview of the font styles before applying
    if (match === 'preview') {
      const previewMessage = availableFontTypes
        .map(fontNum => `${fontNum}: ${textToStylist('Preview', fontType(fontNum))}`)
        .join('\n')
      return message.send(`Preview of font styles:\n${previewMessage}`)
    }

    // Display fancy text in the chosen font style
    return message.send(fancyText)
  }
)
