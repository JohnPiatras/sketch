
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

//stat of our namespace
let etchasketch = function(){
"use strict"

let mousedown = false;
let timer = false;
let grid;
let game;
let color;

//references to page elements
let start_bttn = document.getElementById("start_bttn");
let clear_bttn = document.getElementById("clear_bttn");

let resize_dialog = document.getElementById("resize-dialog");
let resize_bttn = document.getElementById("resize_bttn");
let resize_cancel_bttn = document.getElementById("resize-cancel-bttn");
let resize_ok_bttn = document.getElementById("resize-ok-bttn");
let resize_size_input = document.getElementById("resize-size-input");

let color_picker = document.getElementById("colorPicker");

resetPage(16, 16);

function resetPage(grid_size_x, grid_size_y){
	grid = new Grid(grid_size_x, grid_size_y);
	game = new GameOfLife(grid);
	initHTMLGrid(grid, "grid");
}

function initHTMLGrid(grid, id) {
	let w = grid.width;
	let h = grid.height;
	let gridElement = document.getElementById(id);
	gridElement.innerHTML="";

	gridElement.setAttribute("style",`grid-template-columns:repeat(${w},1fr);grid-template-rows:repeat(${h},1fr);`)
	for (var n = 0; n < w; n++) {

		for (var m = 0; m < h; m++) {
			//create html div for cell
			var htmlcell = document.createElement("div");
			htmlcell.setAttribute("class", "cell grid-border-style");
			gridElement.appendChild(htmlcell);

			//link our grid object and html div representing the cell
			grid.cellAt(n, m).element = htmlcell;
			htmlcell.gridCell = grid.cellAt(n, m);
			
			htmlcell.addEventListener("touchstart", onTouchStart);
			htmlcell.addEventListener("touchmove", onTouchMove);
			htmlcell.addEventListener("touchend", onTouchEnd);	
		}	
		gridElement.addEventListener("mousedown", function(e) {onMouseEvent("mousedown", e);});
		gridElement.addEventListener("mouseup", function(e) {onMouseEvent("mouseup", e);});
		gridElement.addEventListener("mouseover", function(e) {onMouseEvent("mouseover", e);});
		
	}
	
	gridElement.classList.remove("hide");
	start_bttn.addEventListener("click", onClickButton);
	clear_bttn.addEventListener("click", onClickButton);
	resize_bttn.addEventListener("click", onClickButton);
	resize_cancel_bttn.addEventListener("click", onClickButton);
	resize_ok_bttn.addEventListener("click", onClickButton);

	resize_dialog.addEventListener("animationend", function(e){e.target.classList.remove("dialog-box-flash");});

	color_picker.addEventListener("change", colorChange);
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

function startGameOfLife(){
	start_bttn.innerHTML = "Stop";
	timer = setInterval(doTick, 100);
}

function stopGameOfLife(){
	start_bttn.innerHTML = "Start";
	if(timer)clearInterval(timer);
	timer = false;
}

function doStartButton(){
	if(!timer){
		startGameOfLife();
	}else{
		stopGameOfLife();
	}
}


function showResizeDialog(){
	clear_bttn.disabled = true;
	resize_bttn.disabled = true;
	start_bttn.disabled = true;
	stopGameOfLife();
	resize_dialog.classList.remove("hide");
}

function hideResizeDialog(){
	clear_bttn.disabled = false;
	resize_bttn.disabled = false;
	start_bttn.disabled = false;
	resize_dialog.classList.add("hide");
}



function onClickButton(event) {
	switch(event.target.id){
		case "clear_bttn":
			stopGameOfLife();
			resetPage(grid.width, grid.height);
			break;
		case "resize_bttn":
			showResizeDialog();
			break;
		case "start_bttn":
			doStartButton();
			break;
		case "resize-cancel-bttn":
			hideResizeDialog();
			break;
		case "resize-ok-bttn":
			let new_size = Number(resize_size_input.value);
			if(typeof(new_size) == "number" && new_size >1 && new_size < 65){
				hideResizeDialog();
				resetPage(new_size, new_size);
			}else{
				resize_dialog.classList.add("dialog-box-flash");
			}

			break;
	}
}

function colorChange(e){
	console.log("New color = " + e.target.value);

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
 

}();//end of our namespace
 
 
 
 
 
 
 

