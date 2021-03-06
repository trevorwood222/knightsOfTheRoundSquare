
// ============================================================================================
// == General Start
// ============================================================================================
activeOpenBlockArray = [];
boardsToSplice = [];

function boardFinished(boardElementID){

	// document.getElementById("elementid")

	if(!$("#"+boardElementID+" .off:not(.start)").length && 
		!$("#"+boardElementID+" .beenHereAlready:not(.start)").length){
		console.log("Success! "+boardElementID+" has been completed!");
		$("#"+boardElementID).addClass("success");
	}else{
		console.log("Failed! "+boardElementID+" was not completed!");
		$("#"+boardElementID).addClass("failed");
	}

	//remove from progress array
	var index = activeBoards.indexOf(boardElementID);
	if (index > -1) {
		boardsToSplice.push(boardElementID);
	}
}
function spliceFinishedBoards(){
	for (var i = 0; i < boardsToSplice.length; i++) {
		var board = boardsToSplice[i];

		var index = activeBoards.indexOf(board);
		if (index > -1) {
	    activeBoards.splice(index, 1);
		}
	};
}


function createBoard(boardElementID,height,width,startX,startY){
	activeBoards[activeBoards.length] = boardElementID;

	$('body').append('<div class="board" size="'+width+'x'+height+'" id="'+boardElementID+'"></div>');
	var w = 1,
			h = 1;
	while(h <= height){//height		
		w = 1;
		while(w <= width){//width
			$('#'+boardElementID).append('<div id="'+boardElementID+'-'+w+'-'+h+'" class="box off" x="'+w+'" y="'+h+'"></div>');
			w++;
		}
		$('#'+boardElementID).append('<div style="clear:both;"></div>');
		h++;
	}
	chooseStart(boardElementID,height,width,startX,startY);
}

function chooseStart(boardElementID,height,width,x,y){
	if(x == undefined){
		var x = parseInt(Math.floor((Math.random() * width) + 1));
	}
	if(y == undefined){
		var y = parseInt(Math.floor((Math.random() * height) + 1));
	}
	$('#'+boardElementID+'-'+x+'-'+y).addClass("start active on").removeClass("off");
	createActiveOpenBlockArray(boardElementID,x,y);
}

function createActiveOpenBlockArray(boardElementID,x,y){
	activeOpenBlockArray[boardElementID] = [];

	var temp_x = 0,temp_y = 0;

	for (var i = 1; i <= 4; i++) {
		if(i == 1){//up
			temp_x = x,
			temp_y = y-1;
		}else if(i == 2){//down
			temp_x = x,
			temp_y = y+1;
		}else if(i == 3){//right
			temp_x = x+1,
			temp_y = y;
		}else if(i == 4){//left
			temp_x = x-1,
			temp_y = y;
		}else{
			continue;
		}
		if(doesBlockExist(boardElementID,temp_x,temp_y)){
			activeOpenBlockArray[boardElementID].push(temp_x+"-"+temp_y);
		}
	};	
}



function moveToNext(boardElementID,direction,userTouched){
	if(userTouched == 1){
		if(!$("#"+boardElementID).hasClass("userTouched")){
			$("#"+boardElementID).addClass("userTouched");
		}
	}

	var x = parseInt($('#'+boardElementID+' .active').attr('x')),
			y = parseInt($('#'+boardElementID+' .active').attr('y'));

	switch(direction){
		case "up": y--;break;
		case "down": y++;break;
		case "right": x++;break;
		case "left": x--;break;
		default:console.log("moveToNext(): direction not recognized: "+direction);break;
	}
	var removeFromActiveArray = x+"-"+y,
			removeFromActiveArrayIndex = activeOpenBlockArray[boardElementID].indexOf(removeFromActiveArray);
	if(removeFromActiveArrayIndex != -1){
		activeOpenBlockArray[boardElementID].splice(removeFromActiveArrayIndex,1);
	}



	moveToThisElement = '#'+boardElementID+'-'+x+'-'+y;

	if(!doesBlockExist(boardElementID,x,y)){
		
		if(userTouched == 1){
			console.log("You can't move there because that block doesn't exist.");
		}else{
			console.log("moveToNext(): asked to move to this element but it doesn't exist: "+moveToThisElement);
			boardFinished(boardElementID);
		}
		return;
	}
	if(blockHasClass("on",boardElementID,x,y)){		
		$(moveToThisElement).addClass("beenHereAlready");
		boardFinished(boardElementID);
	}
	if(blockHasClass("start",boardElementID,x,y)){
		boardFinished(boardElementID);
	}

	$('#'+boardElementID+' .active').removeClass("active");
	$(moveToThisElement).addClass("active on").removeClass("off");
}



