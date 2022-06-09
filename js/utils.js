function rectangularCollision({rect1, rect2}) {
    return (rect1.attackBox.position.x + rect1.attackBox.width >= rect2.position.x
        && rect1.attackBox.position.x <= rect2.position.x + rect2.width
        && rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y
        && rect1.attackBox.position.y <= rect2.position.y + rect2.height)
}

// winner is the one with most remaining health
function determineWinner({player, enemy, timerId}) {
    clearTimeout(timerId);
    const displayText = document.querySelector('#displayText');
    if (player.health === enemy.health) {
        displayText.innerHTML = 'Tie';
    } else if (player.health > enemy.health) {
        displayText.innerHTML = 'Player 1 Wins';
    } else if (enemy.health > player.health) {
        displayText.innerHTML = 'Player 2 Wins';
    }
    displayText.style.display = 'flex';
}

let timer = 100;
let timerId;
function decreaseTimer() {
    if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 600); // call function every second
        timer--;
        document.querySelector("#timer").innerHTML = timer;
    }
    if (timer == 0) { // end game because of time out
        determineWinner({player, enemy, timerId});
    }
    
}