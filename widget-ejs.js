function WidgetEjs(args) {

    args.compile = function() {

	if (args.ejsOptions === undefined) {
	    args.ejsOptions = {};
	}
	args.ejsOptions.openDelimiter = args.ejsOptions.openDelimiter ? args.ejsOptions.openDelimiter : '{';
	args.ejsOptions.closeDelimiter = args.ejsOptions.closeDelimiter ? args.ejsOptions.closeDelimiter : '}';
	this.compiled = ejs.compile(this.template, args.ejsOptions);		
    }
    args.renderString = function(data) {
	var rtn = this.compiled(data);
	return rtn;
    }

    var rtn = new Widget(args);
    for (var key in rtn) {
	this[key] = rtn[key];
    }

    return this;
}