function doesBlockExist(boardElementID,x,y){
	if($("#"+boardElementID+"-"+x+"-"+y).length){
		return true;
	}
	return false;
}



function blockHasClass(className,boardElementID,x,y){
	if($("#"+boardElementID+"-"+x+"-"+y).hasClass(className)){
		return true;
	}
	return false;
}

function blockIsOpenAndExists(boardElementID,x,y,debug){
	if(doesBlockExist(boardElementID,x,y) && blockHasClass("off",boardElementID,x,y)){
		if(debug != undefined){
			console.log("Block x:"+x+" y:"+y+" exists and is open");
		}
		return true;
	}
	if(debug != undefined){
		console.log("Block x:"+x+" y:"+y+" does not exist and/or is not open");
	}
	return false;
}

function isNextToActiveBlock(boardElementID,x,y){
	for (var i = 1; i <= 4; i++) {
		if(i == 1){
			var dir = "up";
		}else if(i == 2){
			var dir = "down";
		}else if(i == 3){
			var dir = "right";
		}else if(i == 4){
			var dir = "left";
		}else{
			continue;
		} 
		var cords = moveCordsOneBlock(dir,x,y),
				cord_x = parseInt(cords['x']),
				cord_y = parseInt(cords['y']);
		if(doesBlockExist(boardElementID,cord_x,cord_y) && blockHasClass("active",boardElementID,cord_x,cord_y)){
			return  true;
		}
	};
	return false;
}




function viewBlockMoveOptions(boardElementID,x,y,justLegitMoves){
	var data = [];
	data["legitMoves"] = []; 
	for (var i = 0; i < 4; i++) {
		switch (i){
			case 0://up
				var pos = "up", 
						cord_y = y-1,
						cord_x = x,
						cordIncrementor = -1;
				break;
			case 1://down
				var pos = "down", 
						cord_y = y+1,
						cord_x = x,
						cordIncrementor = 1;
				break;	
			case 2://right
				var pos = "right"; 
						cord_y = y,
						cord_x = x+1,
						cordIncrementor = 1;
				break;
			case 3://left
				var pos = "left"; 
						cord_y = y,
						cord_x = x-1,
						cordIncrementor = -1;
				break;
			default:
				break;
		}

		data[pos] = []; 
		data[pos]['moveableAmount'] = 0;
		data[pos]['ranIntoStartBlock'] = false;
		
		n = 0; 
		max = maxMoveRange(boardElementID);
		while(n <= max){
			if(!blockIsOpenAndExists(boardElementID,cord_x,cord_y) && 
					!blockHasClass("traversedBlock",boardElementID,cord_x,cord_y))
				{
					if(blockHasClass("start",boardElementID,cord_x,cord_y)){
						data[pos]['ranIntoStartBlock'] = true;
					}
					break;
				}		
			data[pos]['moveableAmount']++;
			if(i == 0 || i == 1){//up//down
				cord_y += cordIncrementor;
			}else{//right//left
				cord_x += cordIncrementor;
			}
		}	
		if(data[pos]['moveableAmount'] >= 1){
			data["legitMoves"].push(pos);
			if(justLegitMoves == 1){
				continue;
			}
		}
		
	};
	return data;
}

function moveCordsOneBlock(dir,x,y){
	if(dir == "up"){ 
		y--;
	}else if(dir == "down"){ 
		y++;
	}else if(dir == "right"){ 
		x++;
	}else if(dir == "left"){ 
		x--;
	}else{
		console.log("moveCordsOneBlock() direction not recognized: "+dir);
	}
	return {"x":x,"y":y};
}

