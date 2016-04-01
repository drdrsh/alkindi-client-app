
$dlgDetails = null;
$dlgAbout   = null;

var graph = null;
var fullDataset = {};
var nodesDS     = null;
var edgesDS     = null;

function setLabels(e) {
    
    var t = (e.name || e.title);
    
    if(e._entity_type == 'authority') {
        e.label= t.split('(')[0];
    } else {
        e.label = t;
        if(t.length > AlFehrestNS.Config('MAX_NAME_LENGTH')) {
            e.label = t.substr(0, AlFehrestNS.Config('MAX_NAME_LENGTH')) + '...';
        }
    }
    e.title = t;
    
}
function loadDetails(id) {

    document.body.style.cursor = "";
    var $main = $("#top-panel");
    var $dlg  = $("#info-panel");
    var $side = $("#side-panel");
    var $p   = $dlg.find("p").addClass("loading").html('');
    var $ol  = $dlg.find("ol").html('');

    $dlg.find("h1").html('');
    $dlg.find("h2").addClass("loading").html('');
    var nodeData = nodesDS.get(id);
    if(nodeData) {
        $dlg.find("h1").html(nodeData.name || nodeData.title);
    }

    $main.addClass("is-slid");
    $side.addClass("is-slid");

    loadEntity(id).then(function(id, data) {

        var entity = data.entity;
        var title= entity.name || entity.title;

        $dlg
            .find("h1")
            .removeClass("loading")
            .html(entity.name || entity.title);

        $p.html(data.entity.bio);

        var href = '';
        if(entity._entity_type == 'authority') {
            href = 'http://ideo-cairo.org/authority/' + entity.ideo_id + '?lang=ar';
        } else {
            href = 'http://ideo-cairo.org/work/view/' + entity.ideo_id + '?lang=ar';
        }

        $dlg
            .find("h2")
            .removeClass("loading")
            .html(
                _(entity._entity_type)
                + ' له '
                + ((data.rel['incoming'].length + data.rel['outgoing'].length))
                + ' علاقة في قاعدة البيانات '
            )
            .append( $('<br>') )
            .append(
                $('<a />')
                    .attr('target', '_blank')
                    .html(' زيارة صفحة ال'+_(entity._entity_type)+' بموقع الكندي 4')
                    .attr('href', href)
            );
        if(entity.alfehrest_id) {
            href = 'http://alfehrest.org/?lang=ar#!scholar=' + entity.alfehrest_id;
            $dlg
                .find("h2")
                .append( $('<br>') )
                .append(
                    $('<a />')
                        .attr('target', '_blank')
                        .html(' معاينة الكاتب على الخريطة ')
                        .attr('href', href)
                )
        }
         /*
        */
        function relSort(a, b) {
            //Author -[Wrote]-> Work relationship should always come first
            if (a.type == 'work.3' && a.firstEntityType != a.secondEntityType) {
                return -1;
            }
            //Author -[Wrote]-> Work relationship should always come first
            if (b.type == 'work.3'&& b.firstEntityType != b.secondEntityType) {
                return 1;
            }

            if(a.type > b.type) {
                return 1;
            }
            if(a.type < b.type) {
                return -1;
            }
            return 0;
        }

        var allRels = data.rel['outgoing'].concat(data.rel['incoming']);
        allRels.sort(relSort);

        $p.removeClass("loading");
        for(var i=0; i<allRels.length; i++) {

            var rel = allRels[i];

            var fromNode = null;
            var toNode   = null;
            var toName   =  'هذا ال' + _(entity._entity_type);
            var fromName =  'هذا ال' + _(entity._entity_type);
            var fromNameHTML = fromName;
            var toNameHTML = toName;

            //Outgoing relationship
            if(rel.firstEntityId === entity.id) {
                fromNode = entity;
                toNode   = rel.entity;
                toName = toNode.name || toNode.title;
                if(toNode._entity_type == 'authority') {
                    toNode = toNode.split('(')[0];
                }
                toNameHTML =
                    "<a href='javascript:void(0)' class='entity-link' data-id='" + toNode.id + "'>"
                    + toName
                    + "</a>";
            } else {
                fromNode   = rel.entity;
                toNode = entity;
                fromName = fromNode.name || fromNode.title;
                if(fromNode._entity_type == 'authority') {
                    fromName = fromName.split('(')[0];
                }
                fromNameHTML =
                    "<a href='javascript:void(0)' class='entity-link' data-id='" + fromNode.id + "'>"
                    + fromName
                    + "</a>";
            }


            var cssClasses = [
                    rel.firstEntityType,
                    rel.type.replace('.', '_').toString(),
                    rel.secondEntityType
                ];

            var relText =
                fromNameHTML
                + ' ← '
                + "<span class='rel " + cssClasses.join(" ") + "'>"
                + rel.label
                + "</span>"
                + ' ← '
                + toNameHTML;

            $ol.append($("<li />")
                .click(function(){
                    $(this).find('a').click();
                })
                .html(relText));
        }
        $ol.find('.entity-link').click(function(){
            var id = $(this).attr('data-id');
            loadDetails(id);
        });
        $p.parent().scrollTop(0);
        $dlg.simplebar('recalculate');

    });

}
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    var newArray = [];
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        newArray[currentIndex] = array[randomIndex];
        newArray[randomIndex] = temporaryValue;
    }

    return newArray;
}

