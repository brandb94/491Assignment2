# 491Assignment2
In this simple simulation you are started with a blank field and two armies to populate. There are controls to select which army you want to spawn soldiers for, as well as a small selection of formations you can choose from that will be placed when you click on the main board.

## Play the simulation [here](http://brandb94.github.io/491Assignment2/) 

###Interactions
* Soldier targeting: Upon spawning, soldiers will identify the closest enemy soldier and begin to pursue them. 
* Commander <-> Soldier connection: When a commander dies, it's army receives a debuff, lowering the army's hit chance. This effect does not stack when multiple commanders are killed. Instead, the debuff timer is reset with each additional commander death. Soldier size is also cut in half for the duration of the debuff.

###Controls
* Click buttons to determine which team and formation you want to spawn.
* Click the main canvas to spawn a soldier or formation of soldiers at your mouse location.
* Click the start button to begin the fight. Clicking it again will freeze the soldiers in place, allowing you to place more soldiers mid-simulation. 
* Space bar pauses the game.

###Emergent Behaviors
* Targets are selected based on proximity.
* Targets change as they are killed.
* Soldiers are demoralized when their commander dies. Resulting in a temporary size and hit chance reduction. 

#IMPORTANT: Due to the way I set up the second canvas, your browser window must be tall and wide enough to fit both canvases in their entirety to function properly. 

