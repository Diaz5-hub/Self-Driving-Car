const canvas=document.getElementById("myCanvas");
canvas.width = 200;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width/2,canvas.width*0.9);
const car = new Car(road.getLaneCenter(1),100,30,50,"KEYS");//in pixels
const traffic = [
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2)   //putting first car in front
]


animate();
function animate(){
    for(let i =0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);    //each car to update with the road borders
    }
    car.update(road.borders,traffic);

    canvas.height = window.innerHeight; //does not leave trail of car

    ctx.save();
    ctx.translate(0,-car.y+canvas.height*.70);  //centering the car and having illusion of camera following the car

    road.draw(ctx);
    for(let i =0;i<traffic.length;i++){
        traffic[i].draw(ctx,"red");   //drawing traffic car on the screen as red
    }
    car.draw(ctx,"blue");   //our car is blue

    ctx.restore();
    requestAnimationFrame(animate); //calls animate many times per second,gives illusion of movement

}