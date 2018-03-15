import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
    currPlayer: 1,
    mode: 3,
    maxDepth1: 3,
    maxDepth2: 3,
    nodes: 0,
    board: [[1,1,2,1,1,2],[2,2,1,1,1,2],[2,2,1,2,2,1],[1,2,2,1,2,2],[2,1,1,1,2,2],[2,1,1,2,1,1]],
    freshBoard: [1,1,2,1,1,2, 2,2,1,1,1,2, 2,2,1,2,2,1, 1,2,2,1,2,2, 2,1,1,1,2,2, 2,1,1,2,1,1],
    overboard: task(function * (board) {
        let currPlayer = this.get('currPlayer')
        let root = {
            board: board,
            winner: 0,
            depth: 0,
            score: -1000,
            player:currPlayer
        }
        let newMove = {}
        let maxDepth = 3
        if(currPlayer == 1){
            maxDepth = this.get('maxDepth1')
        }else{
            maxDepth = this.get('maxDepth2')
        }
        yield newMove = this.max(root, maxDepth, -1000, 1000)

        while (newMove.depth !== 1){
            newMove = newMove.parent
        }
        //console.log('Nodes searched: ' + this.get('nodes'))
        this.set('nodes',0)
        this.set('board', newMove.board)
        this.set('currPlayer',this.get('currPlayer') == 2 ? 1:2)
        if(newMove.winner == 0){
            yield timeout(5)
            //console.log(newMove.board)
            
            this.get('overboard').perform(this.get('board'))
        }else{
            //console.log('Player ' + newMove.winner + ' wins') 
            yield timeout(2000)
            let a = this.get('freshBoard')
            a = [a.slice(0,6),a.slice(6,12),a.slice(12,18),a.slice(18,24),a.slice(24,30),a.slice(30,36)]
            this.set('board',a)

        }
        
    }),
    max(curr, depth, alpha, beta){
        if(curr.depth == depth){
            return curr
        }
        let possibleMoves = this.possibleBoardMoves(curr)
        let v = curr
        for(let i = 0; i < possibleMoves.length; i++){
            this.set('nodes', this.get('nodes') + 1)
            let movePrime = this.min(possibleMoves[i], depth, alpha, beta)
            if(movePrime.score > v.score){
                v = movePrime
            }
            if(alpha < v.score){
                alpha = v.score
            }
            if(beta <= alpha){
                break
            }
        }
        return v
    },
    min(curr,depth, alpha, beta){
        if(curr.depth == depth){
            return curr
        }
        let possibleMoves = this.possibleBoardMoves(curr)
        let v =  curr
        for(let i = 0; i < possibleMoves.length; i++){
            let movePrime = this.max(possibleMoves[i],depth, alpha, beta)
            if(movePrime.score < v.score){
                v = movePrime
            }
            if(beta > v.score){
                beta = v.score
            }
            if(beta <= alpha){
                break
            }
        }
        return v
    },
    possibleBoardMoves(curr){
        let n = this.get('n')
        let moves = []
        for(let x = 0; x < n; x++){
            for(let y = 0; y < n; y++){
                if(curr.board[y][x] == curr.player){
                    moves = moves.concat(this.possiblePieceMoves(curr, curr.player, [x,y]))
                }
            }
        }
        return this.shuffle(moves)
        
    },

    possiblePieceMoves(curr, player, coord) {
        let n = this.get('n')
        let moves = []
        for(let i=0; i < n; i++){
            if(this.validMove(curr, player, coord, [coord[0],i])){
                //if((this.numPieces(curr.board) == this.makeMove(curr, coord, [coord[0],i])) && )
                moves.push(this.makeMove(curr, coord, [coord[0],i]))
            }
            if(this.validMove(curr, player, coord, [i,coord[1]])){
                moves.push(this.makeMove(curr, coord, [i,coord[1]]))
            }
        }
        return moves
    },
    validMove(curr, player, from, to){
        let board = curr.board
        let n = this.get('n')
        let delta = [from[0]-to[0], from[1]-to[1]]
        
        if(delta[0] == 0){
            let row = []
            for(let i = 0; i<n;i++){
                row.push(board[i][from[0]])
            }
            if(delta[1] < 0){
                let zeros = (row.slice(from[0], n).filter(i => i==0)).length
                for(let i = n+delta[1]+zeros;i<n;i++){
                    if(board[i][from[0]] == player){
                        return false
                    }
                }
            }else if(delta[1] > 0){
                let zeros = (row.slice(0,from[0]).filter(i => i==0)).length
                for(let i = 0;i<delta[1]-zeros;i++){
                    if(board[i][from[0]] == player){
                        return false
                    }
                }
            }else{
                return false
            }
        }else{
            if(delta[0] < 0){
                for(let i = n+delta[0];i<n;i++){
                    if(board[from[1]][i] == player){
                        return false
                    }
                }
            }else if(delta[0] > 0){
                for(let i = 0;i<delta[0];i++){
                    if(board[from[1]][i] == player){
                        return false
                    }
                }
            }else{
                return false
            }
        }
        if((this.numPieces(curr.board)  === this.numPieces(this.makeMove(curr, from,to).board)) && (Math.abs(delta[0]) > 1 || Math.abs(delta[1]) > 1)){
            return false
        }
        
        return true
    },
    makeMove(curr, from, to){
        let board = curr.board
        let n = this.get('n')
        let newBoard = this.dupState(board)
        if(from[0] == to[0]){
            let diff = from[1] - to[1]
            let row = []
            for(let i = 0; i<n;i++){
                row.push(newBoard[i][from[0]])
            }
            if(diff > 0){
                let zeros = (row.slice(0,from[1]).filter(i => i==0)).length
                row.splice(from[1]+1, 0, ...new Array(diff).fill(0))
                let i = to[1]
                while(diff > 0 && zeros > 0 && i>0){
                    if(row[i] == 0){
                        row.splice(i,1)
                        diff--
                        zeros--
                    }
                    i--
                }
                row = row.splice(Math.abs(diff), n)
            }else{
                let zeros = (row.slice(from[1], n).filter(i => i==0)).length
                row.splice(from[1], 0, ...new Array(Math.abs(diff)).fill(0))
                let i = to[1]
                while(diff < 0 && zeros > 0 && i<row.length){
                    if(row[i] == 0){
                        row.splice(i,1)
                        diff++
                        zeros--
                        i--
                    }
                    i++
                }
                row.splice(n)
            }
            for(let i = 0; i<n;i++){
                newBoard[i][from[0]] = row[i]
            }
        }else{
            let diff = from[0] - to[0]
            if(diff > 0){
                let zeros = (newBoard[from[1]].slice(0,from[0]).filter(i => i==0)).length
                newBoard[from[1]].splice(from[0]+1, 0, ...new Array(diff).fill(0))
                let i = to[0]
                while(diff > 0 && zeros > 0 && i>0){
                    if(newBoard[from[1]][i] == 0){
                        newBoard[from[1]].splice(i,1)
                        diff--
                        zeros--
                    }
                    i--
                }
                newBoard[from[1]] = newBoard[from[1]].splice(Math.abs(diff), n)
            }else{
                let zeros = (newBoard[from[1]].slice(from[1], n).filter(i => i==0)).length
                newBoard[from[1]].splice(from[0], 0, ...new Array(Math.abs(diff)).fill(0))
                let i = to[0]
                while(diff < 0 && zeros > 0 && i<newBoard[from[1]].length){
                    if(newBoard[from[1]][i] == 0){
                        newBoard[from[1]].splice(i,1)
                        diff++
                        zeros--
                        i--
                    }
                    i++
                }
                newBoard[from[1]].splice(n)
            }

        }
        let score = 0
        let mode = this.get('mode')
        let currPlayer = this.get('currPlayer')
        if(mode == 1){
            if(currPlayer == 1){
                score = this.heuristicMoveOne(newBoard,currPlayer)
            }else{
                score = this.heuristicMoveTwo(newBoard, currPlayer + this.numMyPieces(newBoard,currPlayer))
            }
        }else if(mode == 2){
            if(currPlayer == 1){
                score = this.heuristicMoveOne(newBoard,currPlayer)
                
            } else{
                score = Math.floor(Math.random() * 100);
            }
        }else{
            score = this.heuristicMoveOne(newBoard,currPlayer)
        }
        let winner = this.winner(newBoard)

        if(winner == currPlayer){
            score == 999
        }else if(winner == (currPlayer == 2 ? 1:2)){
            score == -999
        }
        return {
            board:newBoard,
            winner: this.winner(newBoard),
            depth: curr.depth + 1,
            score: score,
            player: curr.player == 2 ? 1:2,
            parent: curr
        }
    },
    winner(board){
        let pieces = board.toString()
        if(pieces.includes('1') && pieces.includes('2')){
            return 0
        }
        if(pieces.includes('1')){
            return 1
        }else{
            return 2
        }

    },

    heuristicMoveOne(move,player){
        let n = this.get('n')
        let me = 0
        let you = 0
        for(let i = 0; i<n;i++){
            for(let j = 0; j<n; j++){
                if(move[i][j] == player){
                    me++
                }else if(move[i][j] !== 0){
                    you++
                }
            }
        }  
        return me-you
    },
    heuristicMoveTwo(board, player){
        let n = this.get('n')
        let centerPieces = 0
        for(let i = 1; i<n-1;i++){
            for(let j = 1; j<n-1; j++){
                if(board[i][j] == player){
                    centerPieces++
                }
            }
        }  
        return centerPieces
    },
    numPieces (board) {
        let n = this.get('n')
        let pieces = 0
        for(let i = 0; i<n;i++){
            for(let j = 0; j<n; j++){
                if(board[i][j] !== 0){
                    pieces++
                }
            }
        } 
        return pieces 
    },
    numMyPieces (board,player) {
        let n = this.get('n')
        let pieces = 0
        for(let i = 0; i<n;i++){
            for(let j = 0; j<n; j++){
                if(board[i][j] == player){
                    pieces++
                }
            }
        } 
        return pieces 
    },
    dupState (input) {
        let board = []
        for(let i = 0; i<input.length;i++){
            board[i] = input[i].copy()
        }
        return board
    },
    shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
    },
    actions: {
        modeSelect(option){
            //console.log('Mode set to: ' + option)
            this.set('mode', option)
        },
        clearBoard(){
            this.get('overboard').cancelAll()
            let a = this.get('freshBoard')
            a = [a.slice(0,6),a.slice(6,12),a.slice(12,18),a.slice(18,24),a.slice(24,30),a.slice(30,36)]
            this.set('board', a)
        }
    }
});
