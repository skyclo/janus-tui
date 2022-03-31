export function convertTime(time) {
    var days = Math.floor(time / (1000 * 60 * 60 * 24));
    var hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((time % (1000 * 60)) / 1000);
    var result = ''
    if (days > 0) {
        result += days + 'd'
    }
    if (hours > 0) {
        result += hours + 'h'
    }
    if (minutes > 0) {
        result += minutes + 'm'
    }
    if (seconds > 0) {
        result += seconds + 's'
    }
    if (result === '') {
        result = time + 'ms'
    }
    return result
}
