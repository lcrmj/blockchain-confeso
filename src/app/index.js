const express = require('express')
const app = new express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const uuid = require('uuid').v4;

const Blockchain = require('../blockchain/blockchain');
const Poll = require('./poll');
const blockchain = new Blockchain();

let myVoteBalance = 5;
const myId = uuid();

const peers = []
const ongoingPolls = {}

const TYPES = {
    'REPLACE_CHAIN': 1,
    'SYNC_POLL': 2,
    'CLEAR_POLL': 4
}

const syncChains = () => {
    for(let peer of peers) {
        peer.send(JSON.stringify({
            type: TYPES.REPLACE_CHAIN,
            payload: blockchain.blocks
        }));
    }
}

const syncPoll = (poll) => {
    for(let peer of peers) {
        peer.send(JSON.stringify({
            type: TYPES.SYNC_POLL,
            payload: poll
        }));
    }
}

const clearPoll = (poll) => {
    ongoingPolls[poll.newsObject.id] = undefined;
    for(let peer of peers) {
        peer.send(JSON.stringify({
            type: TYPES.CLEAR_POLL,
            payload: poll.newsObject
        }));
    }
}

const handleNewConnection = (socket) => {
    peers.push(socket)

    socket.on('message', (data) => {
        const {
            type,
            payload
        } = JSON.parse(data);

        switch(type) {
            case TYPES.REPLACE_CHAIN:
                blockchain.replaceChain(payload)
                break;
            case TYPES.SYNC_POLL:
                const poll = new Poll(payload.newsObject, payload.votes);
                ongoingPolls[payload.newsObject.id] = new Poll(payload.newsObject, payload.votes);

                if(poll.isDone()) {
                    const winner = poll.winner();
                    blockchain.mine({
                        poll,
                        winner
                    });
                    syncChains();
                    clearPoll(poll);
                }
                break;
            case TYPES.CLEAR_POLL:
                ongoingPolls[payload.id] = undefined;
                break;
        }
        
    })

    syncChains();
}

app.use(express.json())

app.get('/', (req, res) => {
    res.json(blockchain.blocks).end();
})

app.post('/mine', (req, res) => {
    const block = blockchain.mine(req.body);
    syncChains();
    res.json(block).end();
})

app.post('/news', (req, res) => {
    const newsObject = {
        title,
        author,
        article
    } = req.body;
    newsObject.id = uuid();
    const poll = new Poll(newsObject);

    ongoingPolls[newsObject.id] = poll;
    syncPoll(poll);
    res.json(poll).end();
})

app.get('/news/:id', (req, res) => {
    res.json(ongoingPolls[req.params.id]).end();
})

app.post('/news/:id/vote', (req, res) => {
    const pollObject = ongoingPolls[req.params.id];

    const {
        kind
    } = req.body

    if(pollObject && myVoteBalance > 0) {
        pollObject.vote(kind === 'verdadeiro', myId)

        myVoteBalance -= 1;
        syncPoll(pollObject);
        res.json(pollObject).end();
    } else {
        res.end();
    }
})

io.on('connect', (socket) => {
    handleNewConnection(socket);
})

//0    1        2       3
//node index.js <porta> <peers>
const nodePort = process.argv[2];
const requestedPeers = (process.argv[3] || '').split(',');

for(let peerToConnect of requestedPeers) {
    socket = require('socket.io-client')(`http://${peerToConnect}`)

    socket.on('connect', () => {
        console.log(`me conectei ao servidor ${peerToConnect}`)
        
        handleNewConnection(socket);
    })
}

http.listen(nodePort, () => {
    console.log(`servidor rodando na porta ${nodePort}`)
});