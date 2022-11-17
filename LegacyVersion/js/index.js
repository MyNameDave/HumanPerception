(function(){
    var stage,textStage;
    var circles,textPixels,together,snowed;
    var endSnowIndex=0;
    var offsetX,offsetY,text;
    var imgnum=112; // This line is about to control how many images，it pulls from img files.
    var appnum=1;
    var input="Human"; // This is the text that the main (big) word changes into. 
    var scale1=0.72 ,scale2=0.24; //Original setting were 36- 12
    var fontsize=260;
	var windowWidth = window.innerWidth;
	
    function getStart() {
		setInput();
        initStage();
        initCircles();
        step();
        addListeners();
    }
	
	function setInput(){
		input = "Human \n Perception";
	}
	
    function initStage() {
        // $("#gogo").hide();
        input=input.toUpperCase();
        offsetX = (window.innerWidth - (fontsize * 6.3))/2;
        // offsetY = (window.innerHeight-fontsize)/2;
        offsetY= (window.innerHeight-fontsize * 2.25)/2;
        // console.log(offsetX+' '+offsetY)
        textStage = new createjs.Stage("text");
        textStage.canvas.width = window.innerWidth;
        textStage.canvas.height = window.innerHeight;
        stage = new createjs.Stage("stage");
        stage.canvas.width = window.innerWidth;
        stage.canvas.height = window.innerHeight;
        text = new createjs.Text("", fontsize+"px 'Source Sans Pro'", "#FFFFFF"); //The text has to be #000 or it breaks for some reason.
        text.alpha=0.01;
        together=false;
        snowed=false;
        //This needs to go twice, otherwise, bug.
        createText(input);
    }
    //加入很多app
    function initCircles() {
        circles = [];
        for(var i=0; i<appnum; i++) {
            var img = new Image();
            var x = window.innerWidth*Math.random();
            var y = window.innerHeight*Math.random();
            img.src = "img/" + Math.floor(Math.random()*imgnum) + ".png";
            var appp = new createjs.Bitmap(img);
            appp.x=x;
            appp.y=y;
            appp.scaleX=scale1;
            appp.scaleY=scale1;
            appp.alpha=0.2 + Math.random()*0.5;
            circles.push(appp);
            stage.addChild(appp);
            appp.movement = 'float';
            dynamicGo(appp);
        }
    }
    //使用回调函数渲染
    function step() {
        stage.update();
        requestAnimationFrame(step);
    }
    //Flowing Element
    function dynamicGo(c, dir) {
        if(c.tween) c.tween.kill();
        if(dir == 'in') {
            c.tween = TweenLite.to(c, 1, {x: c.originX, y: c.originY, ease:Quad.easeInOut, alpha: 1, scaleX: scale2, scaleY: scale2, onComplete: function() {
                c.movement = 'jiggle';
                dynamicGo(c);
            }});
        } 
        else if(dir == 'out') {
            c.tween = TweenLite.to(c, 1, {x: window.innerWidth*Math.random(), y: window.innerHeight*Math.random(), ease:Quad.easeInOut, alpha: 0.2 + Math.random()*0.5, scaleX: scale1, scaleY: scale1, onComplete: function() {
                c.movement = 'float';
                dynamicGo(c);
            }});
        }
        else if(dir == 'down'){
            //todo
            c.tween = TweenLite.to(c, Math.random()*2+1, {x: c.x, y: window.innerHeight, ease:Quad.easeInOut, alpha: 0.4 + Math.random()*0.5, scaleX: scale2+Math.random()*(scale1-scale2), scaleY: scale2+Math.random()*(scale1-scale2), onComplete: function(){
                // showDesp();
            }});
        }
        else if(dir == 'enddown'){
            c.tween = TweenLite.to(c, Math.random()*10+10, {x: c.x, y: window.innerHeight, ease:Quad.easeInOut, alpha: 0.2 + Math.random()*0.5, scaleX: scale2+Math.random()*(scale1-scale2), scaleY: scale2+Math.random()*(scale1-scale2), onComplete: function(){
                // showDesp();
            }});
        }
        else {
            //在外面飘
            if(c.movement == 'float') {
                c.tween = TweenLite.to(c, 5 + Math.random()*3.5, {x: c.x + -100+Math.random()*200, y: c.y + -100+Math.random()*200, ease:Quad.easeInOut, alpha: 0.2 + Math.random()*0.5,
                    onComplete: function() {
                        dynamicGo(c);
                    }});
            } 
            //在中间抖
            else if(c.movement == 'jiggle'){
                c.tween = TweenLite.to(c, 0.05, {x: c.originX + Math.random()*3, y: c.originY + Math.random()*3, ease:Quad.easeInOut,
                    onComplete: function() {
                        dynamicGo(c);
                    }});
            }
        }
    }
    
    function createText(t) {
        text.text = t;
        text.font = fontsize +"px 'Source Sans Pro'";
        text.textAlign = 'center';
        text.x = 750;
        text.y = 0;
        textStage.addChild(text);
        textStage.update();
        var ctx = document.getElementById('text').getContext('2d');
        var pix = ctx.getImageData(0,0, windowWidth,windowWidth).data; //This is the data that changes the size of the overall text. 
        
        textPixels = [];
        for (var i = pix.length; i >= 0; i -= 4)//i-=4 was original 
		{
            if (pix[i] != 0) {
                var x = (i / 4) % windowWidth;
                var y = Math.floor(Math.floor(i/windowWidth)/4);
                if((x && x%8 == 0) && (y && y%8 == 0)) textPixels.push({x: x, y: y});
            }
        }
        // console.log(textPixels.length);
        appnum=textPixels.length;
    }
    //聚合
    function getTogether() {
        for(var i=0, l=textPixels.length; i<l; i++) {
            circles[i].originX = offsetX + textPixels[i].x;
            circles[i].originY = offsetY + textPixels[i].y;
            dynamicGo(circles[i], 'in');
        }
        // console.log(circles.length+' '+textPixels.length)
    }
    //放出去变成漂浮状态
    function explode() {
        for(var i=0;i<textPixels.length;i++){
            dynamicGo(circles[i],'out');
        }
    }
    //下落
    function snow(){
        for(var i=0;i<textPixels.length;i++){
            dynamicGo(circles[i],'down');
        }
    }
    function endSnow(){
        circles[endSnowIndex%appnum].x=window.innerWidth*Math.random();
        circles[endSnowIndex%appnum].y=-5;
        dynamicGo(circles[endSnowIndex%appnum],'enddown');
        if(endSnowIndex<=10)console.log(circles[endSnowIndex]);
        endSnowIndex++;
        setTimeout(endSnow,300);
    }
    //点击页面监听
    function addListeners() {
        document.onclick=function(e){
            e.preventDefault();
            // 已聚合
            if(together){
                // 如果没有下落
                if(snowed==false){
                    snow();
                    snowed=true;
                }
                together=false;
            }
            // 没聚合（漂浮状态或已下落）
            else{
                // 如果下落过了就漂浮，否则聚合
                if(snowed){
                    explode();
                    snowed=false;
                    together=false;
                }
                else{
                    getTogether();
                    together=true;
                }   
            }
        }
    }
    window.onload = function() { 
        getStart() 
    };
})();