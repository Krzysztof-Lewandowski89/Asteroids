function Ship(){
	// Wszystkie wartości podaję względem wielkości okna 
	// Statek to trójkąt wpisany w okrąg o promieniu 
	this.r = 0.04;
	this.rear_a = 50;
	// Kąt obrotu statku
	this.a = 0;
	this.x = VAR.W/2;
	this.y = VAR.H/2;
	// modX i modY - informacje o ruchu statku (w pixelach)
	this.modX = 0;
	this.modY = 0;
	// maksymalna prędkość statku
	this.maxMod = 0.019;
	// acc = acceleration czyli przyspieszenie statku
	this.acc = 0.0004;
	// Statek składa się z trzech punktów
	this.points = [{},{},{}];
}
// Czy statek rozbił się o skały
Ship.prototype.hitTest = function(){
	for (var i = 0; i < this.points.length; i++) {
		for(var r in Rock.all){
			if(Rock.all[r].hitTest(this.points[i].x,this.points[i].y)){
				// Jeśli się pokrywa rozwal kamien
				Rock.all[r].remove()
				return true
			}
		}
	}
	return false
}
// rysuje statek
Ship.prototype.draw = function() {
	// Jeśli statek nie jest zniszczony
	if(!this.destroyed){
		//czy statek nie rozbił się o skały
		if(this.hitTest()){
			this.destroyed = true;
			Dot.add(this.x, this.y);
			Game.stop();
		}else{
			//czy gracz skręca statkiem
			if(Game.key_37 || Game.key_39){
				// +/- 7 stopni w zależności czy statek skręca w lewo czy w prawo
				this.a=this.a + 7 *(Game.key_37 ? -1 : 1)
			}
			// przyspieszenie
			if(Game.key_38){
				this.modX = Math.max(-this.maxMod*VAR.d, Math.min(this.maxMod*VAR.d, this.modX+Math.sin(Math.PI/180*this.a)*this.acc*VAR.d))
				this.modY = Math.max(-this.maxMod*VAR.d, Math.min(this.maxMod*VAR.d, this.modY-Math.cos(Math.PI/180*this.a)*this.acc*VAR.d))
			}else{
			// jeśli gracz nie wciska gazu, statek sam zwalnia do 98%
				this.modX = this.modX*0.98
				// jeśli modX i modY jest mniejsza niż 0.0001 niech modX = 0
				this.modX = Math.abs(this.modX)<0.0001 ? 0 : this.modX
				this.modY = this.modY*0.98
				this.modY = Math.abs(this.modY)<0.0001 ? 0 : this.modY
			}
			this.x+=this.modX
			this.y+=this.modY
			// rysowanie ścieżki
			Game.ctx.beginPath()
			// rysowanie poszczególnych linii
			for (var i = 0; i < 3; i++) {
				this.tmp_a = i===0 ? this.a : (this.a+180 + (i==1 ? this.rear_a : -this.rear_a));
				this.tmp_r = i===0 ? this.r*1 : this.r*0.6;
				// Punkty są przechowywane w tablicy obiektów.
				this.points[i].x = (Math.sin(Math.PI/180*this.tmp_a)*this.tmp_r*VAR.d)+this.x;
				this.points[i].y = (-Math.cos(Math.PI/180*this.tmp_a)*this.tmp_r*VAR.d)+this.y;
				// Rysowanie
				Game.ctx[i===0?'moveTo':'lineTo'](this.points[i].x,this.points[i].y);
			}
			// zamknięcie ścieżki
			Game.ctx.closePath()
			Game.ctx.stroke()
			// rysowanie odrzutu
			if(Game.key_38 && this.draw_thrust){
				Game.ctx.beginPath();
				this.draw_thrust = false;
				for (i = 0; i < 3; i++) {
					this.tmp_a = i!=1 ? this.a+180+(i===0 ? -this.rear_a+14 : this.rear_a-14) : this.a+180;
					this.tmp_r = i==1 ? this.r : this.r*0.5;
					Game.ctx[i===0?'moveTo':'lineTo'](
						(Math.sin(Math.PI/180*this.tmp_a)*this.tmp_r*VAR.d)+this.x,
						(-Math.cos(Math.PI/180*this.tmp_a)*this.tmp_r*VAR.d)+this.y
					);
				}
				Game.ctx.stroke();
			}else if(Game.key_38 && !this.draw_thrust){
				this.draw_thrust=true;
			}
			// dźwięk odrzutu
			// Game thrust_sound to opóźnienie pomiędzy kolejnymi dźwiękami odrzutu
			if(Game.key_38 && (!Game.thrust_sound || Game.thrust_sound<=0)){
				Game.thrust_sound = 60
				// odtwórz dźwięk
				Sounds.play('thrust')
			}else if(Game.key_38 && Game.thrust_sound){
				Game.thrust_sound-=1000/VAR.fps
			}else if(!Game.key_38){
			// jeśli gracz nie wciska gazu ustaw thrust_sound na false
				Game.thrust_sound = false
			}
			// Czy statek nie wyleciał za ekran
			if(this.points[0].x<0 && this.points[1].x<0 && this.points[2].x<0){
				this.x+=VAR.W-Math.min(this.points[0].x,this.points[1].x,this.points[2].x)*0.9
			}else if(this.points[0].x>VAR.W && this.points[1].x>VAR.W && this.points[2].x>VAR.W){// jeśli we wszystkich punktach x jest większy niż szerokość ekranu
				this.x-=VAR.W-(VAR.W-Math.max(this.points[0].x,this.points[1].x,this.points[2].x))*0.9
			}
			if(this.points[0].y<0 && this.points[1].y<0 && this.points[2].y<0){
				this.y+=VAR.H-Math.min(this.points[0].y,this.points[1].y,this.points[2].y)*0.9
			}else if(this.points[0].y>VAR.H && this.points[1].y>VAR.H && this.points[2].y>VAR.H){
				this.y-=VAR.H-(VAR.H-Math.max(this.points[0].y,this.points[1].y,this.points[2].y))*0.9
			}
		}
	}
}
