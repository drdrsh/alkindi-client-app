
$dlgDetails = null;
$dlgAbout   = null;

var graph = null;
var timeline = null;
var fullDataset = {};
var nodesDS     = null;
var edgesDS     = null;
var entityDS    = null;
var timelineDS  = null;
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

    $dlg.find("h2").html('');
    $dlg.find("h3").addClass("loading").html('');
    var nodeData = nodesDS.get(id);
    if(nodeData) {
        $dlg.find("h2").html(nodeData.name || nodeData.title);
    }

    $main.addClass("is-slid");
    $side.addClass("is-slid");

    loadEntity(id).then(function(id, data) {

        var entity = data.entity;
        var title= entity.name || entity.title;

        $dlg
            .find("h2")
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
            .find("h3")
            .removeClass("loading")
            .html(
                _(entity._entity_type)
                + ' له '
                + ((data.rel['incoming'].length + data.rel['outgoing'].length))
                + ' علاقة في قاعدة البيانات '
            )
            .append(
                $('<a />')
                    .attr('target', '_blank')
                    .html(' زيارة صفحة ال'+_(entity._entity_type)+' بموقع الكندي 4')
                    .attr('href', href)
            );
        if(entity.alfehrest_id) {
            href = 'http://alfehrest.org/?lang=ar#!scholar=' + entity.alfehrest_id;
            $dlg
                .find("h3")
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
        if(timeline) {
            timeline.destroy();
        }
        nodesDS.clear();
        edgesDS.clear();
        timelineDS.clear();
    }

    var graph_container    = document.getElementById('graph-container');
    var timeline_container = document.getElementById('timeline-container');
    var $canvas   = null;

    // create an array with nodesDS
    nodesDS = new vis.DataSet();
    edgesDS = new vis.DataSet();
    timelineDS = new vis.DataSet();
    timelineDS.add([
        {id: 'A', content: 'الخلفاء الراشدون', start: '632-01-01', end: '661-01-01', type: 'background', className:'rashidon'},
        {id: 'B', content: 'الخلافة الأموية', start: '661-01-01', end: '750-01-01', type: 'background', className:'umayyad'},
        {id: 'C', content: 'الخلافة العباسية', start: '750-01-01', end: '1258-01-01', type: 'background', className: 'abbasid'},
        {id: 'E', content: 'الخلافة العثمانية', start: '1517-04-01', end: '1923-07-24', type: 'background', className: 'ottomons'}
    ]);


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

    var timelineOptions = {
        stack: false,
        showCurrentTime: false,
        zoomMax: 30758400000 * 1500,
        zoomMin: 30758400000 * 10
    };

    AlFehrestNS.Graph = graph = new vis.Network(graph_container, data, options);
    if($(window).width() > 500){
        AlFehrestNS.Timeline = timeline =  new vis.Timeline(timeline_container, timelineDS, timelineOptions);
        timeline.on('select', function(event) {
            selectNode(event.items[0], true);
        });
    }

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

function addEntityToTimeline(data) {
    var entities = [data.entity];
    for(var idx in data.relationships) {
        var rels = data.relationships[idx];
        for(var i=0; i<rels.length; i++) {
            entities.push(rels[i].entity);
        }
    }
    var l = entities.length;
    for(x=0; x<l; x++) {
        var r = entities[x];

        if (r._entity_type == 'work') {
            continue;
        }
        /*
        if (r.entity_type == 'work') {
            if (r.year_value === null) {
                return;
            }
            if (r.year_type === 'h') {
                var JD = $.calendars.instance('islamic').newDate(r.year_value, 5, 1).toJD();
                var g = $.calendars.instance('gregorian').fromJD(JD);
                r.year_type = 'g';
                r.year_value = g._year;
            }
            r.start = new Date(r.year_value, 5, 5);
            r.content = r.title;
            r.type = 'point';
            //timelineDS.add(r);
        }
        */

        if (r._entity_type == 'authority') {
            if (!r.dates.born.year && !r.dates.died.year) {
                return;
            }

            if(!r.dates.born.year) {
                r.dates.born.year = r.dates.born.year - 60;
                r.className = "born-approx";
            }
            if(!r.dates.died.year) {
                r.dates.died.year = r.dates.born.year + 60;
                r.className = "died-approx";
            }

            if (r.dates.type === 'h') {
                var bornJD = $.calendars.instance('islamic').newDate(r.dates.born.year, 5, 1).toJD();
                var diedJD = $.calendars.instance('islamic').newDate(r.dates.died.year, 5, 1).toJD();
                var bornG = $.calendars.instance('gregorian').fromJD(bornJD);
                var diedG = $.calendars.instance('gregorian').fromJD(diedJD);
                r.dates.born.year= bornG._year;
                r.dates.died.year= diedG._year;
            }

            r.start =r.dates.born.year + "-05-05";
            r.end = r.dates.died.year  + "-05-05";

            r.content = r.name;
            console.log(r.content);
            try {
                timelineDS.add(r);
            } catch(e) {}
        }

    }
}


document.addEventListener('DOMContentLoaded', function(){

    $(window).resize(function(){
       if(!timeline) {
           $('#timeline-container').hide('fast');
       }
    });
    startup();
    getEntityList().then(function(a, b) {

        var records = [].concat(a[0], b[0]);

        entityDS = new vis.DataSet();
        entityDS.add(records);

        AlFehrestNS.SearchManager.attach($('#search-container input'));
        AlFehrestNS.SearchManager.register(entityDS, onSearchItemSelected);

    });
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
    if(timeline) {
        addEntityToTimeline(data);
    }
    selectNode(nodeId, true);
}

function selectNode(nodeId, locked) {
    if (nodeId) {
        var opts = {};
        if(locked) {
            opts = {
                locked: true
            }
        } else {
            opts = {
                animation: {duration: 250, easingFunction: "easeInOutQuart"}
            };
        }
        opts['scale']  = 0.5;
        opts['offset'] = { x:0, y:0};
        var remainingSpace = $('#side-panel').offset().left / 2;
        var windowCenterX = $(window).width() / 2;
 
        if(remainingSpace > 10) {
            opts.offset.x = remainingSpace - windowCenterX;
        }

        graph.focus(nodeId, opts);
        graph.selectNodes([nodeId]);
        try {
            timeline.setSelection([nodeId], {focus:true})
        } catch(e) {}
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

