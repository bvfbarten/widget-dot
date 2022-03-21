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
    renderHtml: function,
}
*/
exports.Widget = function (args) {
	var self = this;

	//--functions
	self.data = function(fn, delay){
		var rtn = self._data;
		rtn.$el = self.$el;
		for(var key in self.functions) {
			rtn[key] = self.functions[key];
		}

		rtn.data = self.data;
		if (fn === undefined) {
			return rtn;
		}
		if (self.parent && !(rtn.parent)) {
			Object.defineProperty(rtn, 'parent', {
				get: function() {
					return WidgetList[self.parent].data
				}
			});
		}
		if (typeof(fn) == 'function') {
			rtn._fn = fn;
			rtn._fn();
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
	self.setNeedsRender = function() {
		for (var key = 0; key < this.children.length; key += 1) {
			exports.WidgetList[this.children[key]].data(1);
		}
		this.needs_render = 1;
	}
	self.extractData = function () {
		function processExtraFunctions(element) {
			var extraFunctions = {};
			if (element.dataset['widgetFunctions']) {
				var _self = self;
				extraFunctions = (function(){
					var self = _self.data();
					s =  'extraFunctions = ' + element.dataset['widgetFunctions'] ;
					eval(s);
					return extraFunctions;
				})();
			}
			var functionPattern = /function\W*\(([\w|,]*)\)\W*(\{.*\})\W*/g;
			for (var i in extraFunctions) {
				if (typeof(extraFunctions[i]) === typeof('')) {
					var functionContent = functionPattern.exec(extraFunctions[i]);
					self.functions[i] = new Function(functionContent[1], functionContent[2]);
				} else {
					self.functions[i] = extraFunctions[i];
				}
				self.data(1);
			}
		}
		if (self.$el.dataset['widgetParentId']) {
			self.addParent(self.$el.dataset['widgetParentId']);
			delete(self.$el.dataset['widgetParentId']);
		}

		var template = self.templateId ? document.querySelector(self.templateId) : null;
		if (self.templateId) {
			processExtraFunctions(template);
		}
		processExtraFunctions(self.$el);
		delete(self.$el.dataset['widgetFunctions']);

		var extraData = self.$el.dataset['widgetData'];
		var s;
		if (extraData) {
			s =  'extraData = ' + self.$el.dataset['widgetData'] ;
			eval(s);
			for(var i in extraData) {
				self.data()[i] = extraData[i];
			}
			self.data(1);
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
					if (self.parent) {
						this.parent = item.data().parent;
					}
				};
				Data.prototype.toString = function() { return "WidgetList['" + args.id + "'].data(1)" };
				var data = new Data(self);
				var str = self.renderHtml(data);
				if (str) {
					morphdom(self.$el, str, {childrenOnly: true});
				}
			}
		}, 0);
	}
	self.addParent = function(id){
		self.parent = id;
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
	self.functions = args.functions ? args.functions : {};

	self.compile = args.compile;
	if (args.render) {
		self.renderHtml = args.render;
	} else {
		self.renderHtml = args.renderHtml;
		self.compileTemplate();
	}
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
	
	if (self.functions && typeof(self.functions.__init) == 'function') {
		self.data(self.data().__init);
	}
	return self;
}
autoType = null;
exports.widgetAuto = function (type) {
	if (type) {
		autoType = type;
	}
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
	for(var key in exports.WidgetList) {
		var line = exports.WidgetList[key];
		exports.WidgetList[key].extractData();
	}
}
window.setInterval(exports.widgetAuto, 25);
