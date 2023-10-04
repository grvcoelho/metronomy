import { createStore } from '@guifromjs/store'
import { Scale, Range } from 'tonal'
import { Soundfont } from 'smplr'

type Arc = {
  hue: number
  note: string
  velocity: number
  lastImpactTime: number
  nextImpactTime: number
}

type Settings = {
  instrumentName: string
  scale: string
  numberOfArcs: number
  maxCycles: number
  duration: number
  startTime: number
  noteDuration: number
}

type State = {
  instrument: Soundfont | null
  settings: Settings
  arcs: Arc[]
}

function createInstrument(audioContext: AudioContext, instrumentName: string) {
  return new Soundfont(audioContext, {
    instrument: instrumentName,
  })
}

function getStore() {
  const numberOfArcs = 21
  const maxCycles = Math.round(numberOfArcs * 1.5)
  const duration = 30
  const startTime = new Date().getTime()
  const arcs = new Array<Arc>(numberOfArcs).fill({} as Arc)

  const store = createStore<State>({
    instrument: null,
    settings: {
      instrumentName: 'marimba',
      scale: 'C4 major',
      numberOfArcs,
      maxCycles,
      duration,
      startTime,
      noteDuration: 1000,
    },
    arcs,
  })

  return store
}

;(async function main() {
  const paper = document.querySelector('#paper') as HTMLCanvasElement
  const pen = paper.getContext('2d')
  const ac = new AudioContext()
  const store = getStore()

  const instrument = createInstrument(
    ac,
    store.getState().settings.instrumentName
  )

  instrument.load.then(() => {
    store.setState((draft) => {
      draft.instrument = instrument
    })
  })

  store.setState((draft) => {
    const degrees = Scale.degrees(draft.settings.scale)

    draft.arcs.forEach((arc, index) => {
      arc.hue = (index / draft.settings.numberOfArcs) * 360
      arc.note = degrees(index + 1)
      arc.velocity = calculateVelocityForArc(index)
      arc.lastImpactTime = 0
      arc.nextImpactTime = calculateNextImpactTime(
        draft.settings.startTime,
        arc.velocity
      )
    })
  })

  draw()

  function calculateDynamicArcColor(
    arc: Arc,
    currentTime: number,
    duration: number
  ) {
    const minOpacity = 0.5
    const maxOpacity = 1
    const baseColor = 'rgba(255, 255, 255, 0.5)'

    if (currentTime >= arc.lastImpactTime + duration) {
      return baseColor
    }

    const timeSinceLastImpact = currentTime - arc.lastImpactTime
    const percentage = Math.min(1, timeSinceLastImpact / duration)
    const opacityDelta = maxOpacity - minOpacity

    return `hsla(${arc.hue}, 80%, 50%, ${
      maxOpacity - opacityDelta * percentage
    })`
  }

  function calculateVelocityForArc(index) {
    const { settings } = store.getState()
    const numberOfCycles = settings.maxCycles - index
    const distancePerCycle = Math.PI

    return (numberOfCycles * distancePerCycle) / settings.duration
  }

  function calculateNextImpactTime(currentImpactTime, velocity) {
    return currentImpactTime + (Math.PI / velocity) * 1000
  }

  function draw() {
    if (!pen || !paper) return

    const state = store.getState()
    const { settings, arcs, instrument } = state

    const currentTime = new Date().getTime()
    const ellapsedTime = (currentTime - settings.startTime) / 1000

    paper.width = window.innerWidth
    paper.height = window.innerHeight

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

    pen.lineCap = 'round'
    pen.strokeStyle = 'rgba(255, 255, 255, 1)'
    pen.lineWidth = 3

    pen.beginPath()
    pen.moveTo(start.x, start.y)
    pen.lineTo(end.x, end.y)
    pen.stroke()

    const lineLength = end.x - start.x
    const initialArcRadius = lineLength * 0.05
    const spacing = (lineLength / 2 - initialArcRadius) / arcs.length

    arcs.forEach((arc, index) => {
      const arcRadius = initialArcRadius + spacing * index
      const minAngle = Math.PI
      const maxAngle = Math.PI * 2

      pen.strokeStyle = calculateDynamicArcColor(arc, currentTime, 1000) // FIXME

      pen.lineWidth = 3
      pen.beginPath()
      pen.arc(center.x, center.y, arcRadius, minAngle, maxAngle)
      pen.stroke()

      const distance = minAngle + ellapsedTime * arc.velocity
      const modDistance = distance % maxAngle
      const adjustedDistance =
        modDistance >= Math.PI ? modDistance : maxAngle - modDistance

      const pointOnArc = {
        x: center.x + arcRadius * Math.cos(adjustedDistance),
        y: center.y + arcRadius * Math.sin(adjustedDistance),
      }

      pen.fillStyle = `hsl(${arc.hue}, 80%, 50%)`
      pen.beginPath()
      pen.arc(pointOnArc.x, pointOnArc.y, lineLength * 0.007, 0, 2 * Math.PI)
      pen.fill()

      if (currentTime >= arc.nextImpactTime) {
        if (instrument) {
          instrument.start({
            note: arc.note,
            time: instrument.context.currentTime,
            duration: settings.noteDuration / 1000,
            decayTime: settings.noteDuration / 1000,
          })
        }
        store.setState((draft) => {
          draft.arcs[index].lastImpactTime = draft.arcs[index].nextImpactTime
          draft.arcs[index].nextImpactTime = calculateNextImpactTime(
            currentTime,
            arc.velocity
          )
        })
      }
    })

    window.requestAnimationFrame(draw)
  }
})()
