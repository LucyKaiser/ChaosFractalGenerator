document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("keydown", function(e) {
            // prevent enter keypress in textareas
            if (e.key == "Enter" && document.activeElement.tagName == 'TEXTAREA') {
                e.preventDefault()
            }
            const regex = /[\d]|Backspace|Delete/
            const regex2 = /^\S+\s+(\S+)/
            // only allow 0-9, backspace, delete, and ctrl+a
            if ((regex2.exec(document.activeElement.id)[1] == "numbersOnly" && regex.test(e.key) != true) && (e.ctrlKey == false)) {
                e.preventDefault()
            }
        }
    )


})