function getOppositeDirections(dir){
	if(dir == "up"){
		var opp = "down",od1 = "right",od2 = "left";
	}else if(dir == "down"){
		var opp = "up",od1 = "right",od2 = "left";
	}else if(dir == "right"){
		var opp = "left", od1 = "up", od2 = "down";
	}else if(dir == "left"){
		var opp = "right", od1 = "up", od2 = "down";
	}else{
		console.log("getOppositeDirections() direction not recognized: "+dir); return	false;
	}
	return {"opp":opp,"od1":od1,"od2":od2};
}

function boardTotalBlocks(boardElementID){
	var size = $('#'+boardElementID).attr('size'),
			sizeArray = size.split("x"),
			widthBlocks = parseInt(sizeArray[0]),
			heightBlocks = parseInt(sizeArray[1]),
			totalBlocks = widthBlocks*heightBlocks;
	return totalBlocks;
}

function maxMoveRange(boardElementID){
	var size = $('#'+boardElementID).attr('size'),
			sizeArray = size.split("x"),
			widthBlocks = parseInt(sizeArray[0]),
			heightBlocks = parseInt(sizeArray[1]);
	if(widthBlocks > heightBlocks){
		return widthBlocks;
	}else{
		return heightBlocks;
	}
}

function percentageOfTheBoardTraversed(boardElementID){
	var totalBlocks = boardTotalBlocks(boardElementID),
			onBlocks = $('#'+boardElementID+" .on").length,
			percentage = onBlocks/totalBlocks;
	return percentage;
}

// ============================================================================================
// == General End
// ============================================================================================
// == thinkTankBrainFood Start
// ============================================================================================

function closestMove(movesArray,allowedMoves){
	bestMove = "none";
	for (var i = 1; i <= 4; i++) {
		if(i == 1){
			var pos = "up";
		}else if(i == 2){
			var pos = "down";
		}else if(i == 3){
			var pos = "right";
		}else if(i == 4){
			var pos = "left";
		}else{
			continue;
		}

		if(movesArray[pos]['moveableAmount'] == 0){
			continue;
		}
		if(allowedMoves != undefined && allowedMoves.indexOf(pos) == -1){
			continue;
		}


		if(bestMove == "none" || movesArray[pos]['moveableAmount'] < movesArray[bestMove]['moveableAmount']){
			bestMove = pos;
		}
	};
	return bestMove;
}


