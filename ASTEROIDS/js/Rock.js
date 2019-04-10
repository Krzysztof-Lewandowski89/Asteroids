Rock.all = {};
Rock.count = 0;
// Dane dla kamieni różnych wielkości
Rock.data = [
	{r: 0.025, speed:0.0005,    minAngle:60, maxAngle:90, minSmallerRocks:0, maxSmallerRocks:0},
	{r: 0.08,  speed:0.00025,   minAngle:50, maxAngle:70, minSmallerRocks:2, maxSmallerRocks:3},
	{r: 0.2,   speed:0.0000625, minAngle:30, maxAngle:45, minSmallerRocks:3, maxSmallerRocks:4}
];
function Rock(size,x,y){
	Rock.count++;
	this.id = Rock.count;
	Rock.all[this.id] = this;
	// jeśli size jest podany to to size kamienia równa się size, jeśli nie równa się 2
	this.size = size!==undefined ? size : 2;
	// tablica ze wszystkimi punktami, które tworzą pojedynczy kamień
	this.points = [];
	// Promień z tablicy z danymi o kamieniach
	this.r = Rock.data[this.size].r;
	// Jeśli x i y nie są podane, x i y są losowane mogą sięznaleźć na 30% marginesie ekranu
	this.x = x!==undefined ? x : ((VAR.rand(0,1) ? VAR.rand(0,3) : VAR.rand(7,10))/10)*VAR.W;
	this.y = y!==undefined ? y : ((VAR.rand(0,1) ? VAR.rand(0,3) : VAR.rand(7,10))/10)*VAR.H;
	// o ile pixeli będzie się przemieszczał kamień po osi x i osi y
	this.modX = VAR.rand(1,10)*Rock.data[this.size].speed*(VAR.rand(0,1) ? 1 : -1);
	this.modY = VAR.rand(1,10)*Rock.data[this.size].speed*(VAR.rand(0,1) ? 1 : -1);
	// Wyznaczenie punktów kamienia, rozpoczęcie losowym kątem
	var a = VAR.rand(0,40);
	// dopóki kąt jest mniejszy niż 360 dodawaj nowe punkty
	while(a<360){
		// zwiększ kąt o losową wartość z przedziału zdeklarowanego w odpowiednim obiekcie z tablicy Rock.data
		a+= VAR.rand(Rock.data[this.size].minAngle,Rock.data[this.size].maxAngle);
		// dodaj punkt do tablicy
		this.points.push({
			x:Math.sin(Math.PI/180*a)*this.r,
			//względna pozycja x
			y:Math.cos(Math.PI/180*a)*this.r 
			//względna pozycja y
		});
	}
}
Rock.prototype.hitTest = function(x,y){
	if(this.x-this.r*VAR.d<x && this.x+this.r*VAR.d>x && this.y-this.r*VAR.d<y && this.y+this.r*VAR.d>y){
		// Jeśli pocisk się mieści w kwadracie przechodzę do precyzyjnego testu
		// W canvas stworzonej do przeprowadzania testów czyszczę kwadrat, który zajmuje kamień.
		Game.hit_ctx.clearRect(this.x-this.r*VAR.d,this.y-this.r*VAR.d,this.r*VAR.d*2,this.r*VAR.d*2)
		// Rysuję kopię kamienia wypełnioną. Będzie ona wypełniona na czerowno.
		Game.hit_ctx.beginPath()
		for (var i = 0; i < this.points.length; i++) {
			Game.hit_ctx[i===0 ? 'moveTo' : 'lineTo'](this.points[i].x*VAR.d+this.x, this.points[i].y*VAR.d+this.y)
		}
		Game.hit_ctx.closePath()
		Game.hit_ctx.fill()
		// testujemy kolor
		if(Game.hit_ctx.getImageData(x,y,1,1).data[0]==255){
			// Jeśli testowany punkt trafił na kamień funkcja zwraca prawdę.
			// Po return kończy się odtwarzanie funkcji.
			return true
		}
	}
	// w innym wypadku false
	return false
}
// Rysowanie pojedynczego kamienia
Rock.prototype.draw = function() {
	// Aktualny x i y
	this.x+=this.modX*VAR.d;
	this.y+=this.modY*VAR.d;
	// czy przeleciał za ekran
	if(this.x+this.r*VAR.d<0){
		this.x+=(VAR.d*this.r*2)+VAR.W;
	}else if(this.x-this.r*VAR.d>VAR.W){
		this.x-=(VAR.d*this.r*2)+VAR.W;
	}
	if(this.y+this.r*VAR.d<0){
		this.y+=(VAR.d*this.r*2)+VAR.H;
	}else if(this.y-this.r*VAR.d>VAR.H){
		this.y-=(VAR.d*this.r*2)+VAR.H;
	}

	Game.ctx.beginPath();
	for (var i = 0; i < this.points.length; i++) {
		Game.ctx[i===0 ? 'moveTo' : 'lineTo'](this.points[i].x*VAR.d+this.x, this.points[i].y*VAR.d+this.y);
	}
	Game.ctx.closePath();
	Game.ctx.stroke();
};
Rock.prototype.remove = function(){
	// Zagraj jeden z wybuchów
	Sounds.play('bum'+VAR.rand(1,2))
	// jeśli to nie był mały kamyczek w miejsce kamienia wstaw inne kamienie
	if(this.size>0){
		for (var i = 0, j = VAR.rand(Rock.data[this.size].minSmallerRocks,Rock.data[this.size].maxSmallerRocks); i < j; i++) {
			new Rock(this.size-1, this.x, this.y)	
		}
	}
	Dot.add(this.x, this.y);
	delete Rock.all[this.id]
}
// rysowanie wszystkich kamieni
Rock.draw = function(){
	// liczy kamienie (jak nie będzie kamieni zwyciestwo)
	Rock.num = 0;
	for(var r in Rock.all){
		Rock.num ++;
		// rysuj ten konkretny kamień
		Rock.all[r].draw();
	}
	// Jeśli kamienie równają się zero to znaczy, że gracz wygrał
	if(Rock.num===0 && !Game.success){
		Game.success = true;
		Sounds.play('win');
	}
};