import { createStore } from '@guifromjs/store'

type Arc = {
  velocity: number
  nextImpactTime: number
}

function getStore() {
  const numberOfArcs = 15
  const maxCycles = Math.round(numberOfArcs * 1.25)
  const duration = 60 * 0.2
  const startTime = Date.now()
  const arcs = new Array<Arc>(numberOfArcs).fill({} as Arc)

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

  store.subscribe(console.info)

  store.setState((draft) => {
    draft.arcs.forEach((arc, index) => {
      arc.velocity = calculateVelocityForArc(index)
      arc.nextImpactTime = calculateNextImpactTime(
        draft.settings.startTime,
        arc.velocity
      )
    })
  })

  draw()

  function calculateVelocityForArc(index) {
    const { settings } = store.getState()
    const numberOfCycles = settings.maxCycles - index
    const distancePerCycle = Math.PI

    return (numberOfCycles * distancePerCycle) / settings.duration
  }

  function calculateNextImpactTime(currentImpactTime, velocity) {
    return currentImpactTime + (Math.PI * velocity) / 1000
  }

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
