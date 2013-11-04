/*
* Frisbee-wepapp
* Eindopdracht
* Frontend Development 2

* Bram Swier 2013

* Flow van de applicatie
	# Namespace wordt aangemaakt
	# Zelf oproepende functie wordt aangemaakt
	# Als de dom klaar is, wordt de init-methode uit het controller object aangesproken
		# Deze start o.a. de routie-functie
	# Er wordt gekeken naar de URL, en de bijbehorende page-methode uit het page-object wordt uitgevoerd
	# De loader wordt aangezet
	# De gekozen sectie wordt getdoond en gevuld met de inhoud uit de API middels transparency uit de page-methode uit het page-object
	# Het menu krijgt een active-class mee
	# Eventuele bijbehorende functies (bijv. eventlisteners) worden aangeroepen
	# De pagina is klaar, de laadbalk wordt verborgen

* Objecten
	# Controller
	# Router
	# Page
	# Toolbox
	# Eventlistener
	# List
	# Gesture

* Gebruikte libs
	# Modernizr - kijkt naar mogelijkheden browser en voegt classes toe
	# Routie - luistert naar URL veranderingen en voert daarop acties uit
	# Domready - luistert naar het DOM-ready signaal
	# Qwery - een selector-engine
	# Transparency - een templating engine, rendert dynamische data in html
	# Reqwest - voert AJAX-calls uit
	# List - sorteert items in een list-class
	# Hammer - maakt gesture-events aan
		# Pull to refresh - spreekt voor zich, maakt gebruik van Hammer
*/ 

// Activeer native JSON-functies en strictere markup
"use strict";

// Maak een namespace aan in de global scope, maak een nieuw object als deze al bestaat
var FRISBEEAPP = FRISBEEAPP || {};

