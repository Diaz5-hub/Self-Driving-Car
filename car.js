class Car{
    constructor(x,y,width,height,controlType,maxSpeed=3){
        this.x =x;
        this.y = y;
        this.width =width;
        this.height = height;

        this.speed = 0;
        this.acceleration =0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged =false;

        this.useBrain = controlType == "AI";    //the brain the car has is in use for AI

        if(controlType != "DUMMY"){
            this.sensor = new Sensor(this); //only OUR car has sensors
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount,6,4]//4 for forward,left,back,right, 1 for hidden 1 for output --> 6
            );
        }

        this.controls = new Controls(controlType);
    }

    update(roadBorders,traffic){    //passing roadborders so sensor can sense them
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged= this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor){    //only sensor for OUR car
        this.sensor.update(roadBorders,traffic);    //so update in sensor js can use roadborders to sense them
        const offsets = this.sensor.readings.map(   //readings have an x,y and offset to where reading was
            s=>s==null?0:1-s.offset //maybe offsets instead
        );       //if null return 0 as no reading, otherwise 1 minues sensor offset so our neurons receive low vaulues if object is far away
            const outputs = NeuralNetwork.feedForward(offsets,this.brain);//high values close to 1 if object is close
            //just light pointing a flashlight at wall. light is stronger when closer to the wall

            if(this.useBrain){  //giving AI car its own movement
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }       
    }           

    #assessDamage(roadBorders,traffic){
        for(let i =0;i<roadBorders.length;i++){ //colliding with road borders, will recieve "damage"
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }
        for(let i =0;i<traffic.length;i++){ //situation when colliding with the dummy car, will receive "damage"
            if(polysIntersect(this.polygon,traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }


    #createPolygon(){
        const points=[];    //list of points for each edge of the car
        const rad = Math.hypot(this.width,this.height)/2;//getting angle from the ray to the right corner and the height of the ray pointing forward
        const alpha = Math.atan2(this.width,this.height);
        points.push({//finding top right point 
            x:this.x-Math.sin(this.angle-alpha)*rad,    
            y:this.y-Math.cos(this.angle-alpha)*rad     
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,    
            y:this.y-Math.cos(this.angle+alpha)*rad     
        });
        points.push({ 
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,    
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad     
        });
        points.push({ 
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,    
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad     
        });
        return points;

    }

    #move(){
        if(this.controls.forward){
            this.speed += this.acceleration; //car speeds up with acceleration
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration;  //car slow downs with accerlation
        }
        if(this.speed >this.maxSpeed){ //if car is going too fast, set to max speed 
            this.speed = this.maxSpeed;
        }
        if(this.speed <- this.maxSpeed/2){ //- indicates car is going backwards 
            this.speed =-this.maxSpeed/2
        }
        if(this.speed > 0){
            this.speed -=this.friction;
        }
        if(this.speed <0){
            this.speed +=this.friction;
        }
        if(Math.abs(this.speed) < this.friction){
            this.speed =0;      //stops the car from moving when tyring to move at a very low speed
        }
        if(this.speed != 0){        //to have the car function like a normal car, would
            const flip = this.speed>0?1:-1; //eliminate abormal car turns. if hold down and right key, car would move in that direction
            if(this.controls.left){
            this.angle+=0.03*flip;
            }
            if(this.controls.right){
            this.angle-=0.03*flip;   //works with the unit circle
            }
        }
        this.x -= Math.sin(this.angle)*this.speed;   //move towards right, - -> is right on unit circle
        this.y -= Math.cos(this.angle)*this.speed;  
    }
    draw(ctx,color,drawSensor=false){
        if(this.damaged){       //testing polygon intersect function
            ctx.fillStyle = "gray";
        }
        else{
            ctx.fillStyle = color;  //assigning the color to the car
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y);    //move to first point in polygon and loop through remaining points
        for(let i =0;i<this.polygon.length;i++){
            ctx.lineTo(this.polygon[i].x,this.polygon[i].y);    //lineto connects a line
        }
        ctx.fill(); //fill the shape created
        if(this.sensor && drawSensor){
        this.sensor.draw(ctx);
        }
    }
}