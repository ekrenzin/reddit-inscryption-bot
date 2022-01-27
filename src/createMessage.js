const cards = require('./cards.json')
const items = require('./items.json')
const sigils = require('./sigils.json')

async function createMessage(parsedText, comment) {
    let msg = ''
    for (const textData of parsedText) {
        const text = textData[0].replace(/[^\w]/gi, '')
        const item = parseJson(text, items)
        const sigil = parseJson(text, sigils)
        const card = parseJson(text, cards)

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

function parseJson(text, json) {
    let parsedValue = null

    for (const value of json) {
        if (text === value.Name) {
            parsedValue = value
        }
        else if (value.OtherNames.split(',').includes(text)){
            parsedValue = value
        }
    }

    return parsedValue
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
  
CARD | ${card.Name}
-- | --
Description | ${card.Description}
Wiki Link | ${card.URL}
Attack | ${card.Attack}
Tribes | ${card.Tribes}
Sigils | ${card.Sigils}
Cost | ${card.Cost}
Cost Type | ${card["Cost Type"]}
Hidden Traits | ${card.HiddenTraits}
  
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