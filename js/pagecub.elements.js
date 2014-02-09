/* pagecub.elements.js */

/* version 0.2 - Christian Montoya, christianmontoya.net */

var elements = { 
	row: '<div class="row selected"></div>', 
	column: '<div class="col-md-12 selected"></div>', 
	dynamicColumn: function(num) { 
		return '<div class="col-md-'+num+' selected"></div>'; 
	}, 
	p: '<p>Lorem ipsum</p>', 
	ul: '<ul><li>Lorem ipsum</li></ul>', 
	ol: '<ol><li>Lorem ipsum</li></ol>'
}; 