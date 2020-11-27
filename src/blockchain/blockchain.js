const Block = require('./block')
const crypto = require('crypto')

const hash = (data) => {
    const sha256 = crypto.createHash('sha256')
    return sha256.update(JSON.stringify(data)).digest('hex');
}

class Blockchain {
    constructor() {
        this.blocks = [ this.genesis() ];
    }

    mine(data) {
        const block = new Block(new Date(), this.blocks[this.blocks.length - 1].hash, data);
        this.blocks.push(block);
        return block;
    }

    genesis() {
        const block = new Block('2020-11-26', undefined, { "genesis": "block" });
        return block;
    }

    isValid() {
        this.isValid(this.blocks);
    }

    isValid(blocks) {
        if(blocks[0].hash !== this.genesis().hash) {
            return false;
        }

        const {
            data,
            timestamp,
            lastBlockHash
        } = blocks[blocks.length-1];

        if(hash({
            data,
            timestamp,
            lastBlockHash
        }) !== blocks[blocks.length-1].hash) {
            return false
        }

        for(let i = blocks.length - 1; i > 1; i--) {
            const {
                data,
                timestamp,
                lastBlockHash
            } = blocks[i-1];

            const lastBlockRealHash = hash({
                data,
                timestamp,
                lastBlockHash   
            });

            if(blocks[i].lastBlockHash !== lastBlockRealHash) {
                return false;
            }
        }

        return true;
    }

    replaceChain(blocks) {
        if(blocks.length <= this.blocks.length) {
            console.log('nova cadeia é menor/igual a atual, não foi atualizada.');
            return;
        }
        
        if(this.isValid(blocks)) {
            this.blocks = blocks;
        } else {
            console.log('cadeia recebida é inválida');
        }
    }
}

module.exports = Blockchain;