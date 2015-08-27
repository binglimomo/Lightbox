;(function($){

var LightBox = function(settings){
   var self = this;
   this.settings = {speed:300};
   //将settings值合并到this.settings中
   $.extend(this.settings,settings || {});
   this.popupMask = $('<div id="G-mask">');
   this.popupWin = $('<div id="G-popup">');
   
   this.bodyNode = $(document.body);
   
 this.renderDOM();
 this.imageview = this.popupWin.find("div.image-view");
 this.image = this.popupWin.find("img.image");
 this.imageDescribe = this.popupWin.find("div.div-image-caption");
 this.imageCaption = this.popupWin.find("p.image-caption");
 this.imageIndex = this.popupWin.find("span.image-index");
 
 this.imagePrebtn = this.popupWin.find("span.pre-btn");
 this.imageNextbtn = this.popupWin.find("span.next-btn");
 this.imageclosebtn = this.popupWin.find("span.close-btn");
  
  //body委托
  this.groupdata = [];
  this.groupName = null;
  this.bodyNode.delegate(".lightbox","click",function(e){
									e.stopPropagation();
									var currentGroup = $(this).attr("data-group");
									if (currentGroup != self.groupName){
										self.groupName = currentGroup;
										self.getGroup();
									};
	  self.initPopup($(this));
									
 });
  
  this.popupMask.click(function(){
				$(this).fadeOut();
				self.popupWin.fadeOut();	
				self.clear = false;
  });
   this.imageclosebtn.click(function(){
				self.popupMask.fadeOut();
				self.popupWin.fadeOut();	
				self.clear = false;
  });
   
   this.flag = true;
   this.imagePrebtn.hover(function(){
								   if(!$(this).hasClass("disabled")&& self.groupdata.length>1){
									   $(this).addClass("pre-show-btn");
									   };
								   },function(){
								     if(!$(this).hasClass("disabled")&& self.groupdata.length>1){
									     $(this).removeClass("pre-show-btn");
									     };									   
									   }).click(function(e){
										   if(!$(this).hasClass("disabled")&&self.flag){
											   self.flag = false;
											   e.stopPropagation();
											   self.goto("pre");
											};
									   });
    this.imageNextbtn.hover(function(){
								   if(!$(this).hasClass("disabled")&& self.groupdata.length>1){
									   $(this).addClass("next-show-btn");
									   };
								   },function(){
								     if(!$(this).hasClass("disabled")&& self.groupdata.length>1){
									     $(this).removeClass("next-show-btn");
									     };									   
									   }).click(function(e){
										   if(!$(this).hasClass("disabled")&&self.flag){
											   self.flag = false;
											   e.stopPropagation();
											   self.goto("next");
											};										   
										});
	
	var timer = null;
	this.clear = false;
	$(window).resize(function(){
					if(self.clear){
					window.clearTimeout(timer);
					timer = window.setTimeout(function(){
										self.loadImageSize(self.groupdata[self.index-1].src);
												},500);
									};
							  });

};


LightBox.prototype = {
	goto:function(dir){
		var self = this;
		if(dir === "next"){
			self.index++;
			if(self.index >= self.groupdata.length){
				self.imageNextbtn.addClass("disabled").removeClass("next-show-btn");
			};
			if(self.index !=1){
				self.imagePrebtn.removeClass("disabled");
			};
			var src = self.groupdata[self.index-1].src;
			self.loadImageSize(src);
			
	    }else if(dir === "pre"){
			self.index--;
			if(self.index <= 1){
				self.imagePrebtn.addClass("disabled").removeClass("pre-show-btn");
			};
			if(self.index != self.groupdata.length){
				self.imageNextbtn.removeClass("disabled");
			};
			var src = self.groupdata[self.index-1].src;
			self.loadImageSize(src);
	    };
	},
	changePic:function(width,height){
		var self = this;
	   
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		
		var scale = Math.min(winWidth/(width+10),winHeight/(height+10),1);
		
		width = width * scale;
		height = height * scale;
		
		this.imageview.animate({
							   width:width-10,
							   height:height-10
							   },this.settings.speed);
		this.popupWin.animate({
							  width:width,
							  height:height,
							  marginLeft:-(width/2),
							  top:(winHeight-height)/2
							  },this.settings.speed,function(){
								  self.image.css({
												 width:width-10,
												 height:height-10
												 }).fadeIn();
								  self.imageDescribe.fadeIn();
								  self.flag =true;
								  self.clear = true;
							  });
		this.imageCaption.text(self.groupdata[self.index-1].caption);
		this.imageIndex.text("当前索引："+ self.index + " of " + self.groupdata.length);
	},
	preloadImage:function(src,callback){
		var img = new Image();
		if (!!window.ActiveXObject){
			img.onreadystatechange = function(){
				if(this.readyState == "complete"){
					callback();
				};
			};
		}else{
			img.onload = function(){
				callback();
			};
		};
		img.src = src;
		
	},
	loadImageSize:function(src){
		var self = this;
		self.image.css({width:"auto",heigth:"auto"}).hide();
		this.imageDescribe.hide();
		this.preloadImage(src,function(){
				   self.image.attr("src",src);
			       var picWidth = self.image.width();
			       var picHeight = self.image.height();
				   
				  self.changePic(picWidth,picHeight);
				   
	   });
	},

	showPopup:function(src,id){
		var self = this;
         this.image.hide();
     	 this.imageDescribe.hide();
		 
		 this.popupMask.fadeIn();
		 
		 var winWidth = $(window).width();
		 var winHeight = $(window).height();
		 
		 this.imageview.css({
							width:winWidth/2,
							height:winHeight/2
		});
		 this.popupWin.fadeIn();
		 var viewHeight = winHeight/2+10;
		 this.popupWin.css({
						   width:winWidth/2+10,
						   heigth:winHeight/2+10,
						   marginLeft:-(winWidth/2+10)/2,
						   top:-viewHeight
		}).animate({
			         top:(winHeight-viewHeight)/2
			},this.settings.speed,function(){
				self.loadImageSize(src);
			});
		 
		 this.index = this.getIndexOf(id);
		 
		 var groupdatalength = this.groupdata.length;
		 if(groupdatalength>1){
			 if(this.index === 1){
				 this.imagePrebtn.addClass("disabled");
				 this.imageNextbtn.removeClass("disabled");
			 }else if(this.index === groupdatalength){
				 this.imagePrebtn.removeClass("disabled");
				 this.imageNextbtn.addClass("disabled");
			 }else{
				 this.imagePrebtn.removeClass("disabled");
				 this.imageNextbtn.removeClass("disabled");
			 }
		}
		 
	},
	getIndexOf:function(id){
		var index = 0;
		$(this.groupdata).each(function(i){
					index++;
					if(this.id===id){
						return false;
					}
		});
		return index;
	},
	initPopup:function(popupObj){
		var self = this,
		       src = popupObj.attr("data-source"),
			   id = popupObj.attr("data-id");
		self.showPopup(src,id);
	},
	getGroup:function(){
			var self = this;
			var groupList = this.bodyNode.find("*[data-group="+this.groupName+"]");
			self.groupdata.length = 0;
            groupList.each(function(){
						self.groupdata.push({
											src:$(this).attr("data-source"),
											id:$(this).attr("data-id"),
											caption:$(this).attr("data-caption")
						});
			});
	},
	renderDOM:function(){
				var strhtml =  '<div class="image-view">'+
								'<span class="btn pre-btn"></span>'+	
								'<img class="image" />'+	
								'<span class="btn next-btn"></span>	</div>'+
								'<div class="div-image-caption">'+
								'<div class="caption-area">'+
									'<p class="image-caption"></p>'+
									'<span class="image-index"></span>'+
								'</div>'+
								'<span class="close-btn"></span>'+
								'</div>';
				this.popupWin.html(strhtml);
				this.bodyNode.append(this.popupMask,this.popupWin);
	}
	
};

window["LightBox"] = LightBox;
})(jQuery);