class Coordinate {
	constructor(x,y) {
		this.x = parseInt(x);
		this.y = parseInt(y);
	}

	getX() { return this.x; }
	getY() { return this.y; }
	setX(value) { this.x = parseInt(value); }
	setY(value) { this.y = parseInt(value); }
}

export default Coordinate
