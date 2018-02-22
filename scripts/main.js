"use strict"
/*
Etch-a-sketch grid with Conway's Game Of Life functionality

Objects defined:

Cell - A single grid cell. Has a reference to its parent grid nd to a page element

Grid - implements construction of grid and functions getting a cell or a cells location,
and for fetching a cells nearest neighbour.

GameOfLife - takes a grid during construction, adds the properties state and newState to its cells, uses these
to run Conway's game of life each time doTick() is called.

Functions:

initHTMLCells(grid, element ID) - initialises grid display on html page, grid cells are added to the element specified by element ID.
									Sets element property of each cell to the on screen element
updateHTMLCells(grid);	- updates html page cells elements


*/

let mousedown = false;

let timer = false;
let grid = new Grid(50, 50);
let game = new GameOfLife(grid);
initHTMLCells(grid, "centerContent");

	
function initHTMLCells(grid, id) {
	let w = grid.width;
	let h = grid.height;
	
	let centerContent = document.getElementById(id);
	
   // for (var n = 0; n < playlist.items.length; n++) {
	for (var n = 0; n < w; n++) {
		var row = document.createElement("div");
		
		for (var m = 0; m < h; m++) {
			var cell = document.createElement("span");
			cell.setAttribute("class", "cell");
	
			row.appendChild(cell);
			grid.cellAt(n, m).element = cell;
			
			cell.gridCell = grid.cellAt(n, m);
			
			
			cell.addEventListener("touchstart", onTouchStart);
			cell.addEventListener("touchmove", onTouchMove);
			cell.addEventListener("touchend", onTouchEnd);
			
			
			//cell.addEventListener("click", onClickCell);
			
			
		}
		centerContent.appendChild(row);
		
		
		centerContent.addEventListener("mousedown", function(e) {onMouseEvent("mousedown", e);});
		centerContent.addEventListener("mouseup", function(e) {onMouseEvent("mouseup", e);});
		centerContent.addEventListener("mouseover", function(e) {onMouseEvent("mouseover", e);});
		
	}
	
	centerContent.classList.remove("hide");
	
	document.getElementById("tick_bttn").addEventListener("click", onClickStartButton);
}

function updateHTMLCells(grid) {
	for(let i = 0; i < grid.cells.length;i++) {
		let c = grid.cells[i];
		if(c.state === 1){
			c.element.classList.add("shaded");
		}else{
			c.element.classList.remove("shaded");
		}
	}
}


/**********************************
 * User event callbacks           *
 **********************************/
 

function onClickCell(event) {
	this.classList.add("shaded");
	this.gridCell.state = 1;
}

function onTouchStart(event) {
	this.classList.add("shaded");
	this.gridCell.state = 1;
}

function onTouchMove(event) {
	let c = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
	if(c.classList.contains("cell")){
		c.classList.add("shaded");
		//c.setAttribute("style", "background-color:grey");
		c.gridCell.state = 1;
	}
}

function onTouchEnd(event) {
	let d = document.getElementById("debugoutput");
}

function doTick(){
	game.doTick();
	updateHTMLCells(grid);
}

function onClickStartButton(event) {
	if(!timer){
		this.innerHTML = "Stop";
		timer = setInterval(doTick, 100);
	}else{
		this.innerHTML = "Start";
		clearInterval(timer);
		timer = false;
	}
}


function onMouseEvent(eventtype, event) {
	switch(eventtype){
		case "mousedown":
			mousedown = true;
			break;
			
		case "mouseup":
			mousedown = false;
			break;
		case "mouseover":
			if(mousedown){
				let c = document.elementFromPoint(event.clientX, event.clientY);
				if(c.classList.contains("cell")){
					c.classList.add("shaded");
					c.gridCell.state = 1;
				}	
			}
			break;
		default:
	}
}




/**********************************
 * grid object definitions        *
 **********************************/

function Cell(parentGrid) {
	this.parentGrid = parentGrid;
	this.element = undefined;
}
 
function Grid(width, height) {
	this.width = width;
	this.height = height;
	this.cells = new Array();
	
	for(let i = 0; i < (width * height); i++){
		this.cells.push(new Cell(this));
	}
	
	//precalculate index offsets for any given cell's eight nearest neighbours
	//this.neighbours = [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1]; 
	this.neighbours_offsets = [	{"x" : -1,"y" : -1},
						{"x" :  0,"y" : -1},
						{"x" :  1,"y" : -1},
						{"x" : -1,"y" :  0},
						{"x" :  1,"y" :  0},
						{"x" : -1,"y" :  1},
						{"x" :  0,"y" :  1},
						{"x" :  1,"y" :  1}
						];
	
	
	this.getNeighbours = function(cell){
		let index = this.cells.indexOf(cell);
		let cell_pos = this.cellLocation(cell);
		let neighbour_cells = [];
		
		for(let p of this.neighbours_offsets){
			let neighbour_pos = {"x" : cell_pos.x, "y" : cell_pos.y};
			neighbour_pos.x += p.x;
			neighbour_pos.y += p.y;
			
			if (neighbour_pos.x >=0 && neighbour_pos.x < this.width && neighbour_pos.y >= 0 && neighbour_pos.y < this.height){
				neighbour_cells.push(this.cellAt(neighbour_pos.x, neighbour_pos.y));
			}
		}
		return neighbour_cells;
	}
	
	this.cellAt = function(x, y) {
		let index = x + (y * height);
		return this.cells[index];
	};
	
	this.cellLocation = function(cell) {
		let i = this.cells.indexOf(cell);
		
		let y = Math.floor(i / height);
		let x = i % height;
		return {"x" : x, "y" : y};
	};
	
	this.outputTable = function() {
		let outp="<table>";

		for(let y = 0; y < this.height;y++) {
			outp += "<tr>";
			for(let x = 0; x < this.width; x++) {
				let i = x + (y * this.height);
				outp += "<td>";
				outp += this.cells[i].state;
				outp += "</td>";
			}
			outp += "</tr>";
		}
		return outp;
	};
 }
 
 
/****************************************************
 *  Take a grid and run Conway's Game Of Life on it *
 ****************************************************/
function GameOfLife(grid) {
	this.grid = grid;
	
	//add state and newState variables to cells
	for(let c of this.grid.cells){
		c.state = 0;
		c.newState = 0;
	}
	
	this.doTick = function(){
		//iterate through cells, determine new state for this tick
		for(let cell of this.grid.cells){
			let cell_neighbours = this.grid.getNeighbours(cell);
		
			//count live neighbours
			let live = 0;
			for(let neighbour of cell_neighbours){
				live += neighbour.state;
			}
			
			if(cell.state === 1){
				switch(live){
					case 0:
					case 1:
						cell.newState = 0;
						break;
					case 2:
					case 3:
						cell.newState = 1;	//Ah ah ah stayin' alive, stayin' alive
						break;
					default:
						cell.newState = 0;
				}
			}else{
				if(live === 3)cell.newState = 1;
			}			
		}
		
		//now update all the states
		for(let cell of this.grid.cells){
			cell.state = cell.newState;
		}
	};
}
 
 
 
 
 
 
 
 
 

