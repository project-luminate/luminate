// change all new lines to <br> tags

export function convertNewLinesToBrTags(text) {
    return text.replace(/\n/g, '<br>');
}
