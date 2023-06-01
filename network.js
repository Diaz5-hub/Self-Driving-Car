class NeuralNetwork{
    constructor(neuronCounts){  //nueronCount is the number of nuerons in each layer
        this.levels = [];
        for(let i =0;i<neuronCounts.length-1;i++){
            this.levels.push(new Level(
                neuronCounts[i],neuronCounts[i+1]
            ));
        }
    }
    static feedForward(givenInputs,network){
        let outputs = Level.feedForward(
            givenInputs,network.levels[0]);
            for(let i =1;i<network.levels.length;i++){      //loop through remaining levels and update outputs with feedforward result from level i
                outputs=Level.feedForward(      //essentially putting in the output of the previous level as the input of the new level and the final outputs will tell us  if the car should go in direction(forward,backwar,etc)
                    outputs,network.levels[i]);
            }
            return outputs;
    }

    static mutate(network,amount=1){
        network.levels.forEach(level => {
            for(let i =0;i<level.biases.length;i++){
                level.biases[i]=lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }
            for(let i=0;i<level.weights.length;i++){
                for(let j =0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
    }
}


class Level{
    constructor(inputCount,outputCount){        //inputs are values we get from the car sensors
        this.inputs = new Array(inputCount);    //defining the neurons with simple arrays of values
        this.outputs = new Array(outputCount);  
        this.biases = new Array(outputCount);   //each output neuron has a bias which is a value above it will fire

        this.weights = [];
        for(let i =0;i<inputCount;i++){
            this.weights[i] = new Array(outputCount);   //for each input node, need output count number of connections, 1 input can have 4 output connections
        }
        Level.#randomize(this);
    }

    static #randomize(level){
        for(let i =0;i<level.inputs.length;i++){    //for each input check its output
            for(let j =0;j<level.outputs.length;j++){   //every input output pair is set value between -1 and 1
                level.weights[i][j]=Math.random()*2-1;  //giving us value between -1 and 1
            }
        }

        for(let i =0;i<level.biases.length;i++){
            level.biases[i] = Math.random()*2-1;            //between -1 and 1 
        }
    }
    static feedForward(givenInputs,level){
        for(let i =0;i<level.inputs.length;i++){        //hyperplane equation need to have between -1 and 1 to manipulate situations
            level.inputs[i] = givenInputs[i];       //go through all level inputs and set to given inputs that come from the sensor
        }
        for(let i =0;i<level.outputs.length;i++){       //get the outputs
            let sum =0;
            for(let j =0;j<level.inputs.length;j++){        //loop through inputs
                sum+=level.inputs[j]*level.weights[j][i];   //sum will be product between jth input and weight between jth input and ith output
            }
            if(sum > level.biases[i]){
                level.outputs[i]=1;
            }
            else{
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }
}