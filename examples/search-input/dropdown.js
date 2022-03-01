var widget = new WidgetDot({
    id: '#dropdown-output',
    templateId: '#dropdown-template',
    data: {
	filteredItems: function() {
	    return this.items.filter(
		i => i.startsWith(this.search)
	    )
	} 
    }
});