// ===================
// The main brain
// ===================
// -- takes a block, checks if it will block path to start
// 
// 1. from the start block, goes through each off block, 
// 		instead of one at a time, it spreads
//  	after it can no longer spread, it checks to see if it was able to
//  	spread to every block
// 2. if so return true
// 3. else return false and which side the block was open on
// 	- while this breaks some of the bigger boards, it fixes a lot more than it breaks
// =============================
// Ideas to fix bigger boards
// - to fix this, you would need to make it so that traverse does not spread, 
// - but instead can only move in one direction, 
// - which is doable but would probably increase processing times by 2
function traverseAllPathsIsPossible(boardElementID,block_x,block_y){

	var isPossible = false,
			openOn = "null";

	if(activeOpenBlockArray[boardElementID].length >= 2 && !$("#"+boardElementID).hasClass("userTouched")){
		isPossible = true;
		return {"boolean":isPossible,"openOn":openOn};
	}
	
	if(!activeOpenBlockArray[boardElementID][0]){
		boardFinished(boardElementID);
		return {"boolean":isPossible,"openOn":openOn};
	}	
	activeOpenBlockArray[boardElementID][0];


	var openBlockStartPosCords = activeOpenBlockArray[boardElementID][0],
			openBlockStartPosCordsSplit = openBlockStartPosCords.split("-"),
			x = parseInt(openBlockStartPosCordsSplit[0]),
			y = parseInt(openBlockStartPosCordsSplit[1]);

	if(block_x == x && block_y == y){
		openOn = "opposite";
		return {"boolean":isPossible,"openOn":openOn};
	}
	var totalOffBlocks = $("#"+boardElementID+" .off").length;
	$("#"+boardElementID+"-"+block_x+"-"+block_y).addClass("traversedBlock");

	
	$("#"+boardElementID+"-"+x+"-"+y).addClass("traversedBlock");
	var traverseBlocks = [{"x":x,"y":y}];
	while(traverseBlocks.length >= 1){
		x = traverseBlocks[0]['x'],
		y = traverseBlocks[0]['y'];
		var moveOptions = viewBlockMoveOptions(boardElementID,x,y);
		for (var m = 1; m <= 4; m++) {
			if(m == 1){
				var dir = "up";
			}else if(m == 2){
				var dir = "down";
			}else if(m == 3){
				var dir = "right";
			}else if(m == 4){
				var dir = "left";
			}else{
				continue;
			} 
			if(moveOptions[dir]['moveableAmount'] != 0){
				var newCords = moveCordsOneBlock(dir,x,y),
						new_x = newCords["x"],
						new_y = newCords["y"];

				if(!blockHasClass("traversedBlock",boardElementID,new_x,new_y) && !blockHasClass("on",boardElementID,new_x,new_y)){
					$("#"+boardElementID+"-"+new_x+"-"+new_y).addClass("traversedBlock");
					traverseBlocks.push(newCords);
				}
			}

		};
		
		traverseBlocks.shift();//remove first element
	}
	var totalTraversedBlocks = $("#"+boardElementID+" .traversedBlock").length;

	
	if(totalOffBlocks == totalTraversedBlocks){
		isPossible = true;
	}else{
		//find which side this block is open on
		for (var n = 1; n <= 4; n++) {
			if(n == 1){
				var dir = "up";
			}else if(n == 2){
				var dir = "down";
			}else if(n == 3){
				var dir = "right";
			}else if(n == 4){
				var dir = "left";
			}else{
				continue;
			} 
			var cords = moveCordsOneBlock(dir,block_x,block_y),
					cord_x = parseInt(cords['x']),
					cord_y = parseInt(cords['y']);

			if(blockIsOpenAndExists(boardElementID,cord_x,cord_y) && !blockHasClass("traversedBlock",boardElementID,cord_x,cord_y)){

				// check this block to see if it has more room to run
				// if block to right/left or top/bottom are open and right/left or 
				// top/bottom are closed do not pick this block

				//move these cords one // need to be moved to touch this block and start
				for (var i = 1; i <= 4; i++) {
					if(i == 1){
						var dir2 = "up";
					}else if(i == 2){
						var dir2 = "down";
					}else if(i == 3){
						var dir2 = "right";
					}else if(i == 4){
						var dir2 = "left";
					}else{
						continue;
					} 
					var cords2 = moveCordsOneBlock(dir2,cord_x,cord_y),
							cord_x2 = parseInt(cords2['x']),
							cord_y2 = parseInt(cords2['y']);
					if(blockIsOpenAndExists(boardElementID,cord_x2,cord_y2) && 
						!blockHasClass("traversedBlock",boardElementID,cord_x2,cord_y2) &&
						isNextToActiveBlock(boardElementID,cord_x2,cord_y2))
					{	
						break;
					}
				};
				var top_y	= cord_y2-1,
						bottom_y = cord_y2+1,
						right_x = cord_x2+1,
						left_x = cord_x2-1;

				//top//bottom//right//left
				if(blockIsOpenAndExists(boardElementID,cord_x2,top_y) && blockIsOpenAndExists(boardElementID,cord_x2,bottom_y) &&
					!blockIsOpenAndExists(boardElementID,right_x,cord_y2) && !blockIsOpenAndExists(boardElementID,left_x,cord_y2)
					){
					continue;
				}
				//right//left//top//bottom
				if(blockIsOpenAndExists(boardElementID,right_x,cord_y2) && blockIsOpenAndExists(boardElementID,left_x,cord_y2) &&
					!blockIsOpenAndExists(boardElementID,cord_x2,top_y) && !blockIsOpenAndExists(boardElementID,cord_x2,bottom_y)
					){
					continue;
				}

				openOn = dir;
				break;
			}
		};
		
	}
	$("#"+boardElementID+" .traversedBlock").removeClass("traversedBlock");

	// console.log("traversedBlock boolean:"+isPossible+" openOn:"+openOn);
	return {"boolean":isPossible,"openOn":openOn};

}

