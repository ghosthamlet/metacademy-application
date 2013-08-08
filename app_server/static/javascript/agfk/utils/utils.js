/**
 * This file contains general purpose utility functions TODO create a namespace e.g. CUtil.function_name, etc
 */

(function(AGFK, $, undefined){
  "use strict";
  AGFK.utils = {};

  /**
   * Simple function that guesses a node title from a given tag
   * (currently replaces underscores with spaces)
   * TODO: this function may be unnecessary
   */
  AGFK.utils.getTitleGuessFromTag = function(tag){
    return tag.replace(/_/g," "); 
  };

  
  /**
   * Get spatial information about input dom element that contains an svg ellipse
   */
  AGFK.utils.getSpatialNodeInfo = function(inNode) {
    var ellp = inNode.getElementsByTagName("ellipse")[0];
    return {
      cx: Number(ellp.getAttribute("cx")),
      cy: Number(ellp.getAttribute("cy")),
      ry: Number(ellp.getAttribute("ry")),
      rx: Number(ellp.getAttribute("rx"))
    };
  };


  /**
   * Returns an x/y translated path of the input path;
   * NOTE: this function only works with absolute paths in the graphviz output
   * TODO also take into account relative paths
   */
  AGFK.utils.translateSvgPath = function(pathstr, tx, ty){
    throw new Error("translateSvgPath is not yet implemented");
  };


  /**
   * Simulate html/mouse events
   * modified code from http://stackoverflow.com/questions/6157929/how-to-simulate-mouse-click-using-javascript
   */
  AGFK.utils.simulate = (function(){
    var pvt = {};
    pvt.eventMatchers = {
      'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
      'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
    };
    pvt.defaultOptions = {
      pointerX: 0,
      pointerY: 0,
      button: 0,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      bubbles: true,
      cancelable: true,
      relatedTarget: null
    };

    return function(element, eventName) {
      var options = extend(pvt.defaultOptions, arguments[2] || {});
      var oEvent, eventType = null;

      for (var name in pvt.eventMatchers) {
        if (pvt.eventMatchers[name].test(eventName)) {
          eventType = name;
          break;
        }
      }

      if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

      if (document.createEvent) {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents') {
          oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        } else {
          oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                                options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                                options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, options.relatedTarget);
        }
        element.dispatchEvent(oEvent);
      } else {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
      }
      return element;

      function extend(destination, source) {
        for (var property in source)
          destination[property] = source[property];
        return destination;
      }
    };
  })();

  
  /**
   * Simple function to break long strings and insert a hyphen (idea from http://ejohn.org/blog/injecting-word-breaks-with-javascript/)
   * str: string to be potentially hyphenated
   * num: longest accecptable length -1 (single letters will not be broken)
   */
  AGFK.utils.wbr = function(str, num) {  
    return str.replace(RegExp("(\\w{" + num + "})(\\w{3," + num + "})", "g"), function(all,text, ch){
      return text + "-\\n" + ch;
    });
  };


  /**
   * Wrap a long string to avoid elongated graph nodes. Translated/modified from server technique
   */
  AGFK.utils.wrapNodeText = function(s, width) {
    if (!s) {
      return '';
    }

    var parts = s.split(" "),
	result = [],
	resArr = [],
	total = 0;

    for (var i = 0; i < parts.length; i++) {
      if (total + parts[i].length + 1 > width && total !== 0) {
        resArr.push(result.join(" "));
        result = [];
        total = 0;
      }
      result.push(AGFK.utils.wbr(parts[i], width));
      total += parts[i].length + 1;
    }
    resArr.push(result.join(" "));
    return resArr.join("\\n");
  };

  
  /**
   * Check if input is a url
   */
  AGFK.utils.isUrl = function(inStr) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(inStr);
  };


  /**
   * agfk specific helper function to control right panel width TODO BAD hardcoded css embeded
   */
  AGFK.utils.setRightPanelWidth = function(rp_width, rp_lmarg, rp_rmarg) {
    /*
     Changes display size of the right margin
     See corresponding CSS entries for description of values
     TODO remove hard coded CSS names
     */
    rp_width = rp_width || 0;
    rp_lmarg = rp_lmarg || 0;
    rp_rmarg = rp_rmarg || 0;
    var rper_width = rp_width + "%";

    $(".colcontainer").css("right", rper_width);
    $("#leftpanel").css("left", rper_width)
      .css("width", (100 - rp_width) + "%");
    $("#rightpanel").css("width", (rp_width - rp_lmarg - rp_rmarg) + "%")
      .css("left", (rp_width + rp_lmarg) + "%");
  };


  /**
   * Controls window/svg/div sizes in two panel display when resizing the window
   * NB: has jQuery dependency for x-browser support
   */
  AGFK.utils.scaleWindowSize = function(header_id, main_id) {
    var windowSize = {
      height: 0,
      mainHeight: 0,
      headerHeight: 0,
      setDimensions: function() {
        windowSize.height = $(window).height();
        windowSize.headerHeight = $('#' + header_id).height();
        windowSize.mainHeight = windowSize.height - windowSize.headerHeight;
        windowSize.updateSizes();
      },
      updateSizes: function() {
        $('#' + main_id).css('height', windowSize.mainHeight + 'px');
      },
      init: function() {
        if ($('#' + main_id).length) {
          windowSize.setDimensions();
          $(window).resize(function() {
            windowSize.setDimensions();
          });
        }
      }
    };
    windowSize.init();
  };

})(window.AGFK = typeof window.AGFK == "object" ? window.AGFK : {}, window.jQuery);