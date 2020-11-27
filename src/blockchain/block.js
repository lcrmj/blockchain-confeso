const crypto = require('crypto')

const hash = (data) => {
    const sha256 = crypto.createHash('sha256')
    return sha256.update(JSON.stringify(data)).digest('hex');
}

class Block {
    constructor(timestamp, lastBlockHash, data) {
        this.data = data;

        this.lastBlockHash = lastBlockHash;
        this.timestamp = timestamp;
        this.hash = hash({
            data,
            timestamp,
            lastBlockHash
        });
    }
}

module.exports = Block;