function doHolesNeedToBeFilled(boardElementID){
	var pass_x = parseInt($("#"+boardElementID+" .active").attr("x")),
			pass_y = parseInt($("#"+boardElementID+" .active").attr("y"));

	for (var i = 1; i <= 4; i++) {
		if(i == 1){
			var dir = "up";
		}else if(i == 2){
			var	dir = "down";
		}else if(i == 3){
			var	dir = "right";
		}else if(i == 4){
			var	dir = "left";
		}else{
			continue;
		}
		var cords = moveCordsOneBlock(dir,pass_x,pass_y),
				cord_x = parseInt(cords['x']),
				cord_y = parseInt(cords['y']);

		if(blockIsOpenAndExists(boardElementID,cord_x,cord_y)){
			var openSideBlocks = 0;
			for (var n = 1; n <= 4; n++) {
				if(n == 1){
					var dir2 = "up";
				}else if(n == 2){
					var	dir2 = "down";
				}else if(n == 3){
					var	dir2 = "right";
				}else if(n == 4){
					var	dir2 = "left";
				}else{
					continue;
				}
				var cords = moveCordsOneBlock(dir2,cord_x,cord_y),
						cord_x2 = cords['x'],
						cord_y2 = cords['y'];

				if(
						blockIsOpenAndExists(boardElementID,cord_x2,cord_y2) || 
						(
							blockHasClass("start",boardElementID,cord_x2,cord_y2)
						)
					)
				{
					openSideBlocks++;					
				}

			};
			if(openSideBlocks == 1){
				return {"boolean":true,"fillHoleSide":dir};
			}
		}
	};
	return {"boolean":false};
}


