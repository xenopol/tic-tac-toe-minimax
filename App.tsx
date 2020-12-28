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
type GameState = {
  board: Cell[]
  player: Player
}

const initialState = {
  board: Array(9).fill(undefined),
  player: Player.Human,
}

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

const alphaBeta = (
  isMax: boolean,
  depth: number,
  alpha: number,
  beta: number,
  board: Cell[],
) => {
  const emptyCellIds = getEmptyCellIds(board)
  let value = isMax ? -Infinity : Infinity
  emptyCellIds.some((cellId) => {
    const nextBoard = updateBoard(
      cellId,
      isMax ? Player.Computer : Player.Human,
      board,
    )
    const score = minimax(!isMax, depth + 1, alpha, beta, nextBoard)
    value = isMax ? Math.max(value, score) : Math.min(value, score)

    if (isMax) alpha = Math.max(alpha, value)
    else beta = Math.min(beta, value)

    return beta <= alpha
  })

  return value
}

const minimax = (
  isMax: boolean,
  depth: number,
  alpha: number,
  beta: number,
  board: Cell[],
): number => {
  const winnerCellIds = getWinnerCellIds(board)
  const winner = board[winnerCellIds[0]]

  if (winner) return winner === Player.Computer ? 100 - depth : -100 + depth
  if (isDraw(board)) return 0

  return alphaBeta(isMax, depth, alpha, beta, board)
}

const getComputerMove = (board: Cell[]) =>
  getEmptyCellIds(board).reduce(
    (acc, cellId) => {
      const nextBoard = updateBoard(cellId, Player.Computer, board)
      const score = minimax(false, 0, -Infinity, Infinity, nextBoard)
      return score > acc.score ? {score, cellId} : acc
    },
    {score: -Infinity, cellId: -1},
  ).cellId

const Board = () => {
  const [{board, player}, setState] = useState<GameState>(initialState)
  const winnerCellIds = getWinnerCellIds(board)
  const winner = board[winnerCellIds[0]]
  const draw = isDraw(board)

  const play = (cellId: CellId) => {
    const cellOccupied = board[cellId]
    if (cellOccupied) return

    setState({
      board: updateBoard(cellId, player, board),
      player: togglePlayer(player),
    })
  }

  const reset = () => setState(initialState)

  if (winner) createAlert(winner, reset)
  if (draw) createAlert(null, reset)
  if (!winner && !draw && player === Player.Computer)
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
