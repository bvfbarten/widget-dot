var morphdom = require('morphdom');


exports.WidgetList = {};

/*
{
    templateId: string,
    id: string,
    data: object,
    functions: object,
    children: object,
    compile: function,
    renderString: function,
    renderHtml: function,
    init: function
}
*/
exports.Widget = function (args) {
    var self = this;

    //--functions
    self.data = function(fn, delay){
	if (fn === undefined) {
	    return self._data;
	}
	if (typeof(fn) == 'function') {
	    self._data = fn(self._data);
	    self.setNeedsRender();
	    self.render();
	    return;
	}
	if (delay) {
	    window.setTimeout(function() {
		self.setNeedsRender();
		self.render();
	    }, delay);
	    return self._data;
	}
	self.setNeedsRender();
	self.render();
	return self._data;
    };
    console.log(args);
    self.init = args['init'];
    self.setNeedsRender = function() {
	for (var key in this.children) {
	    this.children[key].data(1);
	}
	this.needs_render = 1;
    }
    self.extractData = function () {
	var extraData = self.$el.dataset['widgetData'];
	console.log(extraData, self.$el.dataset, self.$el.dataset['widgetData']);
	var s;
	if (extraData) {
	    s =  'extraData = ' + self.$el.dataset['widgetData'] ;
	    eval(s);
	    for(var i in extraData) {
		self.data(1)[i] = extraData[i];
	    }
	}
	s =  'var extraFunctions = ' + self.$el.dataset['widgetFunctions'] ;
	eval(s);
	console.log(extraFunctions);
	var functionPattern = /function\W*\(([\w|,]*)\)\W*(\{.*\})\W*/g;
	for (var i in extraFunctions) {
	    if (typeof(extraFunctions[i]) == typeof('')) {
		var functionContent = functionPattern.exec(extraFunctions[i]);
		console.log(functionContent, extraFunctions[i]);
		self.data(1)[i] = new Function(functionContent[1], functionContent[2]);
		console.log(i, self.data()[i]);
	    } else {
		self.data(1)[i] = extraFunctions[i];
	    }
	}
    }
    self.compileTemplate = function () {
	if (this.templateId) {
	    var content = document.querySelector(this.templateId).innerHTML;
	    var elem = document.createElement('textarea');
	    elem.innerHTML = content;
	    this.template = elem.value;
	    console.log(this.template);
	}
	if (typeof(self.compile) == 'function') {
	    this.compile();
	}

    }
    self.render = function() {
	window.setTimeout(function() {
	    if (self.needs_render) {
		var Data = function(item){
		    var datas = item.data();
		    var functions = item.functions;
		    for(var key in functions){
			this[key] = functions[key];
		    }
		    for(var key in datas){
			this[key] = datas[key];
		    }
		    this.data = self.data;
		};
		Data.prototype.toString = function() { return "WidgetList['" + args.id + "']" };
		var data = new Data(self);
		if (typeof(self.renderHtml) == 'function') {
		    self.$el.innerHTML = self.renderHtml(data) ;
		}
		var str = self.renderString(data) ;
		morphdom(self.$el, str, {childrenOnly: true});
	    }
	}, 0);
    }
    //--end functions

    self.children = {};	
    self.templateId = args.templateId;
    self.needs_render = false;
    self.id = args.id;
    self.$el = document.querySelector(self.id);
    exports.WidgetList[args.id] = self;
    self._data = args.data ? args.data : {};
    self.functions = args.functions;

    self.compile = args.compile;
    self.renderString = args.renderString;
    self.renderHtml = args.renderHtml;

    for(var i in args.functions) {
	self[i] = args.functions[i];
    }
    self.compileTemplate();

    if (typeof(args.data) == typeof([])) {
	for(var i in args.data) {
	    self.data(1)[i] = args.data[i];
	}
    }
    self.extractData();
    self.setNeedsRender();

    if (args.children) {
	var widgetConstructor;
	if (args._widgetConstructor) {
	    widgetConstructor = args._widgetConstructor;
	} else {
	    widgetConstructor = this.constructor;
	}
	for (var key = 0; key < args.children.length; key += 1) {

	    var line = new args._widgetConstructor(args.children[key]);
	    line.data(1).parent = self;
	    self.children[line.id] = line;
	}
    }
    if (typeof(self.init) == 'function') {
	self.init();
    }
    return self;
}
exports.widgetAuto = function (type) {
    if (type) {
	var s = document.currentScript; 
	if (s && s.hasAttribute('auto')) {
	    var elements = document.querySelectorAll('[data-widget-template-id]');
	    console.log(elements);
	    for(var elementCounter = 0; elementCounter < elements.length; elementCounter += 1) {
		var element = elements[elementCounter];
		var widgetArgs = {};
		widgetArgs['templateId'] = element.dataset['widgetTemplateId'];
		if (element.dataset['widgetId']) {
		    widgetArgs['id'] = element.dataset['widgetId']; 
		} else {
		    widgetArgs['id'] = '#' + element.id; 
		}
		window.setTimeout(function() {
		    new window[type](widgetArgs);
		}, 0);
	    }
	}
    } else {
	for(var key in WidgetList) {
	    exports.WidgetList[key].extractData();
	}
    }
}