// this fixes a few bugs, in the bigger maps
// but slows it down a little
function willThisBlockCreateA2x2Trap(boardElementID,block_x,block_y){
	var moveOptions = viewBlockMoveOptions(boardElementID,block_x,block_y,1);
	dance:
	for (var i = 0; i < moveOptions['legitMoves'].length; i++) {
		var twoByTwoArea = [];

		var firstMove = moveOptions['legitMoves'][i],
				opposites1 = getOppositeDirections(firstMove),
				cords1 = moveCordsOneBlock(firstMove,block_x,block_y),
				cords1_x = cords1['x'],
				cords1_y = cords1['y'],
				cords1MoveOptions = viewBlockMoveOptions(boardElementID,cords1_x,cords1_y,1);

		twoByTwoArea["center1"] = {"x":cords1_x,"y":cords1_y};

		if(cords1MoveOptions['legitMoves'].indexOf(firstMove) == -1 ||
			(cords1MoveOptions['legitMoves'].indexOf(opposites1['od1']) == -1 && 
				cords1MoveOptions['legitMoves'].indexOf(opposites1['od2']) == -1))
		{ 
			// console.log("2x2Trap not possible firstMove: "+firstMove);
			// console.log("moveOptions");
			// console.log(moveOptions);

			// console.log("opp:"+ opposites1['opp']);
			// console.log("od1:"+ opposites1['od1']);
			// console.log("od2:"+ opposites1['od2']);

			continue;//it's not possible for this to create a hole 
		}
		// second moves from block
		// console.log("FIRST MOVE:"+firstMove);
		// console.log("cords: x:"+cords1_x+"y:"+cords1_y);
		for (var n = 1; n <= 4; n++) {
			if(n == 1){
				var secondMove = "up";
			}else if(n == 2){
				var secondMove = "down";
			}else if(n == 3){
				var secondMove = "right";
			}else if(n == 4){
				var secondMove = "left";
			}else{
				continue;
			}
			if(opposites1['opp'] == secondMove){
				continue;
			}
			var cords2 = moveCordsOneBlock(secondMove,cords1_x,cords1_y),
					cords2_x = cords2['x'],
					cords2_y = cords2['y'];

					// console.log("secondMove:"+secondMove);
					// console.log("moveAfterCords: x:"+cords2_x+"y:"+cords2_y);


			
			// third moves form block
			if(secondMove == firstMove){
				if(blockIsOpenAndExists(boardElementID,cords2_x,cords2_y)){
					twoByTwoArea["center2"] = {"x":cords2_x,"y":cords2_y};//possible to add 1 block
				}else{
					// console.log("center2 does not exist or is not open. break dance");
					break dance;
				}
				
			}else{
				var cords3 = moveCordsOneBlock(firstMove,cords2_x,cords2_y),
						cords3_x = cords3['x'],
						cords3_y = cords3['y'];
						// console.log("thirdMove:"+firstMove);
						// console.log("moveAfterCords: x:"+cords3_x+"y:"+cords3_y);
				if(blockIsOpenAndExists(boardElementID,cords2_x,cords2_y) &&
					blockIsOpenAndExists(boardElementID,cords3_x,cords3_y)){
					if(twoByTwoArea["side1"] == undefined){
						twoByTwoArea["side1"] = {"x":cords2_x,"y":cords2_y};
						twoByTwoArea["side2"] = {"x":cords3_x,"y":cords3_y};
					}else{
						twoByTwoArea["third1"] = {"x":cords2_x,"y":cords2_y};
						twoByTwoArea["third2"] = {"x":cords3_x,"y":cords3_y};
					}
					continue;
				}
			}
		};

		// array.length does not work for named keys
		if(
			(twoByTwoArea["center1"] == undefined || 
			twoByTwoArea["center2"] == undefined ||
			twoByTwoArea["side1"] == undefined || 
			twoByTwoArea["side2"] == undefined) 
			|| 
			(twoByTwoArea["third1"] != undefined && 
			twoByTwoArea["third2"] != undefined)
			)
		{
			console.log("firstMove cannot create a trap: "+firstMove);
			console.log(twoByTwoArea);
			console.log("twoByTwoArea.length");
			console.log(twoByTwoArea.length);
			continue;
		}
		// console.log("we've got a live one");
		// console.log(twoByTwoArea);


		var openSides = [],
				openSidesCount = 0;
		// check each block, should only be 4
		for (var m = 1; m <= 4; m++) {
			if(m == 1){
				var pos = "center1";
			}else if(m == 2){
				var pos = "center2";
			}else if(m == 3){
				var pos = "side1";
			}else if(m == 4){
				var pos = "side2";
			}else{ continue; }
			openSides[pos] = "closed";
			// console.log("inside the for loop pos:"+pos);

			for (var v = 1; v <= 4; v++) {
				if(v == 1){
					var move = "up";
				}else if(v == 2){
					var move = "down";
				}else if(v == 3){
					var move = "right";
				}else if(v == 4){
					var move = "left";
				}else{continue;}
				var cords4_x = twoByTwoArea[pos]['x'],
						cords4_y = twoByTwoArea[pos]['y'],
						cords5 = moveCordsOneBlock(move,cords4_x,cords4_y),
						cords5_x = cords5['x'],
						cords5_y = cords5['y'];

				// make sure this block isn't responding one of our 2x2 blocks
				if( (cords5_x == twoByTwoArea["center1"]['x'] && cords5_y == twoByTwoArea["center1"]['y']) ||
						(cords5_x == twoByTwoArea["center2"]['x'] && cords5_y == twoByTwoArea["center2"]['y']) ||
						(cords5_x == twoByTwoArea["side1"]['x'] && cords5_y == twoByTwoArea["side1"]['y']) ||
						(cords5_x == twoByTwoArea["side2"]['x'] && cords5_y == twoByTwoArea["side2"]['y']) 
					)
				{
					continue;
				}
				if(doesBlockExist(boardElementID,cords5_x,cords5_y) && !(cords5_x == block_x && cords5_y == block_y) &&
						(blockHasClass("start",boardElementID,cords5_x,cords5_y) || blockHasClass("off",boardElementID,cords5_x,cords5_y))
					)
				{
					openSides[pos] = "open";
					openSidesCount++;
					break;
				}
			};
			console.log("openSides");
			console.log(openSides);
			console.log("openSidesCount:"+openSidesCount);
			if(openSidesCount != 1 && 
					((openSides['center1'] == "open" && openSides['center2'] == "closed" && openSides['side1'] == "closed") ||
					(openSides['center2'] == "open" && openSides['center1'] == "closed" && openSides['side2'] == "closed") ||
					(openSides['side1'] == "open" && openSides['center1'] == "closed" && openSides['side2'] == "closed") ||
					(openSides['side2'] == "open" && openSides['center2'] == "closed" && openSides['side1'] == "closed"))
				)
			{
				console.log("openSidesCount:"+openSidesCount);
				console.log("willThisBlockCreateA2x2Trap: true move:"+firstMove);
				return {"boolean":true};
			}

		};
	};

	// console.log("willThisBlockCreateA2x2Trap: false");
	return {"boolean":false};

}


