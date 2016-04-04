
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

function updateSocialMediaUrls(id, text) {

    var url = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
    var desc = '';
    var metas = document.getElementsByTagName('meta');
    for (var i=0; i<metas.length; i++) {
        if (metas[i].getAttribute("name") == "description") {
            desc = metas[i].getAttribute("content");
            break;
        }
    }

    if(id && text) {
        url += '?id=' + id;
        desc = text;
        if(desc.length > 30) {
            desc = desc.substr(0, 30) + '…';
        }
    }

    var templates = {
        'facebook': 'http://www.facebook.com/sharer.php?u=%u%',
        'twitter' : 'https://twitter.com/share?url=%u%&text=%t%',
        'reddit'  : 'https://www.reddit.com/submit?url=%u%&resubmit=true&title=%t%',
        'google'  : 'https://plus.google.com/share?url=%u%'
    };

    for(var idx in templates) {
        var hrefURL = templates[idx].replace('%u%', url).replace('%t%', desc);
        $('.share.' + idx).attr('href', hrefURL);
    }
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
    $('body').removeClass('panel-open');
    updateSocialMediaUrls(null, null);
}

function onAboutClicked(event) {
    AlFehrestNS.HelpEngine.close();
    document.body.style.cursor = "";
    var $main = $("#top-panel");
    var $dlg  = $("#info-panel");
    var $side = $("#side-panel");

    $main.addClass("is-slid");
    $side.addClass("is-slid");
    $('body').addClass('panel-open');

        
    var $ol  = $dlg.find("ol").html('');
    var $p   = $dlg.find("p").html('').removeClass('loading');
    $dlg.find("h2").html('عن التطبيق');
    $p.html($('#about-dialog').html());
    $dlg.find("h3").html('');
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
        loadEntity(getStartupEntity());
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

