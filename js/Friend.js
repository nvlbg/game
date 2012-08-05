var Friend = Tank.extend({
	init : function(x, y, settings) {
		this.parent(x, y, settings);
		
		if(me.gamestat.getItemValue("team") === "green") {
			this.addAnimation("idleForward", [7]);
			this.addAnimation("moveForward", [7,6,5,4,3,2,1,0]);
			this.addAnimation("shootForward", [7,8,9,8,7]);
			this.addAnimation("idleSideward", [27]);
			this.addAnimation("moveSideward", [27,26,25,24,23,22,21,20]);
			this.addAnimation("shootSideward", [27,28,29,28,27]);
		} else if(me.gamestat.getItemValue("team") === "blue") {
			this.addAnimation("idleForward", [17]);
			this.addAnimation("moveForward", [17,16,15,14,13,12,11,10]);
			this.addAnimation("shootForward", [17,18,19,18,17]);
			this.addAnimation("idleSideward", [37]);
			this.addAnimation("moveSideward", [37,36,35,34,33,32,31,30]);
			this.addAnimation("shootSideward", [37,38,39,38,37]);
		} else {
			throw "unknown team \"" + me.gamestat.getItemValue("team") + "\"";
		}
	}
});