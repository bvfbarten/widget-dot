var doT = require('../dist/doT');
var Widget = require('./widget.js').Widget;
window.WidgetList = require('./widget.js').WidgetList;
window.widgetAuto = require('./widget.js').widgetAuto;
window.WidgetDot = function(args) {

	args.compile = function() {

		if (args.dotOptions === undefined) {
			args.dotOptions = {};
		}
		var dotOptions = {
			evaluate:    /\{\%([\s\S]+?(\}?)+)\%\}/g,
			interpolate: /\{\%=([\s\S]+?)\%\}/g,
			encode:      /\{\%!([\s\S]+?)\%\}/g,
			use:         /\{\%#([\s\S]+?)\%\}/g,
			useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
				define:      /\{\%##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\%\}/g,
				defineParams:/^\s*([\w$]+):([\s\S]+)/,
				conditional: /\{\%\?(\?)?\s*([\s\S]*?)\s*\%\}/g,
				iterate:     /\{\%~\s*(?:\%\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\%\})/g,
				varname:	"self",
				strip:		true,
				append:		true,
				selfcontained: false,
				doNotSkipEncoded: false
				}
	for(var key in dotOptions) {
		args.dotOptions[key] = dotOptions[key];
	}
	doT.templateSettings = args.dotOptions;
	this.compiled = doT.template(this.template);
	}
	args.renderString = function(data) {
		var rtn = this.compiled(data);
		return rtn;
	}
	args._widgetConstructor = this.constructor;

	var rtn = new Widget(args);
	for (var key in rtn) {
		this[key] = rtn[key];
	}
}
widgetAuto('WidgetDot');