function loadEntity(id) {
    var dfd = $.Deferred();
    if(fullDataset[id]) {
        selectNode(id, true);
        return dfd.resolve(id, fullDataset[id]).promise();
    }
    getEntityData(id).then(function(data){

        fullDataset[id] = {
            'loaded': true,
            'entity': data.entity,
            'rel'   : {
                'incoming': data.relationships['incoming'],
                'outgoing': data.relationships['outgoing']
            }
        };
        
        data.relationships['incoming'] = 
            shuffle(data.relationships['incoming']).slice(0, AlFehrestNS.Config('MAX_REL_COUNT'));
        data.relationships['outgoing'] = 
            shuffle(data.relationships['outgoing']).slice(0, AlFehrestNS.Config('MAX_REL_COUNT'));

        renderNewItems(id, data);
        dfd.resolve(id, fullDataset[id]);
    });
    return dfd.promise();
}



function restartNetwork() {
    if(graph) {
        fullDataset = {};
        graph.destroy();
        nodesDS.clear();
        edgesDS.clear();
    }

    var container = document.getElementById('graph-container');
    var $canvas   = null;
    // create an array with nodesDS
    nodesDS = new vis.DataSet();
    edgesDS = new vis.DataSet();

    var data = {
        nodes: nodesDS,
        edges: edgesDS
    };
    AlFehrestNS.data = data;

    var options = {
        nodes: {
            scaling: {
                min: 16,
                max: 32
            },
            font: {
                size: 16,
                face: 'Droid Arabic Naskh',
                strokeWidth: 1
            }
        },
        edges: {
            color: {
                'color': '#aa0000',
                'hover': '#00aa00',
                'highlight': '#0000aa'
            },
            font: {
                size: 14,
                face: 'Droid Arabic Naskh'
            },
            smooth: {
                type: 'dynamic'
            },
            selfReferenceSize: 75,
            length: 300,
            width: 0.1
        },
        interaction:{
            hover:true,
            navigationButtons: false
        },
        physics:{
            barnesHut:{
                gravitationalConstant:-15000,
                avoidOverlap:1
            },
            stabilization: {iterations:150}
        },
        groups: {
            work: {
                shape: 'image',
                image: image('work')
            },
            authority: {
                shape: 'image',
                image: image('person')
            }
        }
    };
    AlFehrestNS.Graph = graph = new vis.Network(container, data, options);
    $canvas   = $('#graph-container canvas');

    var dblClickTimeout = null;
    graph.on('stabilized', function(event){
        var hasSeenHelp = AlFehrestNS.LocalStorage.retrieve('SeenHelp');
        if(!hasSeenHelp){
            AlFehrestNS.LocalStorage.store("SeenHelp", true, -1);
            AlFehrestNS.HelpEngine.start();
        }
    });

    graph.on('doubleClick', function(event) {
        window.clearTimeout(dblClickTimeout);
        if(event.nodes.length) {
            if(!fullDataset[event.nodes[0]]) {
                loadEntity(event.nodes[0]);
            }
        }
    });
    graph.on('hoverNode', function(event){
        $canvas.css('cursor', 'pointer');
        //neighbourhoodHighlight(event.node);
    });
    graph.on('blurNode', function(event){
        $canvas.css('cursor', '');
        //neighbourhoodHighlight();
    });
    graph.on('hoverEdge', function(event){
        $canvas.css('cursor', 'pointer');
    });
    
    graph.on('dragStart', function(event){
        $canvas.css('cursor', 'grabbing');
        onSearchFieldBlurred();
    });
    graph.on('dragEnd', function(event){
        $canvas.css('cursor', '');
    });
    
    graph.on('blurEdge', function(event){
        $canvas.css('cursor', '');
        //neighbourhoodHighlight();
    });
    graph.on('click', function(event) {
        onSearchFieldBlurred();
        if(event.nodes.length) {
            window.clearTimeout(dblClickTimeout);
            dblClickTimeout = setTimeout(function(){
                selectNode(event.nodes[0], true);
                loadDetails(event.nodes[0]);
            }, 250);
        }
    });
}

