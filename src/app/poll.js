class Poll {
    constructor(newsObject, votes) {
        this.newsObject = newsObject;
        
        if(votes) {
            this.votes = votes;
        } else {
            this.votes = []
        }
        // { kind: verdadeiro/falso, author: <origem_do_voto>, voteQuantity: 1.... }
    }

    vote(isTrueNews, author) {
        //isTrueNews => true/false
        const voteKind = isTrueNews ? 'verdadeiro' : 'falso';
        const existingVote = this.votes.find(vote => vote.author == author && vote.kind == voteKind);

        if(existingVote) {
            existingVote.voteQuantity += 1;
        } else {
            this.votes.push({
                kind: voteKind,
                author: author,
                voteQuantity: 1
            })
        }
    }

    isDone() {
        let totalVotes = 0;

        for(let vote of this.votes) {
            totalVotes += vote.voteQuantity;
        }

        return totalVotes >= 5;
    }

    winner() {
        if(this.isDone()) {
            let votosVerdadeirosCount = 0;
            let votosFalsosCount = 0;

            for(let vote of this.votes) {
                if(vote.kind === 'verdadeiro') votosVerdadeirosCount += vote.voteQuantity;
                if(vote.kind === 'falso') votosFalsosCount += vote.voteQuantity;
            }

            if(votosVerdadeirosCount > votosFalsosCount) {
                return 'verdadeiro';
            } else {
                return 'falso';
            }
        }
    }
}

module.exports = Poll;