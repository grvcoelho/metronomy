import { createStore } from '@guifromjs/store'

function getStore() {
  const numberOfArcs = 2
  const maxCycles = Math.round(numberOfArcs * 1.25)
  const duration = 60 * 0.2
  const startTime = Date.now()

  const arcs = Array.from({ length: numberOfArcs })

  const store = createStore({
    settings: {
      numberOfArcs,
      maxCycles,
      duration,
      startTime,
    },
    arcs,
  })

  return store
}

;(async function main() {
  const paper = document.querySelector('#paper') as HTMLCanvasElement
  const pen = paper.getContext('2d')
  const store = getStore()

  paper.width = paper.clientWidth
  paper.height = paper.clientHeight

  draw()

  function draw() {
    if (!pen || !paper) return

    const state = store.getState()
    const { settings, arcs } = state

    const currentTime = Date.now()
    const ellapsedTime = currentTime - settings.startTime

    const start = {
      x: paper.width * 0.1,
      y: paper.height * 0.9,
    }

    const end = {
      x: paper.width * 0.9,
      y: paper.height * 0.9,
    }

    const center = {
      x: paper.width * 0.5,
      y: paper.height * 0.9,
    }

    const lineLength = end.x - start.x

    pen.lineCap = 'round'
    pen.strokeStyle = 'white'
    pen.lineWidth = 4

    pen.beginPath()
    pen.moveTo(start.x, start.y)
    pen.lineTo(end.x, end.y)
    pen.stroke()
  }
})()
