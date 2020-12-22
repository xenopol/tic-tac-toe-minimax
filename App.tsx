import React, {useState, useEffect} from 'react'
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Pressable,
} from 'react-native'

// const initialBoard = Array(9).fill(undefined)
const initialBoard = [
  'O',
  'X',
  'O',
  'X',
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
]
const areEqual = (a: string, b: string, c: string) => a && a === b && b === c

const getWinnerCells = (board: string[]) => {
  if (areEqual(board[0], board[1], board[2])) return [0, 1, 2]
  if (areEqual(board[3], board[4], board[5])) return [3, 4, 5]
  if (areEqual(board[6], board[7], board[8])) return [6, 7, 8]
  if (areEqual(board[0], board[3], board[6])) return [0, 3, 6]
  if (areEqual(board[1], board[4], board[7])) return [1, 4, 7]
  if (areEqual(board[2], board[5], board[8])) return [2, 5, 8]
  if (areEqual(board[0], board[4], board[8])) return [0, 4, 8]
  if (areEqual(board[2], board[4], board[6])) return [2, 4, 6]
  return []
}

const updateBoard = (cellId: number, isX: boolean, board: string[]) =>
  board.map((cell, i) => {
    if (i === cellId) return isX ? 'X' : 'O'
    return cell
  })

const createAlert = (status: number, resetGame: () => void) => {
  const title =
    status > 0 ? 'Player X won!' : status < 0 ? 'Player O won!' : "It's a draw!"

  Alert.alert(title, '', [
    {
      text: 'Play again',
      onPress: resetGame,
    },
  ])
}

const getEmptyCellIds = (board: string[]) =>
  board.reduce((acc, cur, i) => (!cur ? [...acc, i] : acc), [] as number[])

const minimax = (board: string[], depth: number, isMax: boolean): number => {
  const emptyCellIds = getEmptyCellIds(board)
  if (getWinnerCells(board).length) return isMax ? 1 : -1
  if (!emptyCellIds.length) return 0

  // maximizer
  if (isMax) {
    let bestScore = -Infinity
    emptyCellIds.forEach((id) => {
      const score = minimax(updateBoard(id, false, board), depth + 1, !isMax)
      bestScore = Math.max(score, bestScore)
    })
    return bestScore
  }

  // minimizer
  let bestScore = Infinity
  emptyCellIds.forEach((id) => {
    const score = minimax(updateBoard(id, true, board), depth + 1, !isMax)
    bestScore = Math.min(score, bestScore)
  })
  return bestScore
}

const getAiMove = (board: string[]): number => {
  debugger
  const emptyCellIds = getEmptyCellIds(board)
  let bestScore = -Infinity
  let move = 0

  emptyCellIds.forEach((id) => {
    const score = minimax(board, 0, false)
    console.log('score', score)
    if (score > bestScore) {
      bestScore = score
      move = id
    }
  })

  console.log('move', move)

  return move
}

const Board = () => {
  const [board, setBoard] = useState<string[]>(initialBoard)
  const [winnerCells, setWinnerCells] = useState<number[]>([])
  const [isX, setIsX] = useState(true)
  useEffect(() => {
    const emptyCells = getEmptyCellIds(board)
    if (
      emptyCells.length < 9 &&
      emptyCells.length > 0 &&
      !isX &&
      !winnerCells.length
    ) {
      const aiMove = getAiMove(board)
      makeMove(aiMove)
    }
  })

  const resetGame = () => {
    setBoard(initialBoard)
    setWinnerCells([])
    setIsX(true)
  }

  const makeMove = (cellId: number) => {
    if (board[cellId]) return

    const updatedBoard = updateBoard(cellId, isX, board)
    const updatedWinnerCells = getWinnerCells(updatedBoard)
    setBoard(updatedBoard)

    if (updatedWinnerCells.length) {
      createAlert(isX ? 1 : -1, resetGame)
      setWinnerCells(updatedWinnerCells)

      return
    }

    const isDraw = updatedBoard.filter(Boolean).length === 9
    if (isDraw) {
      createAlert(0, resetGame)

      return
    }

    setIsX((current) => !current)
  }

  return (
    <View style={styles.board}>
      {board.map((cell, i) => (
        <Pressable
          key={i}
          style={[styles.cell, winnerCells.includes(i) && styles.winnerCell]}
          onPress={() => makeMove(i)}>
          <Text style={[styles.cellText, cell === 'X' && styles.green]}>
            {cell}
          </Text>
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
    backgroundColor: 'blue',
  },
  cellText: {
    color: 'yellow',
    fontSize: 36,
  },
  green: {
    color: 'green',
  },
})

export default App
