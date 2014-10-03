Class ("paella.ZoomPlugin", paella.VideoOverlayButtonPlugin,{
	_zImages:null,
	_isActivated:false,

	getIndex:function(){return 20;},

	getAlignment:function(){
		return 'right';
	},
	getSubclass:function() { return "zoomButton"; },

	getDefaultToolTip:function() { return base.dictionary.translate("Zoom");},

	checkEnabled:function(onSuccess) {
		// CHECK IF THE VIDEO HAS HIRESIMAGES
		var n = paella.player.videoContainer.sourceData;

		for(i=0; i < n.length; i++){
			if(n[i].sources.hasOwnProperty("image")){
				onSuccess(true);
			} else if(i == n.length) onSuccess(false);
		}
	},

	setup:function() {
		var self = this;
		
		//  BRING THE IMAGE ARRAY TO LOCAL
		this._zImages = {};
		var n = paella.player.videoContainer.sourceData;
		var n_res = 0;

		for(i=0; i < n.length; i++){ // GET THE IMAGE SOURCES
			if(n[i].sources.hasOwnProperty("image")){
				n_res = n[i].sources.image;
			}
		}
		var max = -1;
		var index;
		for(i=0; i < n_res.length; i++){ // GET HIGHEST RESOLUTION
			if(n_res[i].res.h > max) { 
				max = n_res[i].res.h;
				index = i;
			}
		}

		this._zImages = n_res[index].frames; // COPY TO LOCAL

		// REMOVE ON COMPOSITION CHANGE
		paella.events.bind(paella.events.setComposition, function(event,params) {
			self.compositionChanged(event,params);
		});

		// BIND TIMEUPDATEVENT	
		paella.events.bind(paella.events.timeUpdate, function(event,params) { 
			self.imageUpdate(event,params);
		});
	},

	imageUpdate:function(event,params) {
		if(this._isActivated){

			var self = this;
			var sec = Math.round(params.currentTime);
			var src = $("#photo_01")[0].src;

			if($('.newframe').length>0){


				if(src != this._zImages["frame_"+sec]){
					
					src = this._zImages["frame_"+sec];
					$("#photo_01").attr('src',src).load();
					if($(".zoomContainer").length<1) // only 1 zoomcontainer
						$("#photo_01").elevateZoom({ zoomType	: "inner", cursor: "crosshair", scrollZoom : true }); // ZOOM
			

					//PRELOAD NEXT IMAGE
					var image = new Image();
					image.onload = function(){
	    			$( ".zoomWindow" ).css('background-image', 'url(' + mi_src + ')'); // UPDATING IMAGE
					};
					image.src = src;

					
					// OPEN NEW WINDOW WITH FULLSCREEN IMAGE

					$("#photo_link").attr("href", src).attr("target","_blank");

				}
				
			}
		}
		
	},

	createOverlay:function(){
		var self = this;
		var newframe = document.createElement("div");
			newframe.className = "newframe";
			newframe.setAttribute('style', 'display: table;');
			
			// IMAGE
			var hiResImage = document.createElement('img');
   			hiResImage.className = 'frameHiRes';
   			// GET IMAGE FOR TIMELINE

   			var link = document.createElement('a');
   			link.setAttribute("id", "photo_link");

       		//hiResImage.setAttribute('src',"resources/style/000000.png");
        	hiResImage.setAttribute('style', 'width: 100%;');
        	hiResImage.setAttribute("id", "photo_01");

        	$(link).append(hiResImage);
        	$(newframe).append(link);

        	// OVERLAY
			overlayContainer = paella.player.videoContainer.overlayContainer;
			overlayContainer.addElement(newframe, overlayContainer.getMasterRect());
			$(".newframe").css("background-color","rgba(80,80,80,0.4)");
			$(".newframe img").css("opacity","0");
	},

	action:function(button) {
		var self = this;
		if($('.newframe').length<1){
			//CREATE OVERLAY
			self.createOverlay();
			this._isActivated = true;
		}
		else { // IF EXISTS REMOVE ON CLICK
			$( ".newframe" ).remove();
			this._isActivated = false;
		}

	},

	compositionChanged:function(event,params){
		var self = this;
		if($('.newframe').length>0){
			$( ".newframe" ).remove();// REMOVE PLUGIN
			self.createOverlay();//CALL AGAIN
		}
	},


		getName:function() { 
		return "es.upv.paella.ZoomPlugin";
	}
});

paella.plugins.zoomPlugin = new paella.ZoomPlugin();
