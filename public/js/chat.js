export function initializeChat(socket) {
    var arrow = $('.chat-head svg')[0];
    var textarea = $('.chat-text input')[0];
    var button = $('#chat-submit')[0];

    arrow.addEventListener('click', () => {
        var angle = ($(arrow).data('angle') + 180) || 180;
        $(arrow).css({'transform': 'rotate(' + angle + 'deg)'});
        $(arrow).data('angle', angle);

        $('.chat-body').slideToggle('fast');
    });

    textarea.addEventListener('keydown', (e) => { if (e.keyCode == 13) sendMessage() });
    button.addEventListener('click', () => { sendMessage() });

    function sendMessage() {
        var msg = $(textarea).val();
        if (msg == '') return

        $(textarea).val('');
        $('.msg-insert').prepend("<div class='msg-send'>" + msg + "</div>");
        
        socket.emit('message', msg);
    }

    socket.on('message', getMessage);
    function getMessage(data) {
        $('.msg-insert').prepend("<div class='msg-receive'>" + data + "</div>");
    }
}