document.addEventListener('DOMContentLoaded', function(){

    startup();
    getEntityList().then(function(a, b){
        var records = [];
        var data = [];
        records = records.concat(a);
        //records = records.concat(b[0]);
        for(var i=0; i<records.length; i++) {
            data.push({
                'id'    : records[i].id,
                'label' : records[i].name,
                'value' : records[i].name,
                'type'  : records[i].entity_type,
                'cb'    : onSearchItemSelected
            });
        }
        AlFehrestNS.SearchManager.attach($('#search-container input'));
        AlFehrestNS.SearchManager.register(data);
        
    });
    //loadEntity('tribe_4JkxGYypI6l');
    loadEntity(AlFehrestNS.Config('startupNodeId'));
});


function addLinks(data) {

    for(var idx in data.relationships) {
        for (var i = 0; i < data.relationships[idx].length; i++) {
            var rel = data.relationships[idx][i];
            var fromNode = nodesDS.get(rel.firstEntityId);
            var toNode = nodesDS.get(rel.secondEntityId);
            var fromName = fromNode.name || fromNode.title;
            var toName = toNode.name || toNode.title;

            rel.from = rel.firstEntityId;
            rel.to = rel.secondEntityId;

            rel.arrows= 'to';
            rel.font = {align: 'middle'};
            rel.title = fromName + ' ← ' + rel.label + ' ← ' + toName;


            try {
                edgesDS.add(rel);
            } catch(e) {
                //Do Nothing
            }
        }
    }
}

function addNodes(data) {
    //TODO: Avoid duplication

    var mainEntity = data.entity;
    var mainEntityType = mainEntity._entity_type;
    var mainEntityId = mainEntity.id;

    mainEntity.loaded = true;
    mainEntity.nodeType = 'entity';
    mainEntity.group = mainEntity._entity_type;
    setLabels(mainEntity);

    try {
        nodesDS.add(mainEntity);
    } catch(e) {
        //Do nothing
    }


    for(var idx in data.relationships) {
        for(var i=0 ;i<data.relationships[idx].length; i++) {
            var e = data.relationships[idx][i].entity;
            var id= e.id;
            var type= e._entity_type;
            e.nodeType = 'entity';
            e.loaded = false;
            e.group = type;
            setLabels(e);

            try {
                nodesDS.add(e);
            } catch(e) {
                //Do Nothing
            }
        }
    }

}

function renderNewItems(nodeId, data) {
    addNodes(data);
    addLinks(data);
    selectNode(nodeId, true);
}

function selectNode(nodeId, locked) {
    if (nodeId) {
        var opts = {};
        if(locked) {
            opts['locked'] = true;
            opts['scale'] = 0.5;
        } else {
            opts = {
                scale: 0.5,
                animation: {duration: 250, easingFunction: "easeInOutQuart"}
            };
        }
        graph.focus(nodeId, opts);
        graph.selectNodes([nodeId]);
    }
}

function image(name) {
    return AlFehrestNS.imagePath + name + '.png';
}

function startup() {

    setupDialogs();
    setupUIEvents();
    restartNetwork();
//    $("#info-panel").find('div').simplebar();


}