// Self-invoking, anonieme function (local scope)
(function () {
	
	// Controller-object
	// Dit is het 'hart' van de applicatie die alles in werking zet
	FRISBEEAPP.controller = {
		// Hier worden methodes van functies verzameld, om later in één keer te kunnen worden uitgevoerd
		init: function () {
			// Initialiseer de router
			FRISBEEAPP.router.init();

			// Initialiseer de PullToRefresh
			FRISBEEAPP.gesture.pullToRefresh();

			// Initaliseer de eventlistener van de menutoggle
			FRISBEEAPP.eventListener.menuToggle();
		}
	};

	// Router-object
	// Dit object voer acties uit op basis van de URL
	FRISBEEAPP.router = {
		// De URL matcht, voer bijbehorende page-methode uit
		init: function () {
	  		routie({
			    '/lvhome': function() {
			    	FRISBEEAPP.page.lvhome();
				},

			    '/lvteams': function() {
			    	FRISBEEAPP.page.lvteams();
			    },

			    '/lvteam/:id': function(id) {
			    	FRISBEEAPP.page.lvteam(id);
			    },

			    '/lvpools': function() {
			    	FRISBEEAPP.page.lvpools();
			    },

			    '/lvschedule': function() {
			    	FRISBEEAPP.page.lvschedule();
			    },

			    '/lvgame/:id': function(id) {
			    	FRISBEEAPP.page.lvgame(id);
			    },			    

			    '': function() {
			    	FRISBEEAPP.page.lvhome();
			    }
			});
		},
		
		// De gekozen section krijgt een active-class mee en het menu-item een activemenu class
		change: function () {
			FRISBEEAPP.toolbox.toonLoader();

			// Scroll automatisch omhoog op een nieuwe pagina
			window.scrollTo(0, 0);

			// Het menu wordt gesloten (mobiel)
			FRISBEEAPP.toolbox.verbergMenu();

			// Begin vanaf '#/'
            var route = window.location.hash.slice(2),
            	// Zoek alle sections met een data-route attribuut
                sections = qwery('section[data-route]'),
                // Stop de gekozen pagina (opgeslagen in var route) in de section var
                section = qwery('[data-route=' + route + ']')[0],
                // Query alle linkjes uit de menu-lists
                menuitems = qwery('nav > ul > li > a'),
                // Query het gekozen menuitem
                activemenu = qwery('nav > ul > li > a[class=' + route + ']')[0];

            // De query is geslaagd
            if (activemenu) {
            	// Loop door het aantal menuitems heen
            	for (var i=0; i < menuitems.length; i++){
            		// Haal bij elke menuitem de class 'activemenu' weg
             		menuitems[i].classList.remove('activemenu');
            	}
            	// Voeg aan gekozen menu-item de class 'activemenu'
            	activemenu.classList.add('activemenu');
            }      

            // De section bestaat in de HTML
            if (section) {
           		 // Loop door het aantal gevonden sections met een data route uit de sections var
            	for (var i=0; i < sections.length; i++){
            		// Haal de classlist 'active' weg uit alle sections met een data route
             		sections[i].classList.remove('active');
            	}
            	// De gekozen 'section' (eigenlijk pagina) krijgt de class 'active' mee
            	section.classList.add('active');
            }

            // Gezochte sectie bestaat niet, er kan een parameter achter staan
            // Example: Als een team is geselecteerd, wordt er gezocht naar de 'lvteam'-section
            if (!section) {
            	// Zoek positie van '/'
            	var positieVanSlashInRoute = route.indexOf('/');
            	// Selecteer alles achter '/'
            	var wegTeHalenParameter = route.slice(positieVanSlashInRoute)
            	// Vervang dat in de route-variabele met niks (het wordt er uit gehaald)
            	route = route.replace(wegTeHalenParameter, " ");

            	// De section-qwery wordt met de aangepaste route opnieuw uitgevoerd
            	section = qwery('[data-route=' + route + ']')[0];

            	// Loop door het aantal gevonden sections met een data route uit de sections var
            	for (var i=0; i < sections.length; i++){
            		// Haal de classlist 'active' weg uit alle sections met een data route
             		sections[i].classList.remove('active');
            	}
            	// De gekozen 'section' (eigenlijk pagina) krijgt de class 'active' mee
            	section.classList.add('active');
            }    

            // Standaard route (er staat geen pagina achter html), toon homepage
            if (!route) {
            	FRISBEEAPP.toolbox.maakHomePageActief(sections, menuitems);
            }
		}
	};

	// Page-object
	// Data wordt opgehaald of gepost en gerenderd met Transparency
	// Per AJAX-call wordt door middel van directives voor elk object berekeningen uitgevoerd
	// Transparency rendert de JSON en directives in de opgegeven section
	// Eventueel worden er andere methodes aangesproken die relevant voor de pagina zijn
	// Als laatste wordt de change-methode uitgevoerd om de pagina te tonen
	FRISBEEAPP.page = {
		lvhome: function () {
			reqwest({
			    url: 'https://api.leaguevine.com/v1/tournaments/?tournament_ids=%5B19389%5D&access_token=350bc11438', 
			    type: 'json',
			    method: 'get', 

			    success: function (resp) {
			    	var directives = {
						objects: {
							renderedInfo: {
								html: function(params) {
									return (this.info);
								}
							}
						}
					}

			      	Transparency.render(qwery('[data-route=lvhome')[0], resp, directives);

					FRISBEEAPP.toolbox.verbergLoader();
			    }
			});

			FRISBEEAPP.router.change();
		},

		lvteams: function () {
			reqwest({
			    url: 'https://api.leaguevine.com/v1/stats/ultimate/team_stats_per_tournament/?tournament_ids=%5B19389%5D&order_by=%5B-wins%2C%20losses%5D&access_token=9425c502be', 
			    type: 'json',
			    method: 'get', 

			    success: function (resp) {
			    	var directives = {
						objects: {
							team: {
								teamId: {
									href: function(params) {
										return ('index.html#/lvteam' + '/' + this.id);
									}
								}
							},
						}
					}

			      	Transparency.render(qwery('[data-route=lvteams')[0], resp, directives);

					FRISBEEAPP.toolbox.verbergLoader();
			    }
			});

			FRISBEEAPP.router.change();
		},

		lvteam: function (id) {
			reqwest({
				url: 'https://api.leaguevine.com/v1/stats/ultimate/team_stats_per_tournament/?team_ids=%5B'+ id +'%5D&tournament_ids=%5B19389%5D&access_token=bae4abecc6',
				type: 'json', 
				method: 'get',

				success: function(resp) {
					var directives = { 
						objects: {
							laatsteWijziging: {
								text: function(params) {
									var timestamp = this.time_last_updated;
								
									var newTimestamp = FRISBEEAPP.toolbox.zetTimestampOmInLeesbaarFormaat(timestamp);

									return (newTimestamp[0] + ' ' + newTimestamp[1] + ' ' + newTimestamp[2] + ', ' + newTimestamp[3] + ':' + newTimestamp[4]);
								}
							}
						}
					}

					Transparency.render(qwery('[data-route=lvteam')[0], resp, directives); 

					FRISBEEAPP.toolbox.verbergLoader();
				}
			});

			FRISBEEAPP.router.change();
		},

		lvpools: function () {
			reqwest({
			    url: 'https://api.leaguevine.com/v1/pools/?tournament_id=19389&order_by=%5Bname%5D&access_token=3f43de211bb3a35f7ed54bdbaf5121', 
			    type: 'json',
			    method: 'get', 

			    success: function (resp) {			    		
				    var directives = {
						objects: { 
							poolId: {
								id: function(params) {
									return (this.id);
								}
							},

							poolSortId: {
								id: function(params) {
									return ('lvpoolssort' + this.id);
								}
							},

							poolSectionId: {
								id: function(params) {
									return ('section' + this.id);
								}
							},

							appendSection: {
								id: function(params) {
									return ('append' + this.id);
								}
							},

							standings: {
								teamId: {
									href: function(params) {
										return ('index.html#/lvteam' + '/' + this.team_id);
									}
								}
							},
						}
					}

			   	 	Transparency.render(qwery('[data-route=lvpools')[0], resp, directives);

			   	 	FRISBEEAPP.toolbox.verbergLoader();	

					FRISBEEAPP.eventListener.poolsPagina();

					FRISBEEAPP.list.sorteerPoolGamesOpWins();
			    }
			});

			FRISBEEAPP.router.change();
		},

		lvgamesBijPool: function (gekozenPoolId) {
			reqwest({
				url: 'https://api.leaguevine.com/v1/games/?pool_id='+ gekozenPoolId +'&order_by=%5Bstart_time%5D&access_token=36ea8b4188', 
				type: 'json',
				method: 'get', 

				success: function(resp) {
					var directives = {
						objects: { 
							combinedScore: {
								text: function(params) {
									return (this.team_1_score + " - " + this.team_2_score);
								},

								href: function(params) {
									return ('index.html#/lvgame' + '/' + this.id);
								}
							},

							tijdGespeeld: {
								text: function(params) {
									var timestamp = this.start_time;
								
									var newTimestamp = FRISBEEAPP.toolbox.zetTimestampOmInLeesbaarFormaat(timestamp);

									return (newTimestamp[0] + ' ' + newTimestamp[1] + ' ' + newTimestamp[2] + ', ' + newTimestamp[3] + ':' + newTimestamp[4]);
								}
							},

							formId: {
								id: function(params) {
									return (this.id);
								}
							}
						}
					}
						
					Transparency.render(qwery('#poolsAppend')[0], resp, directives);
					
					FRISBEEAPP.toolbox.verbergLoader();

					poolsAppend.style.maxHeight = '2000px';
				}
			});
		},

		lvschedule: function () {
			reqwest({
				url: 'https://api.leaguevine.com/v1/games/?tournament_id=19389&fields=%5Bid%2Cstart_time%2Cteam_1%2Cteam_1_score%2Cteam_2%2Cteam_2_score%2Cpool%5D&order_by=%5Bid%5D&limit=200&access_token=85e9415a17',
				type: 'json', 
				method: 'get',

				success: function(resp) {
					var directives = {
						objects: { 
							gameId: {
								href: function(params) {
									return ('index.html#/lvgame' + '/' + this.id);
								}
							},

							pool: {
								poolNaam: {
									text: function(params) {
										return ('Pool ' + this.name + " - ");
									}
								}
							},

							tijdGespeeld: {
								text: function(params) {
									var timestamp = this.start_time;
								
									var newTimestamp = FRISBEEAPP.toolbox.zetTimestampOmInLeesbaarFormaat(timestamp);

									return (newTimestamp[0] + ' ' + newTimestamp[1] + ' ' + newTimestamp[2] + ', ' + newTimestamp[3] + ':' + newTimestamp[4]);
								}
							},

							team1NaamEnWinner: {
								class: function(params) {
									if (parseInt(this.team_1_score) > parseInt(this.team_2_score)) {
										return('winner');
									}
									else if (parseInt(this.team_1_score) < parseInt(this.team_2_score)) {
										return('loser')
									}
									else {
										return('stalemate');
									}
								}
							},

							team2NaamEnWinner: {
								class: function(params) {
									if (parseInt(this.team_2_score) > parseInt(this.team_1_score)) {
										return('winner');
									} 
									else if (parseInt(this.team_2_score) < parseInt(this.team_1_score)) {
										return('loser');
									} 
									else {
										return('stalemate');
									}
								}
							},

							trId: {
								id: function(params) {
									return (this.id);
								},

								class: function(params) {
									return ('trAppendClass');
								}
							},

							formBijTrId: {
								id: function(params) {
									return ('formbijtr' + this.id)
								},

								class: function(params) {
									return('formbijtrid');
								}
							},

							team_1: {
								team1NaamEnWinner: {
									text: function(params) {
										return(this.name);
									}
								}
							},

							team_2: {
								team2NaamEnWinner: {
									text: function(params) {
										return(this.name);
									}
								}
							},
							gameFormId: {
								id: function(params) {
									return ('gameform' + this.id);
								}
							},

							team1ScoreSchedule: {
								id: function(params) {
									return ('team1scoreschedule' + this.id);
								}
							},

							team2ScoreSchedule: {
								id: function(params) {
									return ('team2scoreschedule' + this.id);
								}
							},

							team_1_score_schedule: {
								value: function(params) {
									return (this.team_1_score);
								}
							},

							team_2_score_schedule: {
								value: function(params) {
									return (this.team_2_score);
								}
							},
						}
					}
					
					Transparency.render(qwery('[data-route=lvschedule')[0], resp, directives);

					FRISBEEAPP.toolbox.verbergLoader();

					FRISBEEAPP.list.zoekFunctieInSchedule();

					FRISBEEAPP.toolbox.koppelBijbehorendeScoreInSchedule();

					FRISBEEAPP.eventListener.schedulePagina();

					FRISBEEAPP.gesture.swipeScores();

					FRISBEEAPP.toolbox.toonFormsEnStreepjeOpSchedulePagina();

				}
			});
			
			FRISBEEAPP.router.change();
		},

		lvgame: function (id) { 
			reqwest({
				url: 'https://api.leaguevine.com/v1/games/?game_ids=%5B'+ id +'%5D&access_token=560ee51fd8',
				type: 'json', 
				method: 'get',

				success: function(resp) {
					var directives = {
						objects: {
							naamTeam1: {
								text: function(params) {
									return (this.team_1.name);
								}
							},

							naamTeam2: {
								text: function(params) {
									return (this.team_2.name);
								}
							},

							formId: {
								id: function(params) {
									return ('updateTeamScoreForm' + id);
								}
							},

							tijdGespeeld: {
								text: function(params) {
									var timestamp = this.start_time;
								
									var newTimestamp = FRISBEEAPP.toolbox.zetTimestampOmInLeesbaarFormaat(timestamp);

									return (newTimestamp[0] + ' ' + newTimestamp[1] + ' ' + newTimestamp[2] + ' - ' + newTimestamp[3] + ':' + newTimestamp[4]);
								}
							}
						}
					}

					Transparency.render(qwery('[data-route=lvgame')[0], resp, directives); 
					
					FRISBEEAPP.toolbox.verbergLoader();

					FRISBEEAPP.eventListener.gamePagina(id);
				}
			});

			FRISBEEAPP.router.change();
		},

		lvgamePaginaSend: function (gameId) {
			var gameScoreForm = qwery('#updateTeamScoreForm'+gameId)[0];
			var valuesofgamepage = [];

			// Gamescoreform bestaat, voer de post-functie uit
			if (gameScoreForm) {
				for (var i = 0; i < gameScoreForm.length; i++) {
					valuesofgamepage[i] = gameScoreForm.elements[i].value;
					// Er is een checkbox gevonden, check of hij aangekruist is
					if (gameScoreForm.elements[i].type == 'checkbox') {
						valuesofgamepage[i] = gameScoreForm.elements[i].checked;
					}
				}

				var nieuweTeam1Score = valuesofgamepage[0];
				var nieuweTeam2Score = valuesofgamepage[1];
				var isFinal = valuesofgamepage[2];

				reqwest({
					url: 'https://api.leaguevine.com/v1/game_scores/', 
					type: 'json', 
					method: 'post', 
					data: JSON.stringify({ 
						game_id: gameId,
						team_1_score: nieuweTeam1Score,
						team_2_score: nieuweTeam2Score,
						is_final: isFinal
					}), 
					contentType: 'application/json', 
					headers: {
					    'Authorization': 'bearer 82996312dc'
					}, 

					error: function (err) {
					   	console.log(err);
					},

					success: function (resp) { 						  
						FRISBEEAPP.page.lvgame(gameId);
					}
				})
			}
		},

		lvschedulePaginaSend: function (gameId, score1, score2, checkboxchecked) {
			reqwest({
				url: 'https://api.leaguevine.com/v1/game_scores/', 
				type: 'json', 
				method: 'post', 
				data: JSON.stringify({ 
					game_id: gameId,
					team_1_score: score1,
					team_2_score: score2,
					is_final: checkboxchecked
				}), 
				contentType: 'application/json', 
				headers: {
				   'Authorization': 'bearer 82996312dc'
				}, 

				error: function (err) {
				  	console.log(err);
				},

				success: function (resp) {
					FRISBEEAPP.page.lvschedule();
				 }
			})
		}
	};

	// Toolbox-object
	// Dit object bevat een aantal berekeningen en I/O-switches die op elk moment kunnen worden aangeroepen
	FRISBEEAPP.toolbox = {
		berekenIdUitUrl: function() {
			// Begin vanaf '#/'
			var route = window.location.hash.slice(2)
		    // Zoek positie van '/', schuif 1 plaats op om '/' niet mee te nemen
		    var positieVanSlashInRoute = route.indexOf('/') + 1;
		    // Selecteer het gekozen gameID
		    var gekozenId = route.slice(positieVanSlashInRoute);

		    return gekozenId;		    
		},

		zetTimestampOmInLeesbaarFormaat: function(timestamp) {
			// Zet de opgegeven timestamp om in een date-formaat, waarop berekeningen kunnen worden uitgevoerd
			var tijd = new Date(timestamp);

			var dagnaam = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

			var maandnaam = ['jan.', 'feb.', 'maart', 'april', 'mei', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'];

			// Stel de maandnummer gelijk aan de maandnaam
			var maand = maandnaam[tijd.getMonth()];

			// Stop de dagnummer in de variabele datum
			var datum = tijd.getDate();
			
			// Als minuten kleiner zijn dan 10, voeg er een 0 achter
			if (tijd.getMinutes() < '10') {
				var volleMinuten = tijd.getMinutes() + '0';
			} else {
				var volleMinuten = tijd.getMinutes();
			}

			// Als uur kleiner dan 10 is, voeg er een 0 voor
			if (tijd.getHours() < '10') {
				var volleUren = '0' + tijd.getHours();
			} else {
				var volleUren = tijd.getHours();
			}	

			// Stel het dagnummer van de week gelijk aan de dagnaam
			var dag = dagnaam[tijd.getDay()];

			// Maak een array van de variabelen
			var datumArray = [dag, datum, maand, volleUren, volleMinuten];

			// Return de array to sender
			return(datumArray);
		},

		koppelBijbehorendeScoreInSchedule: function() {
			var trAppendClass = qwery('.trAppendClass');
			var formBijTrIds = qwery('.formbijtrid');
			var formVanAppendClass = qwery('.lvschedulescoreform');
			var scheduleScore1 = qwery('.schedulescore1');
			var scheduleScore2 = qwery('.schedulescore2');

			// Koppel elk aangemaakte formulier in een listitem aan de bijbehorende listitem uit de schedule-pagina
			// Stel waarde van dit form gelijk aan de bijbehorende parent-items
			for (var i = 0, len = formBijTrIds.length; i < len; i++) {
				 trAppendClass[i].parentNode.insertBefore(formBijTrIds[i], trAppendClass[i].nextSibling);
				 formVanAppendClass[i].elements[0].value = scheduleScore1[i].innerHTML;
				 formVanAppendClass[i].elements[1].value = scheduleScore2[i].innerHTML;
			}
		},

		toonFormsEnStreepjeOpSchedulePagina: function() {
			// Selecteer de forms uit de schedule-pagina en de 'streepjes'-span
			// Voor het aantal forms (evenveel als streepjes) worden de forms en 'streepjes'-span getoond
			// Waarom? Omdat de gebruiker dan geen niet-ingevulde elementen ziet
			var forms = qwery('.lvschedulescoreform');
			var streepjes = qwery('.scorestreepje');

			for (var i = 0; i < forms.length; i++) {
				forms[i].style.display = 'block';
				streepjes[i].style.display = 'inline';
			}
		},

		verbergMenu: function() {
			// Zoek het menu. Haal de class opened weg en voeg de class closed toe
			qwery('.nav-collapse')[0].classList.remove('opened');
			qwery('.nav-collapse')[0].classList.add('closed');
		},

		maakHomePageActief: function(sections, menuitems) {
			// Zoek de homepage-section. Maak deze actief. Maak het menuitem 'home' in het menu actief.
			sections[0].classList.add('active');
            menuitems[0].classList.add('activemenu');
		},

		toonLoader: function() {
			// Zoek de loader. Toon hem.
			qwery('#overlay')[0].style.opacity = 0.65;
			qwery('#overlay')[0].style.zIndex = 999;			
		},

		verbergLoader: function() {
			// Zoek de loader. Verberg hem.
	   		qwery('#overlay')[0].style.opacity = 0;
	   		qwery('#overlay')[0].style.zIndex = -1;			
		}
	};

	// Eventlistener-object
	// Dit object bevat eventlisteners en voert acties uit als er een event wordt gefired
	FRISBEEAPP.eventListener = {
		gamePagina: function(id) {
			// Zoek het formulier op de gamepagina met het bijbehorende id
			var gameScoreForm = qwery('#updateTeamScoreForm'+id)[0];

			var gameId = id;

			// Het formulier is verstuurd, roep de verstuur-methode aan
			gameScoreForm.addEventListener('submit', function(event) {
			    event.preventDefault();

			    FRISBEEAPP.toolbox.toonLoader();

			    FRISBEEAPP.page.lvgamePaginaSend(gameId);

			    return false;
			}, false);
		},

		poolsPagina: function() {
			// Zoek de 'toon games bij pool'-knoppen
			var list = qwery('.poolidtoggle');

			// Voeg aan elke knop een 'click' eventlistener toe die een functie uitvoert als er wordt geklikt
			for (var i = 0, len = list.length; i < len; i++) {
			    list[i].addEventListener('click', toonGamesBijPool, false);
			}

			// Er is geklikt, hang de 'append' section aan de gekozen pool en vul hem met de lvgamesBijPool-methode
			function toonGamesBijPool() {
				event.preventDefault();

				FRISBEEAPP.toolbox.toonLoader();

				var gekozenPoolId = this.id;

				// Aan welke placeholder-section moet de gevulde section worden gekoppeld?
				var appendTo = qwery('#append' + gekozenPoolId)[0];
				// Zoek de append-section die gevuld gaat worden
				var poolsAppend = qwery('#poolsAppend')[0];

				// Verberg de inhoud van de vorige gekozen pool-section
				poolsAppend.style.maxHeight = '0';
				// Hang de append-section aan de juiste pool
				appendTo.appendChild(poolsAppend);

				// Er is op verberg geklikt, verberg de games. Else: er is op toon games geklikt, toon de games
				if (this.innerHTML == 'Verberg games') {
					this.innerHTML = 'Toon gespeelde games'
					FRISBEEAPP.toolbox.verbergLoader();
				} else {
					FRISBEEAPP.page.lvgamesBijPool(gekozenPoolId, poolsAppend);
					this.innerHTML = 'Verberg games';
				}

				return false;
			}
		},

		schedulePagina: function() {
			// Zoek alle formulieren op de schedulepagina
 			var list = qwery('.lvschedulescoreform');

 			// Hang aan elk formulier een submit-eventlistener
			for (var i = 0, len = list.length; i < len; i++) {
			    list[i].addEventListener('submit', updateScheduleScore, false);
			}

			// Er is een form gesubmit
			function updateScheduleScore () {
				event.preventDefault();

				FRISBEEAPP.toolbox.toonLoader();

				// De afzender wordt in een variabele gestopt
				var verstuurdeScheduleForm = this; 

				// Het id wordt gepakt
				var gameIdverstuurdeScheduleForm = this.id;
				// Haal 'gameform' uit het id weg
				gameIdverstuurdeScheduleForm = gameIdverstuurdeScheduleForm.replace('gameform', '');

				// Maak nieuwe array aan
				var valuesofgameschedule = [];

				// Voor elk element in het formulier wordt er geloopt
				for (var i = 0; i < verstuurdeScheduleForm.length; i++) {
					// Stop de waarde in de eerder opgestelde array
					valuesofgameschedule[i] = verstuurdeScheduleForm.elements[i].value;

					// Er is een checkbox aangetroffen. Pak 'checked' i.p.v. 'value' (checked geeft true/false)
					if (verstuurdeScheduleForm.elements[i].type == 'checkbox') {
						valuesofgameschedule[i] = verstuurdeScheduleForm.elements[i].checked;
					}
				}

				// Maak variabelen met specifieke waarden uit de array
				var scheduleScoreTeam1 = valuesofgameschedule[0];
				var scheduleScoreTeam2 = valuesofgameschedule[1];
				var checkboxChecked = valuesofgameschedule[2];

				// Roep de verstuurmethode vanaf de schedulepagina aan en stuur wat gegevens mee
				FRISBEEAPP.page.lvschedulePaginaSend(gameIdverstuurdeScheduleForm, scheduleScoreTeam1, scheduleScoreTeam2, checkboxChecked);

				return false;
			}
		},

		menuToggle: function() {
			// Zoek de menutoggle
			var toggle = qwery('#navtoggleid')[0];

			// Voeg een click-eventlistener toe, die het menu opent als hij dicht is en vice versa
			toggle.addEventListener('click', function() {
				event.preventDefault();

				if (qwery('.nav-collapse')[0].classList.contains('opened')) {
					qwery('.nav-collapse')[0].classList.remove('opened');
					qwery('.nav-collapse')[0].classList.add('closed');

				} else if (qwery('.nav-collapse')[0].classList.contains('closed')) {
					qwery('.nav-collapse')[0].classList.remove('closed');
					qwery('.nav-collapse')[0].classList.add('opened');
				}
				return false;
			}, false);
		}
	};

	// List-object
	// Dit object sorteert lijsten middels het List-object
	FRISBEEAPP.list = {
		sorteerPoolGamesOpWins: function(id) {
			// Zoek alle pool-tabellen met de class poolSort
			var poolSortClasses = qwery('.poolSort');

			// Loop door elk gevonden class heen
			for (var i = 0, len = poolSortClasses.length; i < len; i++) {
				var poolSortClassesId = poolSortClasses[i].id; // Haal per class de id op
				sortWins(poolSortClassesId); // Voor elk id wordt de sort functie aangeroepen
			}

			// Deze functie sorteert een opgegeven variabele
			function sortWins(poolSortClassesId) {
				// De class winsSort moet gesorteerd worden
				var options = { 
					valueNames: ['winsSort'] 
				};

				// Maak een nieuw List-object aan waarin 1) de opgegeven variabele en 2) de classes die gesorteerd moeten worden in worden gestopt
				var teamList = new List(poolSortClassesId, options);
				
				// Sorteer van hoog naar laag
				teamList.sort('winsSort', {
					asc: false
				});
			}	
		},

		zoekFunctieInSchedule: function() {
			// Waar mag op worden gezocht?
			var options = { 
				valueNames: [ 'name', 'name2', 'poolNaam', 'gespeeldeTijd' ] 
			};

			// Maak een nieuw List-object aan (in lvschedule kan worden gezocht op de opgegeven opties)
			var teamList = new List('lvschedule', options);	
		},
	};

	// Gesture-object
	// Dit object maakt gestures aan en voert acties uit als de gesture wordt uitgevoerd
	FRISBEEAPP.gesture = {
		pullToRefresh: function() {
		    // Wat moet er worden gedaan als de pagina ververst is?
		    refresh.handler = function() {
		        var self = this;
		        // Kleine vertraging zodat de gebruiker 'ziet' dat er een actie wordt uitgevoerd
		        setTimeout(function() {

		        	// Begin vanaf '#/' in de URL
		            var pagina = window.location.hash.slice(2);

		            if (pagina == 'lvhome') {
		                FRISBEEAPP.page.lvhome();
		            } 
		           	
		           	else if (pagina == 'lvschedule') {
		                FRISBEEAPP.page.lvschedule();
		            } 
		            
		            else if (pagina == 'lvteams') {
		                FRISBEEAPP.page.lvteams();
		            } 

		            else if (pagina == 'lvpools') {
		                FRISBEEAPP.page.lvpools();
		            } 

		            else if (pagina == '') {
		                FRISBEEAPP.page.lvhome();
		            } 

		            else if (pagina.indexOf('lvteam/') != -1) {
		                FRISBEEAPP.page.lvteam(FRISBEEAPP.toolbox.berekenIdUitUrl());
		            } 

		            else if (pagina.indexOf('lvgame/') != -1) {
		                FRISBEEAPP.page.lvgame(FRISBEEAPP.toolbox.berekenIdUitUrl());
		            }  
		            
		            self.slideUp();
		            
		        }, 500);
		    };
		},

		swipeScores: function() {
			// Zoek alle trAppendClasses
			var swipeclasses = qwery('.trAppendClass');
			// Maak lege arrary aan
			var swipeid = [];

			// Loop door het aantal gevonden trAppendClass heen
			for (var i = 0, len = swipeclasses.length; i < len; i++) {
				// Elk id wordt in de swipeid-array gestopt
				swipeid[i] = swipeclasses[i].id;

				// Er wordt ge'swipet' naar rechts, toon het form
				Hammer(swipeclasses[i]).on("swiperight", function(ev) {
					ev.gesture.preventDefault();
					this.style.left = '80%';
					var geswipteId = this.id;
					var toonForm = qwery('#formbijtr' + geswipteId)[0];
					toonForm.style.zIndex = 0;
				});

				// Er wordt terug ge'swipet' naar links, verberg form
				Hammer(swipeclasses[i]).on("swipeleft", function(ev) {
					ev.gesture.preventDefault();
					this.style.left = '0%';
					var geswipteId = this.id;
					var toonForm = qwery('#formbijtr' + geswipteId)[0];
					toonForm.style.zIndex = -1;
				});
			}
		}
	};

	// Domready-functie
	// Deze functie wordt uitgevoerd zodra de DOM is geladen
	domready(function () {
		// De applicatie kan worden gestart
		FRISBEEAPP.controller.init();
	});
	
})();