const dotenv = require('dotenv')
const fs = require('fs')
const Snoowrap = require('snoowrap')
const snoostorm = require('snoostorm')
const fetch = require('node-fetch')
const { CommentStream } = snoostorm
const zlib = require("zlib");
const queue = require('queue')
const Papa = require('papaparse')
const { createMessage } = require('./src/createMessage')

dotenv.config()

const client = new Snoowrap({
    userAgent: 'inscryption-card-fetcher',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

// Options object is a Snoowrap Listing object, but with subreddit and pollTime options
const comments = new CommentStream(client, {
    subreddit: "inscryption",
    limit: 10,
    pollTime: 5000,
});

let commentQueue = queue({ results: [] })

comments.on("item", async (comment) => {
    try {
        const commentText = comment.body
        const parsedText = useRegex(commentText)
        if (!parsedText) return
        const msg = await createMessage(parsedText, comment)
        if (msg.length > 1) {
            const sendMessage =
                `I found these in your comment:   
                
                ${msg}  


                I am a bot, please forgive my automation.`

            commentQueue.push({ msg: sendMessage, comment })
        }
    } catch (e) {
        console.log(e)
    }
});

function useRegex(input) {
    const regex = /\[[^\]]*\]*.\[[^\]]*\]/g;
    return [...input.matchAll(regex)];
}

//TO DO: Replace this with actual code
setInterval(() => {
    const comment = commentQueue.shift();
    if (comment) {
        try {
            console.log('replying to:', comment.comment.author)
            comment.comment.reply(comment.msg)
        } catch (e) {
            console.log(e, comment)
        }
    }
}, 5000);

setInterval(loadData, 1000 * 60 * 60) //resync data once an hour
async function loadData() {
    const cardsRes = await fetch('https://docs.google.com/spreadsheets/d/19VcAobU2h4uyYJLA2vkxqe1eMVmN3wwrJOPLf6-LiWg/gviz/tq?tqx=out:csv&sheet=cards')
    const itemsRes = await fetch('https://docs.google.com/spreadsheets/d/19VcAobU2h4uyYJLA2vkxqe1eMVmN3wwrJOPLf6-LiWg/gviz/tq?tqx=out:csv&sheet=items')
    const sigilsRes = await fetch('https://docs.google.com/spreadsheets/d/19VcAobU2h4uyYJLA2vkxqe1eMVmN3wwrJOPLf6-LiWg/gviz/tq?tqx=out:csv&sheet=sigils')
    const cardsCSV = await cardsRes.text()
    const itemsCSV = await itemsRes.text()
    const sigilsCSV = await sigilsRes.text()

    const jsonConfig = {
        header: true,
        skipEmptyLines: 'greedy'
    }

    const cardsJson = JSON.stringify(Papa.parse(cardsCSV, jsonConfig).data)
    const itemsJson = JSON.stringify(Papa.parse(itemsCSV, jsonConfig).data)
    const sigilsJson = JSON.stringify(Papa.parse(sigilsCSV, jsonConfig).data)
    

    fs.writeFile('src/cards.json', cardsJson, function (err) {
        if (err) console.log(err);
    });
    fs.writeFile('src/sigils.json', sigilsJson, function (err) {
        if (err) console.log(err);
    });
    fs.writeFile('src/items.json', itemsJson, function (err) {
        if (err) console.log(err);
    });
}

loadData()