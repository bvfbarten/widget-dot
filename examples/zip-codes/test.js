
var data = function(){
    function Rtn() {
	this.a = 'b';
	this.c = 'd';
    }
    Rtn.prototype.toString = function() {
	return JSON.stringify(this);
    };
    var rtn = new Rtn;
    return rtn;
};

var a = data();
console.log(a);
console.log("" + a);
