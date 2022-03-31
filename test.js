import janus from 'janus-tui'

let progress = new janus.BottomProgressBar(0, 100)

recursionExample(0)

function recursionExample(i) {
    if (i > 100) {
        return progress.close()
    }
    progress.print(`#${ i } Iteration\n\t${ i }/100\n`)
    progress.update(i)
    setTimeout(() => {
        recursionExample(++i)
    }, 200 * Math.random())
}
