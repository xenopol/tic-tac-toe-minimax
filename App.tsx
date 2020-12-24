import React, {useState} from 'react'
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Pressable,
} from 'react-native'

enum Player {
  Human = 'x',
  Computer = 'o',
}
type Cell = Player | undefined
type CellId = number

const initialBoard = Array(9).fill(undefined)
const initialPlayer = Player.Human

const getWinnerCellIds = (board: Cell[]) =>
  [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ].find(
    ([a, b, c]) => board[a] && board[a] === board[b] && board[b] === board[c],
  ) || []

const getEmptyCellIds = (board: Cell[]) =>
  board.reduce((acc, cur, i) => (!cur ? [...acc, i] : acc), [] as number[])

const isDraw = (board: Cell[]) => board.filter(Boolean).length === 9

const updateBoard = (cellId: CellId, player: Player, board: Cell[]) =>
  board.map((cell, i) => {
    if (cellId === i) return player
    return cell
  })

const createAlert = (player: Player | null, resetGame: () => void) => {
  const title = player ? `Player ${player} won!` : "It's a draw!"

  Alert.alert(title, '', [
    {
      text: 'Play again',
      onPress: resetGame,
    },
  ])
}

const togglePlayer = (player: Player) =>
  player === Player.Computer ? Player.Human : Player.Computer

const minimax = (isMax: boolean, depth: number, board: Cell[]) => {
  const emptyCellIds = getEmptyCellIds(board)
  const winnerCellIds = getWinnerCellIds(board)
  const winner = board[winnerCellIds[0]]

  if (winner) return winner === Player.Computer ? 100 : -100
  if (isDraw(board)) return 0

  if (isMax) {
    let value = -Infinity
    emptyCellIds.forEach((cellId) => {
      const nextBoard = updateBoard(cellId, Player.Computer, board)
      const score = minimax(!isMax, depth + 1, nextBoard)
      value = Math.max(value, score)
    })
    return value
  } else {
    let value = Infinity
    emptyCellIds.forEach((cellId) => {
      const nextBoard = updateBoard(cellId, Player.Human, board)
      const score = minimax(!isMax, depth + 1, nextBoard)
      value = Math.min(value, score)
    })
    return value
  }
}

const getComputerMove = (board: Cell[]) => {
  const emptyCellIds = getEmptyCellIds(board)
  let value = -Infinity
  let bestMove = -Infinity
  emptyCellIds.forEach((cellId) => {
    const nextBoard = updateBoard(cellId, Player.Computer, board)
    const score = minimax(false, 0, nextBoard)
    if (score > value) {
      value = score
      bestMove = cellId
    }
  })
  return bestMove
}

const Board = () => {
  const [board, setBoard] = useState<Cell[]>(initialBoard)
  const [player, setPlayer] = useState<Player>(initialPlayer)
  const winnerCellIds = getWinnerCellIds(board)
  const winner = board[winnerCellIds[0]]
  const draw = isDraw(board)

  const play = (cellId: CellId) => {
    const cellOccupied = board[cellId]
    if (cellOccupied) return

    setBoard(updateBoard(cellId, player, board))
    setPlayer(togglePlayer)
  }

  const reset = () => {
    setBoard(initialBoard)
    setPlayer(initialPlayer)
  }

  if (winner) createAlert(winner, reset)
  if (draw) createAlert(null, reset)
  if (
    !winner &&
    !draw &&
    board.filter(Boolean).length &&
    player === Player.Computer
  )
    play(getComputerMove(board))

  return (
    <View style={styles.board}>
      {board.map((cell, i) => (
        <Pressable
          key={i}
          style={[styles.cell, winnerCellIds.includes(i) && styles.winnerCell]}
          onPress={() => play(i)}>
          <Text style={styles.cellText}>{cell}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Tic Tac Toe</Text>

        <Board />
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 20,
  },
  title: {
    fontSize: 36,
  },
  board: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cell: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  winnerCell: {
    backgroundColor: '#a5d6a7',
  },
  cellText: {
    fontWeight: 'bold',
    fontSize: 36,
  },
  green: {
    color: 'green',
  },
})

export default App
