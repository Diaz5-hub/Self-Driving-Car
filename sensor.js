class Sensor{
    constructor(car){
        //for sensor to know where the car is, supposed to be attachaed to car
        this.car=car;
        this.rayCount =5;
        this.rayLength = 160;       //used as the range for the sensor ahead
        this.raySpread = Math.PI/2; //same as 45 degrees. angle we are spreading the rays to sensor

        this.rays = [];
        this.readings=[];
    }
    
    update(roadBorders,traffic){
        this.#castRays();
        this.readings = [];
        for(let i =0;i<this.rays.length;i++){
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic)
            )
        };
    }
    #getReading(ray,roadBorders,traffic){
        let touches=[];
        for(let i =0;i<roadBorders.length;i++){
            const touch = getIntersection(  //returns x,y and the offset
                ray[0], //have 2 borders at the moment
                ray[1], 
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if(touch){      //add to touches if touch happened
                touches.push(touch);
            }
        }

        for(let i =0;i<traffic.length;i++){ //sensor from OUR car reading(sensing) the dummy car 
            const poly = traffic[i].polygon;
            for(let j =0;j<poly.length;j++){
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if(value){
                    touches.push(value);
                }
            }
        }

        if(touches.length == 0){
            return null;
        }
        else{
            const offsets= touches.map(e=>e.offset);// e=>e.offset goes through all elements and gets offset from each element
                    //returns new array "offets"
            const minOffest = Math.min(...offsets);  // ... is spreading array into many different individual values as min cannot take array as argument
            return touches.find(e=>e.offset==minOffest);
        }
    }
    #castRays(){
        this.rays = [];
        for(let i = 0;i<this.rayCount;i++){
            const rayAngle = lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount==1?0.5:i/(this.rayCount-1)
            )+this.car.angle;   //for the sensor to stay in the direction the car is facing
            const start = {x:this.car.x, y:this.car.y};
            const end = {
                x:this.car.x-
                Math.sin(rayAngle)*this.rayLength,
                y:this.car.y-
                Math.cos(rayAngle)*this.rayLength
            };
            this.rays.push([start,end]);
        }
    }
    draw(ctx){
        for(let i =0;i<this.rayCount;i++){
            let end = this.rays[i][1];
            if(this.readings[i]){
                end = this.readings[i]; //pass the x and y from getintersection method to this
            }
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(
                this.rays[i][1].x,  //tip of the ray of where the end of ray could be to the endpoint if a reading
                this.rays[i][1].y
            );          //sensor turns black when it touches(senses) the end of the road
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}