class Block {
	constructor(data) {
		// Initial data
		this.shape = data.shape;
		this.width = data.shape[0].length;
		this.height = data.shape.length;
		this.coordinates = { x: -1000, y: -1000 }
		
		// Creat div and append
		this.$div = document.createElement("div");
		this.setInitialStyle(data.col, data.row)
		BOARD.appendChild(this.$div)
	}
	
	setInitialStyle() {
		Object.assign(this.$div.style, {
			width: this.width * PIXEL_SIZE + 'px',
			height: this.height * PIXEL_SIZE + 'px',
			left: this.coordinates.x * PIXEL_SIZE,
			bottom: this.coordinates.y * PIXEL_SIZE,
			position:  'absolute',

			// Background
			background: this.getRandomColor(),
		})
	}

	setCoordinates(x,y) {
		this.coordinates.x = x,
		this.coordinates.y = y;
		this.$div.style.left = x * PIXEL_SIZE + 'px';
		this.$div.style.bottom = y * PIXEL_SIZE + 'px';
	}

	getRandomColor() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}
}