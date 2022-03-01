var widget = new WidgetDot({
    id: '#output',
    templateId: '#table-template',
    data: {
	pageSize: 10,
	search: "",
	pageOffset: 0,
	_sortInfo : [null,null],
	sortByColumn: function(key) {
	    if (this._sortInfo[0] == key) {
		if (this._sortInfo[1] == 'asc') {
		    this._sortInfo[1] = 'desc';
		} else {
		    this._sortInfo[1] = 'asc';
		}
	    } else {
		this._sortInfo[0] = key;
		this._sortInfo[1] = 'asc';
	    }
	},
	keys: [
	    ["zip_code", "Zip Code"],
	    ["zip_code_type", "Zip Code Type"],
	    ["city", "City"],
	    ["state", "State"],
	    ["location_type", "Location Type"],
	    ["lat", "Latitude"],
	    ["long", "Longitude"],
	    ["location", "Location"],
	    ["decommisioned", "Decommissioned"],
	    ["tax_returns_filed", "Tax Returns Filed"],
	    ["estimated_population", "Estimated Population"],
	    ["total_wages", "Total Wages"]
	],
	allRows: [],
	updateSearch: function(newSearch) {
	    this.search = newSearch;
	    this.pageOffset = 0;
	},
	displayedRowsCount: 0,
	rows: function() {
	    var rowOffset = this.pageSize * this.pageOffset;
	    if (this.search) {
		var filteredRows = [];
		var search = this.search.toLowerCase();
		for (var i = 0; i < this.allRows.length; i +=1) {
		    var row = this.allRows[i];
		    for(var k = 0; k < this.keys.length; k += 1) {
			if (
			    row[this.keys[k][0]].toLowerCase().search(
				search
			    ) > -1
			) {
			filteredRows.push(row);
			break;
			}
		    }
		}
	    } else {
		var filteredRows = this.allRows;
	    }
	    if (this._sortInfo[0] !== null) {
		
		if (this._sortInfo[1] == 'asc') {
		    var modifier = 1;
		}
		if (this._sortInfo[1] == 'desc') {
		    var modifier = -1;
		}
		var self = this;
		sortable = function(a, b) {
		    var A = a[self._sortInfo[0]];
		    var B = b[self._sortInfo[0]];
		    if (typeof(A) == 'string' && typeof(B) == 'string') {
			if (parseFloat(A) == A && parseFloat(B) == B) {
			    A = parseFloat(A);
			    B = parseFloat(B);
			}
		    }
		    if (A > B) {
			return 1 * modifier;
		    }
		    if (A == B) {
			return 0;
		    }
		    if (A < B) {
			return -1 * modifier;
		    }
		};
		filteredRows.sort(sortable)
	    }
	    this.displayedRowsCount = filteredRows.length;
	    var rtn = [];
	    for (var i = rowOffset; i < filteredRows.length && i < (rowOffset + this.pageSize); i += 1) {
		rtn.push(filteredRows[i]);
	    }
	    return rtn;
	},
    }, init: function() {
    }
});

