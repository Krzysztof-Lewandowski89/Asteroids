// Inicjuję grę dopiero po załadowaniu całej strony
window.onload = function(){
	Game.init();
}
//przechowuje podręczne wartości
VAR = {
	fps:60,
	W:0,
	H:0,
	lastTime:0,
	lastUpdate:-1,
	rand:function(min,max){
		return Math.floor(Math.random()*(max-min+1))+min;
	}
}

// Game nie ma konstruktora, jest jedynie obiektem grupującym funkcje.
Game = {
	// init zostanie odpalone raz po załadowaniu strony.
	init:function(){
		// Załaduj dźwięki
		Sounds.init();
		//
		Game.canvas = document.createElement('canvas');
		// drugie canvas, na którym będą testowane kolizje kamieni z pociskami i statkiem
		Game.hit_canvas = document.createElement('canvas');
		// Przypisuję kontekst 2D do zmiennej ctx
		Game.ctx = Game.canvas.getContext('2d');
		// oraz kontekst 2D hit_canvas
		this.hit_ctx = this.hit_canvas.getContext('2d');
		// odpalam metodę obiektu Game
		Game.layout();
		// metoda layout odpali się przy każdej zmianie wielkości okna
		window.addEventListener('resize', Game.layout, false);
		
		document.body.appendChild(Game.canvas);
		// Inicjowanie statku
		Game.ship = new Ship();
		// dodaj trzy duże kamienie
		for (var i = 0; i < 3; i++) {
			new Rock()
		}
		// Dodanie nasłuchiwaczy wcisniety/nie wciśniety
		window.addEventListener('keydown', Game.onKey, false);
		window.addEventListener('keyup', Game.onKey, false);
		// rozpoczęcie pętli gry
		Game.animationLoop();
	},
	// odłącz nasłuchiwanie klawiszy
	stop:function(){
		window.removeEventListener('keydown', Game.onKey);
		window.removeEventListener('keyup', Game.onKey);
	},
	// Reakcje na naciskanie guzików 
	onKey:function(ev){
		// reaguj tylko jeśli zostały wciśnięte strzałka w lewo, do góry, w prawo lub spacja
		if(ev.keyCode==37 || ev.keyCode==39 || ev.keyCode==38 || ev.keyCode==32){
			// Jeśli guzik został wciśnięty i jednocześnie nie był on wciśnięty wcześniej
			if(ev.type=='keydown' && !Game['key_'+ev.keyCode]){
				Game['key_'+ev.keyCode] = true;
				// Jeśli została wciśnięta strzałka w lewo lub w prawo należy wyłączyć strzałkę w przeciwną stronę
				if(ev.keyCode==37){
					Game.key_39 = false;
				}else if(ev.keyCode==39){
					Game.key_37 = false;
				}else if(ev.keyCode==32){ 
				// jeśli została wciśnięta spacja dodaj nowy pocisk
					new Bullet();
				}
			}else if(ev.type=='keyup'){
			// w przypadku gdy guzik został zwolniony przypisz odpowiedniej właściwości obiektu Game false
				Game['key_'+ev.keyCode] = false;
			}
		}
	},
	// zmiana wielkości okna
	layout:function(ev){
		// wielkość okna zostaje przypisana do właściwości W (width) i H (height) obiektu VAR
		VAR.W = window.innerWidth;
		VAR.H = window.innerHeight;
		// 
		VAR.d = Math.min(VAR.W, VAR.H);
		// Update wielkości canvas
		Game.canvas.width = VAR.W;
		Game.canvas.height = VAR.H;
		// Po zmianie wilekości canvas resetują się kolory i grubości linii
		Game.ctx.fillStyle = 'white';
		Game.ctx.strokeStyle = 'white';
		Game.ctx.lineWidth = 3;
		Game.ctx.lineJoin = 'round';
		// Hit canvas do testów kolizji
		Game.hit_canvas.width = VAR.W;
		Game.hit_canvas.height = VAR.H;
		// Wypełnienie kamieni na hit_canvas
		Game.hit_ctx.fillStyle = '#ff0000';
	},
	// Funkcja odpala się 60 razy na sekundę
	animationLoop:function(time){
		requestAnimationFrame( Game.animationLoop );
		// ograniczenie do ilości klatek zdefiniowanych w właściwości obiektu VAR -nie więcej niż VAR.fps
		if(time-VAR.lastTime>=1000/VAR.fps){
			VAR.lastTime = time;
			// oczyszczenie canvas
			Game.ctx.clearRect(0,0,VAR.W, VAR.H);
			// Rysowanie statku
			Game.ship.draw();
			// Rysowanie pocisków
			Bullet.draw();
			// Rysowanie kamieni
			Rock.draw();
			// Rysowanie kropek
			Dot.draw();
		}
	}
}