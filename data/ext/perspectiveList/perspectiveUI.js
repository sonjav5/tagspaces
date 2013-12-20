/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
console.log("Loading UI for perspectiveList");

	var TSCORE = require("tscore");
		
	var TMB_SIZES = [ "100px", "200px", "300px", "400px", "500px" ];

	var supportedFileTypeThumnailing = ['jpg','jpeg','png','gif'];

    var extensionDirectory = undefined;

	function ExtUI(extID) {
		this.extensionID = extID;
	    this.viewContainer = $("#"+this.extensionID+"Container").empty();
	    this.viewToolbar = $("#"+this.extensionID+"Toolbar").empty();
		this.viewFooter = $("#"+this.extensionID+"Footer").empty();
		
		this.thumbEnabled = false;
		this.showFileDetails = false;
		this.showTags = true;
		this.currentTmbSize = 0;
		
		extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+this.extensionID;
	}
     
	ExtUI.prototype.buildUI = function(toolbarTemplate) {
		console.log("Init UI module");

		var self = this;

        var context = {
            id: this.extensionID,
        };
        // Init Toolbar
        
        this.viewToolbar.html(toolbarTemplate(context));

        $("#"+this.extensionID+"ToogleSelectAll")    
            .click(function() {
                if($(this).find("i").attr("class") == "fa fa-square-o") {
                    TSCORE.selectedFiles = [];   
                    $('#'+self.extensionID+'FileTable tbody tr').each(function(){
                        $(this).addClass('ui-selected');
                        $(this).find(".fileSelection").prop("checked",true);
                        TSCORE.selectedFiles.push($(this).find(".fileTitleButton").attr("filepath"));  
                        self.handleElementActivation();                          
                    });
                    $(this).find("i").removeClass("fa fa-square-o"); 
                    $(this).find("i").addClass("fa fa-check-square-o"); 
                } else {
                    TSCORE.PerspectiveManager.clearSelectedFiles();
                    $(this).find("i").removeClass("fa fa-check-square-o");                                     
                    $(this).find("i").addClass("fa fa-square-o");
                }            
            });
        
 	    $("#"+this.extensionID+"CreateFileButton")    
    	    .prop('disabled', true)
            .click(function() {
                TSCORE.showFileCreateDialog();
            });        

        $("#"+this.extensionID+"IncludeSubDirsButton")    
            .prop('disabled', true)    	    
    	    .click(function() {
    		    $( this ).prop('disabled', true);
    			TSCORE.IO.createDirectoryIndex(TSCORE.currentPath);
    	    });     	    

    	$("#"+this.extensionID+"TagButton")    
            .prop('disabled', true)
    	    .click(function() {
    			TSCORE.showAddTagsDialog();
    	    });
                
     	$("#"+this.extensionID+"ShowTmbButton")    
    	    .click(function() {
    			self.toggleThumbnails();
    	    });
     
   	    $("#"+this.extensionID+"IncreaseThumbsButton")    
    	    .click(function() {
    			self.switchThumbnailSize();
    	    })	    
            .prop('disabled', true);
	    		
		$("#"+this.extensionID+"ShowFileDetailsButton")    
		    .click(function() {
				self.toggleFileDetails();
		    });
		     	    
        $("#"+this.extensionID+"ShowTagsButton")    
			.click(function() {
				self.toggleTags();
		    });		    
        // Init Toolbar END

        // Init Container
        
        // Init File Context Menu
        this.viewContainer.on("contextmenu click", ".fileTitleButton", function (e) {
            TSCORE.hideAllDropDownMenus();
            e.preventDefault();                        
            self.selectFile(this, $(this).attr("filepath"));            
            TSCORE.showContextMenu("#fileMenu", $(this));
            return false;
        });     

        // Init Tag Context Menu               
        this.viewContainer.on("contextmenu click", ".tagButton", function (e) {
            TSCORE.hideAllDropDownMenus();
            self.selectFile(this, $(this).attr("filepath"));
            TSCORE.openTagMenu(this, $(this).attr("tag"), $(this).attr("filepath"));
            TSCORE.showContextMenu("#tagMenu", $(this));
            return false;
        });
	
	    this.viewContainer.append($("<table>", { 
			cellpadding: "0", cellspacing: "0",	border: "0", style: "width: 100%",
			class: "table content disableTextSelection",
	        id: this.extensionID+"FileTable",    
	    })); 

	    this.fileTable = $('#'+this.extensionID+"FileTable").dataTable( {
	        "bJQueryUI": false,
	        "bPaginate": false,
	        "bLengthChange": false,
	        "bFilter": true,
	        "bSort": true,
	        "bInfo": false,
	        "bAutoWidth": false,
	        "aoColumns": [
	            { "sTitle": "Extension", "sWidth": "120px", "sClass": "fileTitle"  },
                { "sTitle": "Title", "sClass": "fileTitle" },
	            { "sTitle": "Tags", "sClass": "fileTitle"  },            
	            { "sTitle": "Size(B)" },
	            { "sTitle": "Date Modified" },
	            { "sTitle": "Path" },
                { "sTitle": "File Name" }                
	        ],         
	        "aoColumnDefs": [
/*	            { // Title column
	                "mRender": function ( data, type, row ) { 
	                	return buttonizeTitle(data,row[TSCORE.fileListTITLE],row[TSCORE.fileListFILEPATH],row[TSCORE.fileListFILEEXT]); 
	                	},
	                "aTargets": [ TSCORE.fileListTITLE ]
	            },*/ 
                { // File extension column
                    "mRender": function ( data, type, row ) { 
	                	return buttonizeTitle(data,row[TSCORE.fileListTITLE],row[TSCORE.fileListFILEPATH],row[TSCORE.fileListFILEEXT]); 
                        },
                    "aTargets": [ TSCORE.fileListFILEEXT ]
                }, 
	            { // Tags column
	                "mRender": function ( data, type, row ) { 
	                	return TSCORE.generateTagButtons(data,row[TSCORE.fileListFILEPATH]); 
	                	},
	                "aTargets": [ TSCORE.fileListTAGS ]
	            }, 
	            { // Filesize column
	                "sType": 'numeric',
	                "aTargets": [ TSCORE.fileListFILESIZE ],
	             /*   "mRender": function ( data, type, row ) { 
	                	return TSCORE.TagUtils.formatFileSize(data, true); 
	                	},*/
	            },
	            { // Last changed date column
	                "mRender": function ( data, type, row ) { 
	                	return TSCORE.TagUtils.formatDateTime(data, true); 
	                	},
	                "aTargets": [ TSCORE.fileListFILELMDT ]
	            },
                { // Filename column
                    "mRender": function ( data, type, row ) { 
                        return data; 
                        },
                    "aTargets": [ TSCORE.fileListFILENAME ]
                },     
	            { "bVisible": false,  "aTargets": [ 
	                       TSCORE.fileListFILESIZE, 
	                       TSCORE.fileListFILELMDT, 
	                       TSCORE.fileListFILEPATH,
	                       TSCORE.fileListFILENAME 
	                       ] 
	            },
	            { "bSearchable": false,  "aTargets": [ 
	                       TSCORE.fileListTITLE, 
	                       TSCORE.fileListFILEEXT, 
	                       TSCORE.fileListTAGS, 
	                       TSCORE.fileListFILESIZE, 
	                       TSCORE.fileListFILELMDT, 
	                       TSCORE.fileListFILEPATH 
	                       ] 
                }
	         ]
	    } );
	
	    // Disable alerts in datatable
	    this.fileTable.dataTableExt.sErrMode = 'throw';	   
	};			
	
	ExtUI.prototype.reInit = function() {
		// Clearing old data
	    this.fileTable.fnClearTable();  

	    // Load new filtered data
	    this.searchResults = TSCORE.Search.searchData(TSCORE.fileList, TSCORE.Search.nextQuery);
	    
	    this.fileTable.fnAddData( this.searchResults );

		var self = this;

	    this.fileTable.$('tr')
		    .droppable({
		    	accept: ".tagButton",
		    	hoverClass: "activeRow",
		    	drop: function( event, ui ) {
		    		var tagName = TSCORE.selectedTag;
		    			    		
		    		var targetFilePath = self.fileTable.fnGetData( this )[TSCORE.fileListFILEPATH];
	
		    		// preventing self drag of tags
		    		var targetTags = TSCORE.TagUtils.extractTags(targetFilePath);
		    		for (var i = 0; i < targetTags.length; i++) {
	        			if (targetTags[i] === tagName) {
	            			return true;
	        			}
	    			}
		    		
					console.log("Tagging file: "+tagName+" to "+targetFilePath);
				    $(this).toggleClass("ui-selected");
				    TSCORE.PerspectiveManager.clearSelectedFiles();
				    TSCORE.selectedFiles.push(targetFilePath); 
					TSCORE.TagUtils.addTag(TSCORE.selectedFiles, [tagName]);
					self.handleElementActivation();
					
					$(ui.helper).remove();  
		    	}	            	
		    })
			.hammer().on("doubletap", function(event) {
		        console.log("Doubletap & Opening file...");
		        var rowData = self.fileTable.fnGetData( this );
		        TSCORE.FileOpener.openFile(rowData[TSCORE.fileListFILEPATH]); 
		        
                var titleBut = $(this).find(".fileTitleButton");
                self.selectFile(titleBut, $(titleBut).attr("filepath"));
			 });     		    
		    /*.dblclick( function() {
		        console.log("Opening file...");
		        var rowData = self.fileTable.fnGetData( this );
		        TSCORE.FileOpener.openFile(rowData[TSCORE.fileListFILEPATH]); 
		        
                var titleBut = $(this).find(".fileTitleButton");
                self.selectFile(titleBut, $(titleBut).attr("filepath"));
		    } );   */
	    
	    this.fileTable.$('.fileTitleButton')
	    	.draggable({
	    		"cancel":    false,
	    		"appendTo":  "body",
	    		"helper":    "clone",
	    		"revert":    true,
		        "start":     function() { self.selectFile(this, $(this).attr("filepath")); }    		
	    	});  
	    
	    this.fileTable.$('.fileSelection')
            .click( function() {
                var fpath = $(this).parent().find(".fileTitleButton").attr("filepath");
                if($(this).prop("checked")) {                    
                    $(this).parent().parent().addClass("ui-selected");
                    TSCORE.selectedFiles.push(fpath);  
                } else {
                    $(this).parent().parent().removeClass("ui-selected");
                    TSCORE.selectedFiles.splice(TSCORE.selectedFiles.indexOf(fpath), 1);
                }
                self.handleElementActivation(); 
            } );        
	    
	    this.fileTable.$('.tagButton')
	    	.draggable({
	    		"cancel":   false,
	    		"appendTo": "body",
	    		"helper":   "clone",
	    		"revert":   true,
		        "start":    function() { 
                    TSCORE.selectedTag = $(this).attr("tag");
		            self.selectFile(this, $(this).attr("filepath")); 
		            }    		
	    	});   	        
	
	    //$("#"+this.extensionID+"FileTable_wrapper").show();  
	    $("#"+this.extensionID+"CreateFileButton" ).prop('disabled', false);
	    $("#"+this.extensionID+"IncludeSubDirsButton" ).prop('disabled', false);
	    
        this.refreshThumbnails();
        TSCORE.hideLoadingAnimation();          
	};
	
    // Helper function user by basic and search views
    function buttonizeTitle(title, fileName, filePath, fileExt) {
        if(title.length < 1) {
            title = filePath;
        }
        
        //TODO minimize platform specific calls     
        var tmbPath = undefined;
        if(isCordova) {
            tmbPath = filePath;            
        } else {
            tmbPath = "file:///"+filePath;  
        }       
        
        var thumbHTML = "";     
        if(supportedFileTypeThumnailing.indexOf(fileExt) >= 0) {
            thumbHTML = $('<span>').append( $('<img>', { 
                title: fileName, 
                class: "thumbImg",
                filepath: tmbPath, 
                style: "width: 0px; height: 0px; border: 0px" 
            })).html();
            thumbHTML = "<br>" + thumbHTML;
        }            

        var checkboxHTML = $('<input>', { 
                type: "checkbox",
                class: "fileSelection", 
            });
            
        var buttonHTML = $('<button>', {
            title: "Options for "+fileName, 
            filepath: filePath,
            class: 'btn btn-link fileTitleButton',          
        }).append($('<span>', { 
            id: "fileExt"           
            })
          .append($("<span>", { text: fileExt }))  
          .append("&nbsp;<span class='caret white-caret'></span>")
        );
        
        var fileHTML = $('<p>', {})        
        .append(checkboxHTML)       
        .append(buttonHTML)     
        .append(thumbHTML);                     
            
        return fileHTML.html();        
    }	

    /* ExtUI.prototype.setFilter = function(filterValue) {
        TSCORE.PerspectiveManager.clearSelectedFiles();   

        $( "#"+this.extensionID+"FilterBox").val(filterValue).focus();
        this.fileTable.fnFilter(filterValue);
        
        if(filterValue.length > 0) {
            $( "#"+this.extensionID+"ClearFilterButton").addClass("filterOn");
        } else {
            $( "#"+this.extensionID+"ClearFilterButton").removeClass("filterOn");
        }
        
        this.handleElementActivation();   
        console.log("Filter to value: "+filterValue);           
    }; */  
	
	ExtUI.prototype.selectFile = function(uiElement, filePath) {
	    TSCORE.PerspectiveManager.clearSelectedFiles();   

	    $(uiElement).parent().parent().toggleClass("ui-selected");
        $(uiElement).parent().parent().find(".fileSelection").prop("checked",true);   
	    
	    TSCORE.selectedFiles.push(filePath);  
		this.handleElementActivation();      
	}; 		
	
	ExtUI.prototype.switchThumbnailSize = function() {
		this.currentTmbSize = this.currentTmbSize + 1;
		
		if(this.currentTmbSize >= TMB_SIZES.length) { this.currentTmbSize = 0; }
		
		$('.thumbImg').css({"max-width":TMB_SIZES[this.currentTmbSize], "max-height":TMB_SIZES[this.currentTmbSize] });		
	};
	
	ExtUI.prototype.toggleFileDetails = function() {
		if(this.showFileDetails) {
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILESIZE, false );
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILELMDT, false );
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILEPATH, false );									
		} else {
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILESIZE, true );
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILELMDT, true );
			this.fileTable.fnSetColumnVis( TSCORE.fileListFILEPATH, true );			
		}
		this.showFileDetails = !this.showFileDetails;
	};

    ExtUI.prototype.enableThumbnails = function() {
        $( "#"+this.extensionID+"IncreaseThumbsButton" ).prop('disabled', false);
        $.each(this.fileTable.$('.thumbImg'), function() {
            $(this).attr('style', "");
            $(this).attr('src',$(this).attr('filepath'));
        });
        $('.thumbImg').css({"max-width":TMB_SIZES[this.currentTmbSize], "max-height":TMB_SIZES[this.currentTmbSize] });     
    };   
    
    ExtUI.prototype.disableThumbnails = function() {
        $( "#"+this.extensionID+"IncreaseThumbsButton" ).prop('disabled', true);
        $.each(this.fileTable.$('.thumbImg'), function() {
            $(this).attr('style', "width: 0px; height: 0px; border: 0px");
            $(this).attr('src',"");
        });
    };     
    
    ExtUI.prototype.refreshThumbnails = function() {
        if(this.thumbEnabled) {
            this.enableThumbnails();
        } else {
            this.disableThumbnails();
        }
    };        
	
	ExtUI.prototype.toggleThumbnails = function() {
		this.thumbEnabled = !this.thumbEnabled;
        this.refreshThumbnails();
	};	
	
	ExtUI.prototype.toggleTags = function() {
		if(this.showTags) {
			this.fileTable.fnSetColumnVis( TSCORE.fileListTAGS, false );
		} else {
			this.fileTable.fnSetColumnVis( TSCORE.fileListTAGS, true );
		}
		this.showTags = !this.showTags;
	};
	
	ExtUI.prototype.handleElementActivation = function() {
	    console.log("Entering element activation handler...");
	    
	    var tagButton = $( "#"+this.extensionID+"TagButton" );
	    
	    if (TSCORE.selectedFiles.length > 1) {
	        tagButton.prop('disabled', false);
	    } else if (TSCORE.selectedFiles.length == 1) {
	       	tagButton.prop('disabled', false);
	    } else {
	        tagButton.prop('disabled', true);
	    }    
	};

    ExtUI.prototype.getNextFile = function(filePath) {
        var nextFilePath = undefined;
        var self = this;
        this.searchResults.forEach(function(entry, index) {
            if(entry[TSCORE.fileListFILEPATH] == filePath) {
                var nextIndex = index+1;
                if(nextIndex < self.searchResults.length) {
                    nextFilePath = self.searchResults[nextIndex][TSCORE.fileListFILEPATH];                        
                } else {
                    nextFilePath = self.searchResults[0][TSCORE.fileListFILEPATH];
                }               
            }           
            console.log("Path: "+entry[TSCORE.fileListFILEPATH]);
        });
        TSCORE.PerspectiveManager.clearSelectedFiles();     
        console.log("Next file: "+nextFilePath);
        return nextFilePath;         
    };
    
    ExtUI.prototype.getPrevFile = function(filePath) {    
        var prevFilePath = undefined;
        var self = this;
        this.searchResults.forEach(function(entry, index) {
            if(entry[TSCORE.fileListFILEPATH] == filePath) {
                var prevIndex = index-1;
                if(prevIndex >= 0) {
                    prevFilePath = self.searchResults[prevIndex][TSCORE.fileListFILEPATH];                        
                } else {
                    prevFilePath = self.searchResults[self.searchResults.length-1][TSCORE.fileListFILEPATH];
                }
            }           
            console.log("Path: "+entry[TSCORE.fileListFILEPATH]);
        });
        TSCORE.PerspectiveManager.clearSelectedFiles();
        console.log("Prev file: "+prevFilePath);
        return prevFilePath;
    };  

	exports.ExtUI	 				= ExtUI;
});