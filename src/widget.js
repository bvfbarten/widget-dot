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
    init: function
}
*/
exports.Widget = function (args) {
	var self = this;

	//--functions
	self.data = function(fn, delay){
		var rtn = self._data;
		/*
		for(var key in self._data) {
			rtn[key] = self._data[key];
		}
		*/
		for(var key in self.functions) {
			rtn[key] = self.functions[key];
		}
		if (fn === undefined) {
			return rtn;
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
			return rtn;
		}
		self.setNeedsRender();
		self.render();
		return rtn;
	};
	self.init = args['init'];
	self.setNeedsRender = function() {
		for (var key = 0; key < this.children.length; key += 1) {
			exports.WidgetList[this.children[key]].data(1);
		}
		this.needs_render = 1;
	}
	self.extractData = function () {

		if (self.$el.dataset['widgetParent']) {
			self.addParent(self.$el.dataset['widgetParent']);
			delete(self.$el.dataset['widgetParent']);
		}


		self.init = self.$el.dataset['widgetInit'] ? self.$el.dataset['widgetInit'] : self.init;
		delete(self.$el.dataset['widgetInit']);
		s =  'var extraFunctions = ' + self.$el.dataset['widgetFunctions'] ;
		eval(s);
		var functionPattern = /function\W*\(([\w|,]*)\)\W*(\{.*\})\W*/g;
		for (var i in extraFunctions) {
			if (typeof(extraFunctions[i]) === typeof('')) {
				var functionContent = functionPattern.exec(extraFunctions[i]);
				self.functions[i] = new Function(functionContent[1], functionContent[2]);
			} else {
				self.functions[i] = extraFunctions[i];
			}
		}
		delete(self.$el.dataset['widgetFunctions']);

		var extraData = self.$el.dataset['widgetData'];
		var s;
		if (extraData) {
			s =  'extraData = ' + self.$el.dataset['widgetData'] ;
			eval(s);
			for(var i in extraData) {
				self.data(1)[i] = extraData[i];
			}
		}
		delete(self.$el.dataset['widgetData']);
	}
	self.compileTemplate = function () {
		if (this.templateId) {
			var content = document.querySelector(this.templateId).innerHTML;
			var elem = document.createElement('textarea');
			elem.innerHTML = content;
			this.template = elem.value;
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
					for(var key in datas){
						this[key] = datas[key];
					}
					this.data = self.data;
				};
				Data.prototype.toString = function() { return "WidgetList['" + args.id + "']" };
				var data = new Data(self);
				var str = self.renderString(data) ;
				morphdom(self.$el, str, {childrenOnly: true});
			}
		}, 0);
	}
	self.addParent = function(id){
		self._data.parent = exports.WidgetList[id];
		exports.WidgetList[id].children.push(self.id);
	}
	//--end functions

	self.children = [];
	self.templateId = args.templateId;
	self.needs_render = false;
	self.id = args.id;
	self.$el = document.querySelector(self.id);
	
	exports.WidgetList[args.id] = self;
	self._data = args.data ? args.data : {};
	if (args.parent) {
		self.addParent(args.parent);
	}
	self.functions = args.functions;

	self.compile = args.compile;
	self.renderString = args.renderString;

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
		self.children = args.children;
	}
	if (typeof(self.init) == 'function') {
		self.init();
	}
	return self;
}
autoType = null;
exports.widgetAuto = function (type) {
	if (type) {
		autoType = type;
	}
	var s = document.currentScript; 
	var elements = document.querySelectorAll('[data-widget-template-id]');
	for(var elementCounter = 0; elementCounter < elements.length; elementCounter += 1) {
		var element = elements[elementCounter];
		var widgetArgs = {};
		widgetArgs['templateId'] = element.dataset['widgetTemplateId'];
		if (element.dataset['widgetId']) {
			widgetArgs['id'] = element.dataset['widgetId']; 
		} else {
			widgetArgs['id'] = '#' + element.id; 
		}
		(function(type, widgetArgs, element) {
			window.setTimeout(function() {
				new window[autoType](widgetArgs);
				delete(element.dataset['widgetTemplateId']);
			}, 0);
		})(type, widgetArgs, element);
	}
	for(var key in WidgetList) {
		exports.WidgetList[key].extractData();
	}
}