// ============================================================================================
// == thinkTankBrainFood End
// ============================================================================================
// == thinkTank Start
// ============================================================================================

function thinkTank(){
	if(activeBoards.length == 0){
		clearInterval(thinkTankLoop_timer);
		thinkTankLoop_timer = 0;
		return;
	}

	for (var i = 0; i < activeBoards.length; i++) {


		var boardElementID = activeBoards[i],
				x = parseInt($('#'+boardElementID+" .active").attr('x')),
				y = parseInt($('#'+boardElementID+" .active").attr('y'));

		
		var moveOptions = viewBlockMoveOptions(boardElementID,x,y);
		
		var bestMove = "none";
		// if no moves, ya done
		// if one move, it's king of obvious
		if(moveOptions["legitMoves"].length == 0){
			for (var i = 1; i <= 4; i++) {
				if(i == 1){
					var pos = "up";
				}else if(i == 2){
					var pos = "down";
				}else if(i == 3){
					var pos = "right";
				}else if(i == 4){
					var pos = "left";
				}else{
					console.log('thinkTank():'+boardElementID+': has no where to move, finished');
					boardFinished(boardElementID);
					continue;
				}
				if(moveOptions[pos]['ranIntoStartBlock']){
					bestMove = pos;
					$('#'+boardElementID+" .start").removeClass("on").addClass("off");
				}
			};
		}else if(moveOptions["legitMoves"].length == 1){
			bestMove = moveOptions["legitMoves"][0];
		}

		var doHolesExist = doHolesNeedToBeFilled(boardElementID);
		if(doHolesExist['boolean']){
			bestMove = doHolesExist['fillHoleSide'];
		}

		// will this move make a trap
		// traps only really occur on bigger maps
		// and this slows down 8x8 considerably
		if(bestMove == "none" && 
			(CONSTANT_height >= 12 && CONSTANT_width >= 12 || $("#"+boardElementID).hasClass("userTouched")))
		{
			// check each possible move
			for (var i = 0; i < moveOptions['legitMoves'].length; i++) {
				var move = moveOptions['legitMoves'][i];
				var cords = moveCordsOneBlock(move,x,y),
						cord_x = cords['x'],
						cord_y = cords['y'];
				var res = willThisBlockCreateA2x2Trap(boardElementID,cord_x,cord_y);
				if(res['boolean'] == true){
					var index = moveOptions['legitMoves'].indexOf(move);
					if(index != -1){
						moveOptions['legitMoves'].splice(index,1);
						i = i-1;
					}
				}
			};
		}


		//traversable
		if(bestMove == "none"){
			var traversableMovesArray = [];

			var active_x = parseInt($("#"+boardElementID+" .active").attr('x')),
					active_y = parseInt($("#"+boardElementID+" .active").attr('y'));

			while(moveOptions['legitMoves'].length >= 1){
				var pos = moveOptions['legitMoves'][0];

				var cords = moveCordsOneBlock(pos,active_x,active_y),
						x = parseInt(cords['x']),
						y = parseInt(cords['y']);

				var result = traverseAllPathsIsPossible(boardElementID,x,y);
				if(result['boolean'] == false){//openOn
					var openOn = result['openOn'];

					if(openOn == "opposite"){
						var opposites = getOppositeDirections(pos),
								openOn = opposites['opp'];
					}
					
					if(openOn != "null"){
						var cords = moveCordsOneBlock(openOn,active_x,active_y),
								x = parseInt(cords['x']),
								y = parseInt(cords['y']);

						var result2 = traverseAllPathsIsPossible(boardElementID,x,y);
						if(result2['boolean'] == true){
							bestMove = openOn;
							break;
						}else{
							var openOnIndex = moveOptions['legitMoves'].indexOf(openOn);
							if(openOnIndex != -1){
								moveOptions['legitMoves'].splice(openOnIndex,1);
								if(openOnIndex == 0){
									continue;
								}
							}
						}
					}
				}else{
					traversableMovesArray.push(pos);
				}
				moveOptions['legitMoves'].shift();
			};

			if(bestMove == "none"){
				bestMove = closestMove(moveOptions,traversableMovesArray);				
			}

		}
	
		moveToNext(boardElementID,bestMove);
	};
	spliceFinishedBoards();
}




