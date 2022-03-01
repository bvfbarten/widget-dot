var widget = new WidgetDot({
	id: '#output',
	templateId: '#template',
	functions: {
	},
	data: {

		switchCurrentUrl: function() {
			this.isCurrentUrl = (this.isCurrentUrl + 1) % 2;
		},
		name: 'test',
		url: 'https://www.youtube.com/embed/8xTdf55WtTA',
		isCurrentUrl: 0

	},
	children: [ 
		{
			id: '#output2',
			templateId: '#templatechild',
			data: { 
				url: 'https://www.youtube.com/embed/8xTdf55WtTA',
			}
		},
	],

});


