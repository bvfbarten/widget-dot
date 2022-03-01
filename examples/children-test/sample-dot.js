
var widget = new WidgetDot({
	id: '#output',
	templateId: '#template',
	functions: {
		switchCurrentUrl: function() {
			this.isCurrentUrl = !this.isCurrentUrl;
		},
	},
	data: {
		name: 'Widget 1',
		url: 'https://www.youtube.com/embed/8xTdf55WtTA',
		isCurrentUrl: 0

	},
});

var widget2 = new WidgetDot({
	id: '#output2',
	templateId: '#templatechild',
	data: { 
		name: 'Widget 2',
		url: 'https://www.youtube.com/embed/vLfu09Cl61k',
	},
	parent: '#output',
	
});


