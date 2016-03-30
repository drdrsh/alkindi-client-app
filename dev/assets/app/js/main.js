
function onShareClicked(event) {
    event.preventDefault();
    var winWidth = 500;
    var winHeight= 500;
    var winTop = 0;
    var winLeft = 0;
    window.open(
        $(this).attr('href'),
        'share',
        'top=' + winTop + ',left=' + winLeft + ',' +
        'toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight
    );
}

function onKeyUp(event) {

    if (event.keyCode == 27) { // escape key maps to keycode `27`
        event.preventDefault();
        onSidePanelCloseClicked();
    }
}

function onSidePanelCloseClicked() {
    $('#info-panel').removeClass('is-slid');
    $('#top-panel').removeClass('is-slid');
}

function onAboutClicked(event) {
    $('#about-dialog').dialog('open');
    AlFehrestNS.HelpEngine.close();
}

function onHelpClicked(event) {
    AlFehrestNS.HelpEngine.start();
}

function onRestartClicked(event) {
    if(!onRestartClicked.hasOwnProperty('canRestart')) {
        onRestartClicked.canRestart = true;
    }
    if(onRestartClicked.canRestart){
        restartNetwork();
        loadEntity(AlFehrestNS.Config('startupNodeId'));
        onRestartClicked.canRestart = false;
        setTimeout(function() {
            onRestartClicked.canRestart = true;
        }, 2000);
    }
}

function setupUIEvents() {

    $('.share').click(onShareClicked);
    $('.about').click(onAboutClicked);
    $('.help').click(onHelpClicked);
    $('.restart').click(onRestartClicked);
    $('#info-panel .close').click(onSidePanelCloseClicked);
    $(document).keyup(onKeyUp);

}

function setupDialogs() {
    
    $('#about-dialog').dialog({
        autoOpen: false,
        modal: true,
        maxWidth:600,
        maxHeight: 300,
        width: 600,
        height: 300,
        title: "نموذج تفاعلي لأنساب العرب في السيرة النبوية",
        buttons: {
            "العودة" : function() {
                $('#about-dialog').dialog('close');
            }
        }
    });

    $( "#details-dialog" ).dialog({
        autoOpen: false,
        height:500,
        width:700,
        modal: true,
        buttons: {
            "العودة": function() {
                $( this ).dialog( "close" );
            }
        }
    });

}