// ============================================================================================
// == thinkThank End
// ============================================================================================
// == Operators and inits Start
// ============================================================================================



thinkTankLoop_timer = 0;
function thinkTankLoop(){
	if(thinkTankLoop_timer == 0){
		thinkTankLoop_timer = 1;
		thinkTankLoop_timer = setInterval(function(){ 
			thinkTank();
		}, CONSTANT_loopSpeed);
	}else{
		clearInterval(thinkTankLoop_timer);
		thinkTankLoop_timer = 0;
	}
}







activeBoards = [];


CONSTANT_height = parseInt($('.easyVar.height').text()),
CONSTANT_width = parseInt($('.easyVar.width').text()),
CONSTANT_loopSpeed = parseInt($('.easyVar.speed').text()),//200 default
CONSTANT_boardsToCreate = parseInt($('.easyVar.boards').text());


// createBoard("alpha",CONSTANT_height,CONSTANT_width,6,6);//broken
// createBoard("alpha2",CONSTANT_height,CONSTANT_width,3,6);//broken
// createBoard("alpha",CONSTANT_height,CONSTANT_width,12,17);//broken
// createBoard("alpha",CONSTANT_height,CONSTANT_width,10,9);//12x12 - explain


for (var i = 0; i < CONSTANT_boardsToCreate; i++) {
	var foo = "place"+i;
	createBoard(foo,CONSTANT_height,CONSTANT_width);
};


$(document).on("click",'.board',function(){
	if($(this).hasClass("selected")){
		$('.board').removeClass("selected");
		return;
	}
	$('.board').removeClass("selected");
	$(this).addClass("selected");	
});
window.addEventListener("keydown", function(e) {
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

$('#new').on("click",function(){
	$('.board').remove();
	activeBoards = [];
	activeOpenBlockArray = [];
	boardsToSplice = [];
	for (var i = 0; i < CONSTANT_boardsToCreate; i++) {
		var foo = "place"+i;
		createBoard(foo,CONSTANT_height,CONSTANT_width);
	};
});
$('#playButton').on("click",function(){
	thinkTankLoop();
});

$('body').on("keyup",function(e){
	// console.log("received key: "+e.keyCode);
	switch(e.keyCode){
		case 32://space
			var direction = "space";
			break;
		case 93://command
			var direction = "command";
			break;
		case 39://right
			var direction = "right",
					selected = $('.selected').attr("id");
			break;
		case 37://left
			var direction = "left",
					selected = $('.selected').attr("id");
			break;
		case 38://up
			var direction = "up",
					selected = $('.selected').attr("id");
			break;
		case 40://down
			var direction = "down",
					selected = $('.selected').attr("id");
			break;
		default:
			return;
	}
	if(direction == "command"){
		thinkTank();
		return;
	}
	if(direction == "space"){
		thinkTankLoop();
		return;
	}
	if($('.selected').length){
		moveToNext(selected,direction,1);
	}
	
});
