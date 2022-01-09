const cards = require('./cards.json')
const items = require('./items.json')
const sigils = require('./sigils.json')

async function createMessage(parsedText, comment){
    let msg = ''
    for (const text of parsedText) {
        const cleanedText = text[0].replace(/[^\w\s]/gi, '')
        const item = items[cleanedText]
        const sigil = sigils[cleanedText]
        const card = cards[cleanedText]

        if (item) {
            const itemMessage = await handleItem(item, comment)
            if (itemMessage) msg = msg + itemMessage
        }
        if (card) {
            const cardMessage = await handleCard(card, comment)
            if (cardMessage) msg = msg + cardMessage
        }
        if (sigil) {
            const sigilMessage = await handleSigil(sigil, comment)
            if (sigilMessage) msg = msg + sigilMessage
        }
    }

    return msg
}
async function handleCard(card, comment) {
    const commentWithReplies = await comment.expandReplies()
    const replies = commentWithReplies.replies

    let replied = false
    for (const reply of replies) {
        const name = reply.author.name
        if (name === 'inscryption-fetchbot') replied = true
    }

    if (replied) return
    const message =
        `
  
CARD | ${card.name}
-- | --
Attack | ${card.attack}
  
`

    return message
}

async function handleItem(item, comment) {
    const commentWithReplies = await comment.expandReplies()
    const replies = commentWithReplies.replies

    let replied = false
    for (const reply of replies) {
        const name = reply.author.name
        if (name === 'inscryption-fetchbot') replied = true
    }

    if (replied) return
    const message =
        `
  
ITEM | ${item.name}
-- | --
Effect | ${item.effect}
Misc. | ${item.misc}
  
`

    return message
}

async function handleSigil(sigil, comment) {
    const commentWithReplies = await comment.expandReplies()
    const replies = commentWithReplies.replies

    let replied = false
    for (const reply of replies) {
        const name = reply.author.name
        if (name === 'inscryption-fetchbot') replied = true
    }

    if (replied) return
    const message =
        `
  
SIGIL | ${sigil.name}
-- | --
Effect | ${sigil.effect}
Found on | ${sigil.foundOn}
  
`
    return message
}

exports.createMessage = createMessage