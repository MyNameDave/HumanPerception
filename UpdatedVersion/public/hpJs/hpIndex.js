(async () => {
    var stage,textStage;
    var circles,textPixels,together,snowed;
    var endSnowIndex=0;
    var text;
    var imgnum=112; // This line is about to control how many images，it pulls from img files.
    var appnum=1;
    var input="H u m a n\nP e r c e p t i o n "; // This is the text that the main (big) word changes into. 
    //Note: The text looks better whenever it's spacecd out each letter
    var scale1=0.72 ,scale2=0.24; //Original setting were 36- 12 | Affects font boldness
    var fontsize=150; //have a method to initialize so this doesn't really matter. 
	var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
	
    function getStart() {
        initFontSize();
        initStage();
        initCircles();
        step();
        addListeners();
    }

    function initFontSize(){
        fontsize = windowWidth / 8;
    }
	
    function initStage() {
        input=input.toUpperCase();

        textStage = new createjs.Stage("text");
        textStage.canvas.width = windowWidth;
        textStage.canvas.height = windowHeight;

        stage = new createjs.Stage("stage");
        stage.canvas.width = windowWidth;
        stage.canvas.height = windowHeight;
        
        text = new createjs.Text("", fontsize + "px Bauhaus", "#FFFFFF"); //The text has to be #000 or it breaks for some reason.
        text.alpha=0.01;
        together=false;
        snowed=false;
        //This needs to go twice, otherwise, bug. | Update not sure what this means.
        createText(input);
    }

    function initCircles() {
        circles = [];
        for(var i=0; i<appnum; i++) {
            var img = new Image();
            var x = windowWidth * Math.random();
            var y = windowHeight * Math.random();
            img.src = "/hpImg/" + Math.floor(Math.random()*imgnum) + ".png";
            var jsBitmap = new createjs.Bitmap(img);
            jsBitmap.x=x;
            jsBitmap.y=y;
            jsBitmap.scaleX=scale1;
            jsBitmap.scaleY=scale1;
            jsBitmap.alpha=0.2 + Math.random()*0.5;
            circles.push(jsBitmap);
            stage.addChild(jsBitmap);
            jsBitmap.movement = 'float';
            dynamicGo(jsBitmap);
        }
    }

    function step() {
        stage.update();
        requestAnimationFrame(step);
    }

    function dynamicGo(c, dir) {
        if(c.tween) c.tween.kill();
        if(dir == 'in') {
            c.tween = TweenLite.to(c, 1, {x: c.originX, y: c.originY, ease:Quad.easeInOut, alpha: 1, scaleX: scale2, scaleY: scale2, onComplete: function() {
                c.movement = 'jiggle';
                dynamicGo(c);
            }});
        } 
        else if(dir == 'out') {
            c.tween = TweenLite.to(c, 1, {x: windowWidth * Math.random(), y: windowHeight * Math.random(), ease:Quad.easeInOut, alpha: 0.2 + Math.random()*0.5, scaleX: scale1, scaleY: scale1, onComplete: function() {
                c.movement = 'float';
                dynamicGo(c);
            }});
        }
        else if(dir == 'down'){
            //todo
            c.tween = TweenLite.to(c, Math.random()*2+1, {x: c.x, y: windowHeight, ease:Quad.easeInOut, alpha: 0.4 + Math.random()*0.5, scaleX: scale2+Math.random()*(scale1-scale2), scaleY: scale2+Math.random()*(scale1-scale2), onComplete: function(){
                // showDesp();
            }});
        }
        else if(dir == 'enddown'){
            c.tween = TweenLite.to(c, Math.random()*10+10, {x: c.x, y: windowHeight, ease:Quad.easeInOut, alpha: 0.2 + Math.random()*0.5, scaleX: scale2+Math.random()*(scale1-scale2), scaleY: scale2+Math.random()*(scale1-scale2), onComplete: function(){
                // showDesp();
            }});
        }
        else {
            if(c.movement == 'float') {
                c.tween = TweenLite.to(c, 5 + Math.random()*3.5, {x: c.x + -100+Math.random()*200, y: c.y + -100+Math.random()*200, ease:Quad.easeInOut, alpha: 0.2 + Math.random()*0.5,
                    onComplete: function() {
                        dynamicGo(c);
                    }});
            } 
            else if(c.movement == 'jiggle'){
                c.tween = TweenLite.to(c, 0.05, {x: c.originX + Math.random()*3, y: c.originY + Math.random()*3, ease:Quad.easeInOut,
                    onComplete: function() {
                        dynamicGo(c);
                    }});
            }
        }
    }
    
    function createText(_text) {
        text.text = _text;
        text.font = fontsize +"px Bauhaus";
        text.textAlign = 'center';
        text.x = windowWidth / 2; //This will offset the overall text being shown. 
        text.y = windowHeight / 8;
        textStage.addChild(text);
        textStage.update();
        var ctx = document.getElementById('text').getContext('2d');
        var pix = ctx.getImageData(0, 0, windowWidth, windowHeight * 2).data; //This is the data that changes the size of the overall text. 
        var testingInt = 12; //Density of font / boldness | Higher means less dense.

        textPixels = [];
        for (var i = pix.length; i >= 0; i -= 4)//i-=4 was original 
		{
            if (pix[i] != 0) {
                var x = (i / 4) % windowWidth;
                var y = Math.floor((i/windowWidth)/4); 
                if((x && x % testingInt == 0) && (y && y % testingInt == 0)){
                    textPixels.push({x: x, y: y});
                }
            }
        }
        appnum=textPixels.length;
    }
    
    function getTogether() {
        for(var i=0, l=textPixels.length; i<l; i++) {
            circles[i].originX = textPixels[i].x;
            circles[i].originY = textPixels[i].y;
            dynamicGo(circles[i], 'in');
        }
    }
    function explode() {
        for(var i=0;i<textPixels.length;i++){
            dynamicGo(circles[i],'out');
        }
    }
    function snow(){
        for(var i=0;i<textPixels.length;i++){
            dynamicGo(circles[i],'down');
        }
    }
    function endSnow(){
        circles[endSnowIndex%appnum].x = windowWidth * Math.random();
        circles[endSnowIndex%appnum].y = -5;
        dynamicGo(circles[endSnowIndex%appnum],'enddown');
        if(endSnowIndex<=10)console.log(circles[endSnowIndex]);
        endSnowIndex++;
        setTimeout(endSnow,300);
    }
    function addListeners() {
        document.onclick=function(e){
            e.stopPropagation();
            if(together){
                if(snowed==false){
                    snow();
                    snowed=true;
                }
                together=false;
            }
            else{
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
    window.onload = await function() { 
        getStart() 
    };
})();