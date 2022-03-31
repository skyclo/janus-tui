import picocolors from 'picocolors'
import { convertTime } from './utils.js'
import ansiEscapes from 'ansi-escapes'

export default class BottomProgressBar {
    /**
     * BottomProgressBar
     * @param {Object} [options] - Configuration options
     * @param {number} [options.min=0] - The minimum value of the progress bar.
     * @param {number} [options.current=0] - The current value of the progress bar.
     * @param {number} [options.max=100] - The maximum value of the progress bar.
     * @param {number} [options.width=40] - The width of the progress bar.
     * @param {Object} [options.charset] - The charset of the progress bar.
     * @param {string} [options.charset.complete='\u2588'] - The char to use for completed progress.
     * @param {string} [options.charset.incomplete='\u2591'] - The char to use for incomplete progress.
     * @param {Object} [options.colors] - The colors of the progress bar.
     * @param {Function} [options.colors.complete] - The color to use for completed progress.
     * @param {Function} [options.colors.incomplete] - The color to use for incomplete progress.
     * @param {string} [options.format] - The format of the progress bar.
     * @param {Stream} [options.stream] - The stream to write to.
     * @param {Object} [options.timeUpdateHook] - The update hook allows for the progress bar to be updated automatically. Setting to this to null will disable the update hook.
     * @param {Function} [options.timeUpdateHook.hook] - The update hook function.
     * @param {number} [options.timeUpdateHook.interval=1000] - The interval in milliseconds to update the progress bar.
     */
    constructor (options) {
        // Default options
        options = options || {}
        // Range options
        // Minimum range value
        this.min = options.min || 0
        // Current value
        this.current = options.current || 0
        // Maximum range value
        this.max = options.max || 100

        // Character options
        // The width of the progress bar displayed in characters
        this.width = options.width || 40
        // The character set to use for the progress bar
        this.charset = options.charset || {
            // Complete portion of the progress bar
            complete: '\u2588',
            // Incomplete portion of the bar
            incomplete: '\u2591',
        }
        // The colors to use for the progress bar
        this.colors = options.colors || {
            // Complete portion of the progress bar
            complete: picocolors.cyan,
            // Incomplete portion of the bar
            incomplete: picocolors.cyan,
        }

        // Formatting Options
        // The format of the progress bar. This is a string that can contain the following
        // placeholders:
        //      - {bar} The progress bar
        //      - {min} The minimum value
        //      - {value} The current value
        //      - {total} The maximum value
        //      - {percentage} The percentage complete
        //      - {elapsedTime} The time elapsed since the start of the progress bar
        //      - {eta} The estimated time remaining
        this.format = options.format || 'Progress | {value}/{total} [{bar}] {percentage}% | Elapsed: {elapsedTime} | Time Remaining: {eta}'
        // The line height of the progress bar (should not be changed)
        this._formatLineHeight = this.format.split('\n').length

        // The stream to write to (defaults to process.stdout)
        this.stream = options.stream || process.stdout

        // The starting time in ms of the operation (can be manually overridden by calling
        // resetTimer)
        this.startTime = Date.now()
        // The update hook allows for the progress bar to be updated automatically every n number
        // of milliseconds. Can be disabled by passing null.
        this.timeUpdateHook = options.timeUpdateHook || {
            // Hook
            hook: () => {
                this.update()
            },
            // Interval
            interval: 1000,
            // Interval ID
            _interval: null,
        }
        // Sets the update hook interval id
        this.timeUpdateHook._interval = (this.timeUpdateHook && this.timeUpdateHook.hook && this.timeUpdateHook.interval) ? setInterval(this.timeUpdateHook.hook, this.timeUpdateHook.interval) : null

        // Renders the progress bar when created
        this.update()
    }

    // Allows for text to be written to the console without having to deal with the progress bar.
    // Since using any of the console printing functions or writing to the stdout stream will cause
    // the progress bar to be improperly rendered, this function must be used instead. It is a
    // wrapper around the stream.write function, however, ANSI escape sequences are printed to the
    // stream to remove the progress bar, print out text, and then re-render the progress bar.
    print(...data) {
        // Clear the line
        this.stream.write(ansiEscapes.eraseLines(this._formatLineHeight))
        // Print the data
        this.stream.write(data.join(''))
        // Update the progress bar
        this.update()
    }

    // Updates the progress bar. This renders and prints the progress bar to the stream.
    update(current = this.current, max = this.max) {
        // Clear the current progress bar
        //this.stream.write(ansiEscapes.eraseLines(1))
        // Remove all lines left behind by the progress bar
        this.stream.write(ansiEscapes.eraseLines(this._formatLineHeight))
        // Updates the ranges if needed
        this.current = current
        this.max = max
        // Gets the length of the complete portion of the progress bar
        let completeLength = Math.round(this.width * (this.current - this.min) / (this.max - this.min))
        // Gets the length of the incomplete portion of the progress bar
        let incompleteLength = this.width - completeLength
        // Assembles the progress bar by replacing the template placeholders with the appropriate
        // values
        // TODO: clean this up and add padding to values
        let output = this.format
            .replace('{bar}', this.colors.complete(this.charset.complete.repeat(completeLength)) + this.colors.incomplete(this.charset.incomplete.repeat(incompleteLength)))
            .replace('{min}', this.min)
            .replace('{value}', this.current)
            .replace('{total}', this.max)
            .replace('{percentage}', Math.round(this.current / this.max * 100))
            .replace('{elapsedTime}', convertTime(Date.now() - this.startTime))
            .replace('{eta}', convertTime(Math.round((this.max - this.current) * (Date.now() - this.startTime) / this.current)))

        // Writes the output to the stream
        this.stream.write(output)
    }

    // Resets and returns the timer to the current time
    resetTimer(time = Date.now()) {
        return this.startTime = time
    }

    // Closes teh progress bar and removes the progress bar from the stream
    close() {
        // Clear the current progress bar
        this.stream.write(ansiEscapes.eraseLines(this._formatLineHeight))
        if (this.timeUpdateHook._interval) {
            // If the time update hook is set, clear it
            clearInterval(this.timeUpdateHook._interval)
        }
    }
}

