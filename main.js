const carCanvas=document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2,carCanvas.width*0.9);

const N =150;
const cars = generateCars(N);
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")){      //if have best brain stored, set brain of the car to this value
    for(let i =0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
            if(i!=0){
                NeuralNetwork.mutate(cars[i].brain,0.1);
            }
    }
}

const traffic = [
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),   //putting first car in front
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2),
]


animate();

function save(){
    localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars =[];
    for(let i =0;i<N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return cars;
}

function animate(time){
    for(let i =0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);    //each car to update with the road borders
    }
    for(let i =0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }
    bestCar = cars.find(      //finding the cars the goes upward the most, minimum y value and focusing on it 
        c=>c.y==Math.min(       //spreading the array to pass into min function,and find cars y value is the minimum y value
            ...cars.map(c=>c.y)
        ));

    carCanvas.height = window.innerHeight; //does not leave trail of car
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*.70);  //centering the car and having illusion of camera following the car

    road.draw(carCtx);
    for(let i =0;i<traffic.length;i++){
        traffic[i].draw(carCtx,"red");   //drawing traffic car on the screen as red
    }

    carCtx.globalAlpha = 0.2;

    for(let i =0;i<cars.length;i++){
        cars[i].draw(carCtx,"blue");    //our car is blue
    }
    carCtx.globalAlpha = 1; //reseting to 1 to not affect drawing in next frame

    bestCar.draw(carCtx,"blue",true);   //only car for which we draw the sensors

    carCtx.restore();
    networkCtx.lineDashOffset = -time/50;       //showing neural network from feed forward algorithm
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate); //calls animate many times per second,gives illusion of movement

}