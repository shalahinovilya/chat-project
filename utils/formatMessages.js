import moment from "moment";

export function formatMessage (username, message) {
    return {
        username,
        content: message,
        time: moment().format('h:mm a')
    }
}