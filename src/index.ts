;(async function main() {
  const paper = document.querySelector('#paper') as HTMLCanvasElement
  const pen = paper.getContext('2d')
  const startTime = Date.now()

  paper.width = paper.clientWidth
  paper.height = paper.clientHeight

  draw()

  function draw() {
    if (!pen || !paper) return

    const currentTime = Date.now()
    const ellapsedTime = currentTime - startTime

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
