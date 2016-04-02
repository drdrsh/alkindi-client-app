(function(){
    "use strict";
    var customStyleEl = null;
    var helpStrings = [];

    function addStylesheetRules(rawRules) {

        if(customStyleEl) {
            customStyleEl.parentNode.removeChild(customStyleEl);
        }

        var styleEl = customStyleEl = document.createElement('style');
        document.head.appendChild(styleEl);

        for(var i=0; i<rawRules.length; i++) {
            styleEl.sheet.insertRule(rawRules[i], 0);
        }

    }


    function pickRandomProperty(obj) {
        var result;
        var count = 0;
        for (var prop in obj){
            if (Math.random() < 1/++count){
                result = prop;
            }
        }
        return result;
    }

    var currentBubbleParams = null;


    var isHelpRunning = false;
    var currentStep = 0;
    var steps = [];

    function onNext() {
        if (currentStep == steps.length - 1) {
            onClose();
        } else {
            next();
        }
    }

    function onPrevious() {
        previous();
    }

    function onClose() {
        if(!isHelpRunning) {
            return;
        }
        isHelpRunning = false;
        $('#help-bubble').remove();
        currentStep = 0;
    }

    function displayHelpBubble(params) {

        currentBubbleParams = params;

        var isInitialized = true;
        var $tt = null;
        var $p = null;
        var $next = null;
        var $previous = null;
        var $close = null;
        if ($('#help-bubble').length === 0) {
            isInitialized = false;
            $('body').prepend(
                $('<div />')
                    .attr('id', 'help-bubble')
                    .append($('<p />'))
                    .append($('<div class="close">&#215;</div>'))
                    //.append($('<button class="previous"></button>'))
                    .append($('<button class="next"></button>'))
            );
        }

        $tt = $('#help-bubble');
        $p = $('p', $tt);
        $next = $('.next', $tt);
        $previous = $('.previous', $tt);
        $close = $('.close', $tt);

        currentBubbleParams.$bubble = $tt;

        if(!isInitialized) {
            $next.html('حَـسَـنٌ');
            $previous.html('Previous');
            $next.click(onNext);
            $previous.click(onPrevious);
            $close.click(onClose);
            isInitialized = true;
        }

        var tooltipHeight = 30;

        $next.show();
        if(currentStep == steps.length - 1) {
            $next.html('إِنْهَاء');
        }

        $previous.show();
        if(currentStep == 0) {
            $previous.hide();
        }

        $p.html(params.text);

        $tt.removeAttr('style');
        $tt.removeAttr('class');
        $tt.addClass('visible');

        layoutBubble();
        $next.focus();
        
    }

    function layoutBubble() {

        if (!currentBubbleParams) {
            return;
        }

        var $ib = currentBubbleParams.$bubble;

        if (!$ib.is(':visible')) {
            return
        }
        if (!currentBubbleParams.target) {
            if (currentBubbleParams.left !== undefined) {
                $ib.css('left', currentBubbleParams.left + 'px');
            }
            if (currentBubbleParams.top !== undefined) {
                $ib.css('top', currentBubbleParams.top + 'px');
            }
            if (currentBubbleParams.right !== undefined) {
                $ib.css('right', currentBubbleParams.right + 'px');
            }
            if (currentBubbleParams.bottom !== undefined) {
                $ib.css('bottom', currentBubbleParams.bottom + 'px');
            }
            return;
        }

        var $target = $(currentBubbleParams.target);
        var targetData = $target.offset();

        targetData['width'] = $target.width();
        targetData['height'] = $target.height();
        var screen = {
            width: $(window).width(),
            height: $(window).height()
        };

        var bubbleSize = {
            width: $ib.width(),
            height: $ib.height()
        };
        var bubbleLeft = 0;
        var bubbleTop = 0;
        var arrowPosition = null;

        var shiftX = 0;
        var shiftY = 0;
        switch (currentBubbleParams.relation) {
            case 'top':
                bubbleLeft = targetData.left + (targetData.width / 2) - (bubbleSize.width / 2);
                bubbleTop = targetData.top - bubbleSize.height - 32;
                arrowPosition = 'bottom';
                break;
            case 'bottom':
                bubbleLeft = targetData.left + (targetData.width / 2) - (bubbleSize.width / 2);
                bubbleTop = targetData.top + targetData.height + 32;
                arrowPosition = 'top';
                break;
            case 'left':
                bubbleLeft = targetData.left - bubbleSize.width - 32;
                bubbleTop = targetData.top + (targetData.height / 2) - (bubbleSize.height / 2);
                arrowPosition = 'right';
                break;
            case 'right':
                bubbleLeft = targetData.left + targetData.width + 32;
                bubbleTop = targetData.top + (targetData.height / 2) - (bubbleSize.height / 2);
                arrowPosition = 'left';
                break;
        }

        shiftX = screen.width - (bubbleLeft + bubbleSize.width + 20);
        shiftY = screen.height - (bubbleTop + bubbleSize.height + 20);

        bubbleLeft += shiftX < 0 ? shiftX : 0;
        bubbleTop += shiftY < 0 ? shiftY : 0;
        if(bubbleLeft < 0) {
            bubbleLeft = 10;
        }
        if(bubbleTop < 0){
            bubbleTop = 10;
        }


        var selectorName = ".triangle-border." + arrowPosition + ":";

        var diffX = 0;
        var diffY = 0;
        if(bubbleSize.width >= targetData.width) {
            diffX = bubbleLeft - targetData.left;
        }
        if(bubbleSize.height >= targetData.height) {
            diffY = bubbleTop - targetData.top;
        }

        console.log(diffX, diffY);
        if(arrowPosition == 'left' || arrowPosition == 'right') {
            addStylesheetRules([
                selectorName + 'before' + "{ top : " + Math.abs(diffY) + "px }",
                selectorName + 'after' + "{ top : " + Math.abs(diffY) + "px }"
            ]);
        } else {
            addStylesheetRules([
                selectorName + 'before' + "{ left : " + Math.abs(diffX) + "px }",
                selectorName + 'after' + "{ left: " + Math.abs(diffX) + "px }"
            ]);
        }

        $ib.css({left: bubbleLeft + 'px', top: bubbleTop + 'px'});
        if (currentBubbleParams.arrow) {
            $ib.addClass('triangle-border ' + arrowPosition);
        }
    }

    function hideHelpBubble() {
        $('#help-bubble').css('display', 'none');
    }


    function step1() {
        graph.stabilize();
        displayHelpBubble({left: 20, top: 20, text: helpStrings[0]});
    }

    var firstNode = null;
    var secondNode= null;
    var edge      = null;
    function step2() {

        var graph  = AlFehrestNS.Graph;
        var nodeDS = AlFehrestNS.data.nodes;
        var edgeDS = AlFehrestNS.data.edges;

        var edgeId = pickRandomProperty(edgeDS._data);
        var nodesIds = graph.getConnectedNodes(edgeId);

        firstNode  = nodeDS.get(nodesIds[0]);
        secondNode = nodeDS.get(nodesIds[1]);
        edge       = edgeDS.get(edgeId);
        centerOnNode([firstNode.id, secondNode.id], function() {
            graph.selectEdges([edgeId], true);
            displayHelpBubble({left: 20, top: 20, text: helpStrings[1]});
        });
    }

    function step3() {
        var str = helpStrings[2]
            .replace('$1', firstNode.label)
            .replace('$2', edge.label)
            .replace('$3', secondNode.label);
        centerOnNode([firstNode.id, secondNode.id], function(){
            displayHelpBubble({left: 20, top: 20, text: str});
        });
    }

    function step4() {
        centerOnNode([firstNode.id, secondNode.id], function(){
            displayHelpBubble({left: 20, top: 20, text: helpStrings[3]});
        });
    }

    function step5(){
        displayHelpBubble( {left: 20, top: 20, text: helpStrings[4]});
    }

    function step6() {
        displayHelpBubble( {target:'#timeline-container', relation:'top', arrow: true, text: helpStrings[5]});
    }

    function step7() {
        displayHelpBubble( {target:'.search', relation:'left', arrow: true, text: helpStrings[6]});
    }

    function step8() {
        displayHelpBubble( {target:'.social-media-pane', relation:'left', arrow: true, text: helpStrings[7]});
    }



    function centerOnNode(node, cb) {
        var duration = 500;
        if(Array.isArray(node)) {
            AlFehrestNS.Graph.fit({
                nodes: node,
                scale: 1.5,
                animation: {duration: duration, easingFunction: "easeInOutQuart"}
            });
        } else {
            AlFehrestNS.Graph.focus(node, {
                scale: 2.0,
                animation: {duration: duration, easingFunction: "easeInOutQuart"}
            });
        }
        setTimeout(cb, duration);
    }

    function start() {
        steps = [];
        steps.push(step1);
        steps.push(step2);
        steps.push(step3);
        steps.push(step4);
        steps.push(step5);
        if(AlFehrestNS.Timeline) {
            steps.push(step6);
        }
        steps.push(step7);
        steps.push(step8);

        isHelpRunning = true;
        helpStrings = _('help_steps');

        currentStep = -1;
        next();
    }

    function next() {
        if(currentStep >= steps.length){
            //TODO :end help
            return;
        }
        currentStep++;
        (steps[currentStep])();
    }

    function previous() {
        if(currentStep <= 0){
            //TODO :end help
            return;
        }
        currentStep--;
        (steps[currentStep])();

    }

    $(window).resize(function(){
        layoutBubble();
    });

    var helpEngine = {
        next: next,
        previous: previous,
        start: start,
        close: onClose
    };
    AlFehrestNS.HelpEngine = helpEngine;
}());