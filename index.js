const dotenv = require('dotenv')
const Snoowrap = require('snoowrap')
const snoostorm = require('snoostorm')
const { InboxStream, CommentStream, SubmissionStream } = snoostorm
const queue = require('queue')
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
    subreddit: "ah82h98he28hj9",
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