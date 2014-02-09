/* pagecub.js */

// jQuery plugins

jQuery.fn.extend({
	setEndOfContenteditable: function() {
    var contentEditableElement = $(this).get(0); 
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    { 
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
	}
}); 

var app = {}; 

!function ($) {

  $(function(){

		var $window = $(window); 
    var $body   = $(document.body);
    var $page 	= $('div#page'); 
		
		app = { 
  		addRow: function() { 
  			// adding a row 'deselects' any currently selected row/column
  			$page.find(".selected").removeClass('selected'); 
  			$page.append(elements.row); 
  			$page.find('.row.selected').append(elements.column); 
  			// bind click handler to select this row
  			$page.find('.selected').click( app.selectElement ); 
  			// also bind click handler to select column in this row 
  			$page.find('div[class*="col-"].selected').click( app.selectElement ).dblclick( app.onDblClickColumn ); 
  			
  			// update controls as needed
				app.pageChanged();
  		}, 
  		removeRow: function() { 
  			$page.find('.row.selected').next('.row').addClass('selected').find("div[class*='col-']:last").addClass('selected'); 
  			$page.find('.row.selected:first').remove(); 
  			if( $page.find('.row.selected').length < 1 ) { 
  				// we deleted the last row, so now we need to select the new last row
  				$page.find('.row:last').addClass('selected').find("div[class*='col-']:last").addClass('selected'); 
  			} 
  			
  			// update controls as needed
				app.pageChanged();
  		}, 
  		addColumn: function() { 
  			// we measure the # of columns and add a column based on that
  			var numColumns = $page.find(".row.selected div[class*='col-']").length; 
  			if(numColumns >= 4) { 
  				app.showErrorAlert('Maximum Column Limit','Maximum allowed columns per row is 4'); 
  				return; 
  			}
  			numColumns = numColumns+1; 
  			var columnSize = 12/numColumns; 
  			// toggle selected column 
  			$page.find(".row.selected div[class*='col-'].selected").removeClass('selected'); 
  			// adjust size of columns
  			$page.find(".row.selected div[class*='col-']").removeClass(function(index,css) { 
  				return (css.match(/\bcol-md-\d+/g) || []).join(' '); // finding any col-md-[0-9]+
  			}).addClass('col-md-'+columnSize);
  			// add new column
  			$page.find(".row.selected").append(elements.dynamicColumn(columnSize));  
  			// this is one way to do this. there could be more clever ways!
  			
  			// bind click handler to select this column, and double click handler to select and edit this column 
  			$page.find('div[class*="col-"].selected').click( app.selectElement ).dblclick( app.onDblClickColumn ); 
  			
  			// update controls as needed
				app.pageChanged();
  		}, 
  		removeColumn: function() { 
  			if($page.find(".row.selected div[class*='col-']").length < 2) { 
  				app.showErrorAlert('Minimum Column Limit',"You cannot remove the last column in a row; remove the row instead"); 
  				return; 
  			}
  			$page.find("div[class*='col-'].selected").next("div[class*='col-']").addClass('selected'); 
  			$page.find("div[class*='col-'].selected:first").remove(); 
  			if( $page.find("div[class*='col-'].selected").length < 1 ) { 
  				// we deleted the last column, so now we need to select the new last column
  				$page.find(".row.selected div[class*='col-']:last").addClass('selected'); 
  			}
  			// resize columns
  			var numColumns = $page.find(".row.selected div[class*='col-']").length; 
  			var columnSize = 12/numColumns; 
  			// adjust size of columns
  			$page.find(".row.selected div[class*='col-']").removeClass(function(index,css) { 
  				return (css.match(/\bcol-md-\d+/g) || []).join(' '); // finding any col-md-[0-9]+
  			}).addClass('col-md-'+columnSize);
  			
  			// update controls as needed 
  			app.pageChanged(); 
  		}, 
  		expandColumn: function() { 
  			app.columnScale(1); 
  		}, 
  		contractColumn: function() { 
  			app.columnScale(-1); 
  		}, 
  		columnScale: function(scaleFactor) { 
  			if($page.find("div[class*='col-'].selected").length < 1) { 
  				app.showErrorAlert('No Column Selected',"Please select a column to continue (click on a column to select it)"); 
  				return; 
  			}
  			// first, let's get the col-md-[0-9]+ class
  			var columnWidthClass = $.grep($("div[class*='col-'].selected").attr('class').split(/\s+/), function(v, i){
					return v.search(/\bcol-md-\d+/) === 0;
				}).join();
				var columnWidthArray = columnWidthClass.split('-'); 
				var columnWidthNumber = 0; 
				if(columnWidthArray.length > 2) { 
					columnWidthNumber = parseInt(columnWidthArray[2]); 
				}
				// real simple, let's just modify by scale factor
				var columnWidthNewNumber = columnWidthNumber + parseInt(scaleFactor); 
				if(columnWidthNewNumber < 1) { 
					app.showErrorAlert('Column Minimum Size',"Sorry, that column is as narrow as it can be"); 
					return; 
				} 
				else if(columnWidthNewNumber > 12) { 
					app.showErrorAlert('Column Max Size',"Sorry, that column is as wide as it can be"); 
					return; 
				}
				// update column width
				$page.find("div[class*='col-'].selected").removeClass(function(index,css) { 
  				return (css.match(/\bcol-md-\d+/g) || []).join(' '); // finding any col-md-[0-9]+
  			}).addClass('col-md-'+columnWidthNewNumber);
				
				// update controls as needed
				app.pageChanged(); 
  		}, 
  		addOffset: function() { 
  			app.columnOffset(1); 
  		}, 
  		subtractOffset: function() { 
  			app.columnOffset(-1); 
  		}, 
  		columnOffset: function(offsetFactor) { 
  			if($page.find("div[class*='col-'].selected").length < 1) { 
  				app.showErrorAlert('No Column Selected',"Please select a column to continue (click on a column to select it)"); 
  				return; 
  			}
  			// first, let's get the col-md-offset-[0-9]+ class 
  			var columnOffsetClass = $.grep($("div[class*='col-'].selected").attr('class').split(/\s+/), function(v, i){
  				return v.search(/\bcol-md-offset-\d+/) === 0; 
  			}).join(); 
  			var columnOffsetArray = columnOffsetClass.split('-'); 
  			var columnOffsetNumber = 0; 
  			if(columnOffsetArray.length > 3) { 
  				columnOffsetNumber = parseInt(columnOffsetArray[3]); 
  			}
  			var columnOffsetNewNumber = columnOffsetNumber + parseInt(offsetFactor); 
  			if(columnOffsetNewNumber < 0) { 
  				app.showErrorAlert('Offset Limit Reached',"Sorry, that column already has the minimum possible offset amount"); 
  				return; 
  			} 
  			else if(columnOffsetNewNumber > 11) { 
  				app.showErrorAlert('Offset Limit Reached',"Sorry, that column already has the maximum possible offset amount"); 
  				return; 
  			} 
  			// update column offset
				$page.find("div[class*='col-'].selected").removeClass(function(index,css) { 
  				return (css.match(/\bcol-md-offset-\d+/g) || []).join(' '); // finding any col-md-[0-9]+
  			}); 
  			if(columnOffsetNewNumber > 0) { 
  				$page.find("div[class*='col-'].selected").addClass('col-md-offset-'+columnOffsetNewNumber);
  			} 
				
				// update controls as needed
				app.pageChanged(); 
  		}, 
  		invokeColumnEdit: function() { 
  			// we add an editor div to the current column (so we can destroy it later) 
  			// *BUT* we need to make sure this page does not already have a live editor instance!
  			if( $("#page").find('#app-editor-instance').length > 0 ) { 
  				return; 
  			} 
  			$("div[class*='col-'].selected").wrapInner('<div id="app-editor-instance"></div>');  
  			var styleAttr = $("div[class*='col-'].selected").first().attr('style'); 
  			if(styleAttr) { $('#app-editor-instance').attr('style',styleAttr); }
  			$("#app-editor-instance").wysiwyg( { fileUploadError: app.showErrorAlert} ).focus().setEndOfContenteditable();
  			$('#app-edit-column').html('<span class="icon-checkmark"></span>').attr('title','Save Column'); 
  			// enable editing toolbar 
  			$('#app-editor-controls .btn').removeClass('disabled'); 
  			return false; 
  		}, 
  		saveColumnEdit: function() { 
  			$('#app-edit-column').html('<span class="icon-pencil"></span>').attr('title','Edit Column');
  			$('#app-editor-controls .btn').addClass('disabled'); 
  			var result = $("#app-editor-instance").cleanHtml(); 
  			// sometimes editing affects the style attribute so let's copy that over too 
  			var styleAttr = $('#app-editor-instance').attr('style'); 
  			var destination = $("#app-editor-instance").parent(); 
  			$(destination).html( result ); 
  			if(styleAttr) { $(destination).attr('style',styleAttr); } 
  			// one last thing // deprecated because it doesn't match live editing 
  			/* $('#app-current-block-formatting').text( 'Normal text' ); */
  			return false; 
  		}, 
  		onDblClickColumn: function(e) { 
  			app.selectElement(e); 
  			app.invokeColumnEdit(); 
  		}, 
  		pageChanged: function() { 
  			/* when #page is modified, need to update controls to match */
  			
  			// update "currently selected" 
  			$('#app-current').html( app.updateCurrentlySelected() ); 
  			
  			// update which buttons are shown / hidden 
  			if( $page.find('div.row').length > 0 ) { 
  				$('#app-remove-row, #app-add-column').removeClass('disabled'); 
  			} else { 
  				$('#app-remove-row, #app-add-column').addClass('disabled'); 
  			}
  			if( $page.find("div.row.selected div[class*='col-']").length > 1 ) { 
  				$('#app-remove-column').removeClass('disabled'); 
  			} else { 
  				$('#app-remove-column').addClass('disabled'); 
  			}
  			if( $page.find("div[class*='col-'].selected").length > 0 ) { 
  				$('#app-expand-column, #app-contract-column, #app-add-offset, #app-subtract-offset, #app-edit-column').removeClass('disabled'); 
  			} 
  			else { 
  				$('#app-expand-column, #app-contract-column, #app-add-offset, #app-subtract-offset, #app-edit-column').addClass('disabled');
  			}
  		}, 
  		updateCurrentlySelected: function() { 
  			var currentArray = new Array(); 
  			$page.find('.selected').each( function() { 
  					var nodeName = this.nodeName.toLowerCase(); 
  					if($(this).hasClass('row')) { 
  						nodeName = 'row'; 
  					} 
  					else if ($(this).is("[class*='col-']")) { 
  						nodeName = 'column'; 
  					} 
  					var nodeIndex = $(this).index() + 1; 
	  				currentArray.push( nodeName + ' ' + nodeIndex ); 
	  			}
  			); 
  			var currentText = currentArray.join(" > "); 
  			return "<strong>selected:</strong><br>"+currentText; 
  		}, 
  		selectElement: function(e) { 
  			// caveat: if user clicked outside an editor instance, I want to save that instance 
  			if($page.find("#app-editor-instance").length > 0) { 
  				if($(e.target).parents().index($("div[class*='col-'].selected")) == -1) {
  					app.saveColumnEdit(); 
			    }
  			}
  			
  			// another caveat: if this element contains an editor instance, I don't want to propagate this behavior 
  			if( $(e.target).find('#app-editor-instance').length > 0 ) { 
  				return; 
  			} 
  			
  			// bound on click to select an element and its parents
  			
  			// deselecting any currently selected elements
  			$page.find('.selected').removeClass('selected'); 
  			
  			// select this element 
  			$(e.target).addClass('selected'); 
  			// and the parents
  			$(e.target).parents("div[class*='col-'], div.row").addClass('selected'); 
  			// what if we only clicked on a row? we should select the last column in that row 
  			if( $(e.target).hasClass('row') ) { 
  				$(e.target).find("div[class*='col-']:last").addClass('selected'); 
  			}
  			
  			// let's not forget to update the controls  
  			app.pageChanged(); 
  			
  			return false; 
  		}, 
  		init: function() { 
        // set up pnotify 
        $.pnotify.defaults.styling = "bootstrap3";
        $.pnotify.defaults.history = false;

  			// set up app controls 
  			$('#app-add-row').click( function() { 
  				app.addRow(); 
  				return false; 
  			} ); 
  			$('#app-remove-row').click( function() { 
  				app.removeRow(); 
  				return false; 
  			} ); 
  			$('#app-add-column').click(function() { 
  				app.addColumn(); 
  				return false; 
  			} ); 	
  			$('#app-remove-column').click(function() { 
  				app.removeColumn(); 
  				return false; 
  			} ); 
  			$('#app-expand-column').click(function() { 
  				app.expandColumn(); 
  				return false; 
  			} ); 
  			$('#app-contract-column').click(function() { 
  				app.contractColumn(); 
  				return false; 
  			} ); 
  			$('#app-add-offset').click(function() { 
  				app.addOffset(); 
  				return false; 
  			} ); 
  			$('#app-subtract-offset').click(function() { 
  				app.subtractOffset(); 
  				return false; 
  			} );
  			$('#app-edit-column').click(function() { 
  				if( $('#app-edit-column').attr('title') == 'Save Column') { 
  					app.saveColumnEdit(); 
  				} 
  				else { 
	  				app.invokeColumnEdit(); 
	  			} 
  				return false; 
  			} ); 
  			
  			// set up tooltips 
  			
  			$('#pagecub a[title]').tooltip({container:'body',placement:'auto'});
  			
  			$('#app-block-formatting-options li a').click(function(e) { 
  				/* app.updateBlockFormattingText(e); */
  			} ); 
  			
  			// bindings for text editing features 
  			/*
  			var fonts = ['Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 
          'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
          'Times New Roman', 'Verdana'],
        fontTarget = $('[title=Font]').siblings('.dropdown-menu');
				$.each(fonts, function (idx, fontName) {
						fontTarget.append($('<li><a data-edit="fontName ' + fontName +'" style="font-family:\''+ fontName +'\'">'+fontName + '</a></li>'));
				}); */
				$('.dropdown-menu input').click(function() {return false;})
					.change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');})
					.keydown('esc', function () {this.value='';$(this).change();});

				$('[data-role=magic-overlay]').each(function () { 
					var overlay = $(this), target = $(overlay.data('target')); 
					overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
				});
				if ("onwebkitspeechchange"  in document.createElement("input")) {
					var editorOffset = $('#editor').offset();
					$('#voiceBtn').css('position','absolute').offset({top: editorOffset.top, left: editorOffset.left+$('#editor').innerWidth()-35});
				} else {
					$('#voiceBtn').hide();
				}
  		}, 
  		updateBlockFormattingText: function(e) { 
  			$('#app-current-block-formatting').text( '' + $(e.target).text() ); 
  		}, 
  		showErrorAlert: function(reason, detail) {
				if (reason==='unsupported-file-type') { 
					reason = 'File upload error'; 
					detail = "Unsupported format " +detail; 
				}
        $.pnotify({
          title: reason,
          text: detail,
          type: 'error'
        });
			}
  	}; 
		
    $window.on('load', function () {
      /* start app here */
      app.init(); 
    })

})

}(window.jQuery)
