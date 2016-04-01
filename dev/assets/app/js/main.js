
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
    $('#top-panel').removeClass('is-slid');
    $('#side-panel').removeClass('is-slid');
}

function onAboutClicked(event) {
    AlFehrestNS.HelpEngine.close();
    document.body.style.cursor = "";
    var $main = $("#top-panel");
    var $dlg  = $("#info-panel");
    var $side = $("#side-panel");

    $main.addClass("is-slid");
    $side.addClass("is-slid");

        
    var $ol  = $dlg.find("ol").html('');
    var $p   = $dlg.find("p").html('').removeClass('loading');
    $dlg.find("h1").html('عن التطبيق');
    $p.html($('#about-dialog').html());
    $dlg.find("h2").html('');
}

function onHelpClicked(event) {
    onSidePanelCloseClicked();
    AlFehrestNS.HelpEngine.start();
}

function onRestartClicked(event) {
    if(!onRestartClicked.hasOwnProperty('canRestart')) {
        onRestartClicked.canRestart = true;
    }
    if(onRestartClicked.canRestart){
        onSidePanelCloseClicked();
        restartNetwork();
        loadEntity(AlFehrestNS.Config('startupNodeId'));
        onRestartClicked.canRestart = false;
        setTimeout(function() {
            onRestartClicked.canRestart = true;
        }, 2000);
    }
}

function onSearchFieldBlurred() {
    var $container = $('#search-container');
    var $searchBox  = $container.find('input');
    $container.removeClass('active');
    $searchBox.val('');
}

function onSearchClicked() {
    onSidePanelCloseClicked();
    var $container = $('#search-container');
    $container.toggleClass('active');
    var $searchBox  = $container.find('input');
    $searchBox.focus();
}


function onSearchItemSelected(item) {
    $('#search-container input').val('');
    if(nodesDS.get(item.id)) {
        selectNode(item.id, false);
        return;
    }
    restartNetwork();
    loadEntity(item.id);
}

function isSmallScreen() {
}

function setupUIEvents() {

    $('.share').click(onShareClicked);
    $('.about').click(onAboutClicked);
    $('.help').click(onHelpClicked);
    $('.restart').click(onRestartClicked);
    $('.close').click(onSidePanelCloseClicked);
    $('.side-menu .search').click(onSearchClicked);
    $('#search-container input').blur(onSearchFieldBlurred);

    $(document).keyup(onKeyUp);

}

function setupDialogs() {
    
    $(window).resize(isSmallScreen);

}
