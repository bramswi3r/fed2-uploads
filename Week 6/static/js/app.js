/*
* Skeleton voor de score app
* Deeltoets 1
* Frontend Development 2
*
* Bram Swier 2013
*/ 

// Strengere markup + activeer native JSON-functies
"use strict";

// Maak een namespace aan (global scope), maak een nieuw object als deze al bestaat
var FRISBEEAPP = FRISBEEAPP || {};

// Self-invoking, anonieme function (local scope)
(function () {
	
	// Stap 2
	// Controller Init
	// Hier worden methodes van functies verzameld, om later in één keer te kunnen worden uitgevoerd
	FRISBEEAPP.controller = {
		init: function () {
			// Initialiseer de router
			FRISBEEAPP.router.init();

			var navigation = responsiveNav(".nav-collapse", {
		        animate: true,        // Boolean: Use CSS3 transitions, true or false
		        transition: 250,      // Integer: Speed of the transition, in milliseconds
		        label: "Menu",        // String: Label for the navigation toggle
		        insert: "after",      // String: Insert the toggle before or after the navigation
		        customToggle: "",     // Selector: Specify the ID of a custom toggle
		        openPos: "relative",  // String: Position of the opened nav, relative or static
		        jsClass: "js",        // String: 'JS enabled' class which is added to <html> el
		        init: function(){},   // Function: Init callback
		        open: function(){},   // Function: Open callback
		        close: function(){}   // Function: Close callback
		    });

		     //  var element = document.getElementById('test_el');
			    // var hammertime = Hammer(element).on("tap", function(event) {
			    //     alert('hello!');
			    // });

			FRISBEEAPP.gestures.pullToRefresh();
		}
	};

	// Stap 3
	// Router
	// Hier wordt de functie 'routie' uit het routie-script aangeroepen, 
	// om de juiste page-functie te koppelen aan de gekozen pagina als deze in de URL zit (achter de '#')	
	
	FRISBEEAPP.router = {
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

			    '*': function() {
			    	FRISBEEAPP.page.lvhome();
			    }
			});
		},

		// Stap 5
		// Er wordt naar de gekozen data-route gekeken, active wordt van elke section verwijderd verwijderd, en active wordt toegevoegd aan de gekozen pagina
		change: function () {
			FRISBEEAPP.laadbalk.toon();
			window.scrollTo(0, 0); // fix om naar boven te gaan als vorige pagina laag is
			// Begin vanaf '#' en '/'
            var route = window.location.hash.slice(2),
            	// Zoek alle sections met een data-route attribuut
                sections = qwery('section[data-route]'),
                // Stop de gekozen pagina (opgeslagen in var route) in de section var
                section = qwery('[data-route=' + route + ']')[0],
                // Query alle linkjes uit de menu-lists
                menuitems = qwery('nav > ul > li > a'),
                // Query het gekozen menuitems
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

            // Var section bestaat
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
            if (!section) {
            	// Zoek positie van '/'
            	var positieVanSlashInRoute = route.indexOf('/');
            	// Selecteer alles achter '/' weg
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

            // Standaard route (als er geen pagina achter de hash staat, dus in dit geval de eerste section: schedule)
            if (!route) {
            	sections[0].classList.add('active');
            	menuitems[0].classList.add('activemenu');
            }
		}
	};

	// Stap 4
	// Pagina's
	// Hier wordt de daadwerkelijke pagina gerenderd middels het Transparency-script
	
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
			 
					FRISBEEAPP.laadbalk.verberg();
			    }
			});

			FRISBEEAPP.router.change();
		},

		lvteams: function () {
			reqwest({
			    url: 'https://api.leaguevine.com/v1/stats/ultimate/team_stats_per_tournament/?tournament_ids=%5B19389%5D&order_by=%5B-wins%5D&access_token=e4947d5e54', 
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
							teamImage: {
								src: function(params) {
									return (this.profile_image_50);
								}
							}
						}
					}

			      	Transparency.render(qwery('[data-route=lvteams')[0], resp, directives);

			 
					FRISBEEAPP.laadbalk.verberg();
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
							profileImage: {
								src: function(params) {
									return (this.profile_image_200);
								}
							}
						}
					}

					Transparency.render(qwery('[data-route=lvteam')[0], resp, directives); 
					
					FRISBEEAPP.laadbalk.verberg();
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
							}
						}
					}

			    Transparency.render(qwery('[data-route=lvpools')[0], resp, directives);

				FRISBEEAPP.laadbalk.verberg();

				FRISBEEAPP.eventListener.poolsPagina();

				FRISBEEAPP.list.sorteerPoolGamesOpWins();
			    }
			});
			

			FRISBEEAPP.router.change();
		},

		lvgamesbijpool: function (gekozenPoolId) {
				FRISBEEAPP.laadbalk.toon();
			
				reqwest({
				    url: 'https://api.leaguevine.com/v1/games/?pool_id='+ gekozenPoolId +'&order_by=%5Bstart_time%5D&access_token=36ea8b4188', 
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

								tijdGespeeld: {
									text: function(params) {
										var tijd = new Date(this.start_time);

										var dagnaam = [
										{"0":"Zondag"},
										{"1":"Maandag"},
										{"2":"Dinsdag"},
										{"3":"Woensdag"},
										{"4":"Donderdag"},
										{"5":"Vrijdag"},
										{"6":"Zaterdag"},
										]

										var month=new Array();
										month[0]="januari";
										month[1]="februari";
										month[2]="maart";
										month[3]="april";
										month[4]="mei";
										month[5]="juni";
										month[6]="juli";
										month[7]="augustus";
										month[8]="september";
										month[9]="oktober";
										month[10]="november";
										month[11]="december";

										var maand = month[tijd.getMonth()];

										var datum = tijd.getDate();

										if (tijd.getMinutes() < '10') {
											var volleMinuten = tijd.getMinutes() + '0';
										} else {
											var volleMinuten = tijd.getMinutes();
										}

										if (tijd.getHours() < '10') {
											var volleUren = '0' + tijd.getHours();
										} else {
											var volleUren = tijd.getHours();
										}	

										return (dagnaam[tijd.getDay()][1] + " " + datum + " " + maand + ", " + volleUren + ":" + volleMinuten);
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
					
						FRISBEEAPP.laadbalk.verberg();

						poolsAppend.style.display='block';

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

							tijdGespeeld: {
								text: function(params) {
									var tijd = new Date(this.start_time);

									var dagnaam = [
									{"0":"Zondag"},
									{"1":"Maandag"},
									{"2":"Dinsdag"},
									{"3":"Woensdag"},
									{"4":"Donderdag"},
									{"5":"Vrijdag"},
									{"6":"Zaterdag"},
									]

									var month=new Array();
									month[0]="januari";
									month[1]="februari";
									month[2]="maart";
									month[3]="april";
									month[4]="mei";
									month[5]="juni";
									month[6]="juli";
									month[7]="augustus";
									month[8]="september";
									month[9]="oktober";
									month[10]="november";
									month[11]="december";

									var maand = month[tijd.getMonth()];

									var datum = tijd.getDate();

									if (tijd.getMinutes() < '10') {
										var volleMinuten = tijd.getMinutes() + '0';
									} else {
										var volleMinuten = tijd.getMinutes();
									}

									if (tijd.getHours() < '10') {
										var volleUren = '0' + tijd.getHours();
									} else {
										var volleUren = tijd.getHours();
									}	

									return (dagnaam[tijd.getDay()][1] + " " + datum + " " + maand + ", " + volleUren + ":" + volleMinuten);
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

							team_2: {
								team2NaamEnWinner: {
									text: function(params) {
										return(this.name);
									}
								}
							},

							team2NaamEnWinner: {
								class: function(params) {
									if (parseInt(this.team_2_score) > parseInt(this.team_1_score)) {
										return('winner');
									} else if (parseInt(this.team_2_score) < parseInt(this.team_1_score)) {
										return('loser');
									} else {
										return('stalemate');
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
							}
						}
					}
					
					Transparency.render(qwery('[data-route=lvschedule')[0], resp, directives);

					FRISBEEAPP.list.zoekFunctieInSchedule();

					FRISBEEAPP.append.appendFormBijTrId();

					FRISBEEAPP.eventListener.schedulePagina();

					FRISBEEAPP.laadbalk.verberg();

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
							}
						}
					}
					Transparency.render(qwery('[data-route=lvgame')[0], resp, directives); 
					
					FRISBEEAPP.laadbalk.verberg();
				}
			});

			FRISBEEAPP.eventListener.gamePagina(id);

			FRISBEEAPP.router.change();
		},

		lvgamepaginasend: function (gameId) {
			    FRISBEEAPP.laadbalk.toon();

			    var nieuweTeam1Score = document.getElementById('team1score').value;
			    var nieuweTeam2Score = document.getElementById('team2score').value;
			    var isFinal = document.getElementById('isFinal').checked;

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
					  	  console.log('data succesvol gepost');
					  	  console.log('now reloading data');
					  	  
						  FRISBEEAPP.laadbalk.verberg();
					     	FRISBEEAPP.page.lvgame(gameId);
				    }
				})
		},

		lvschedulepaginasend: function (gameId, score1, score2) {
			FRISBEEAPP.laadbalk.toon();

			reqwest({
				    url: 'https://api.leaguevine.com/v1/game_scores/', 
				    type: 'json', 
				    method: 'post', 
				    data: JSON.stringify({ 
						game_id: gameId,
					    team_1_score: score1,
					    team_2_score: score2,
					    is_final: 'True'
				  	}), 
				  	contentType: 'application/json', 
				  	headers: {
				      'Authorization': 'bearer 82996312dc'
				    }, 

				    error: function (err) {
				    	console.log(err);
				    },

				    success: function (resp) {
					  	  console.log('data succesvol gepost');
					  	  console.log('now reloading data');
					  	  
						  FRISBEEAPP.laadbalk.verberg();
					      FRISBEEAPP.page.lvschedule();
				    }
				})
		}
	};

	FRISBEEAPP.laadbalk = {
		toon: function() {
			
			document.getElementById('overlay').style.opacity=0.65;
			document.getElementById('overlay').style.zIndex=1;
	   	}, 

	   	verberg: function() {
	   		
	   		document.getElementById('overlay').style.opacity=0;
	   		document.getElementById('overlay').style.zIndex=-1;
	   	}
	};

	FRISBEEAPP.eventListener = {
		gamePagina: function(id) {

			var gameScoreForm = document.getElementById('updateTeamScoreForm');

			var toonFormButton = document.getElementById('toonform');

			var gameId = id;

			toonFormButton.onclick = function() {
				gameScoreForm.style.display="block";
			};

			gameScoreForm.addEventListener('submit', function(event) {
			    event.preventDefault();

			    FRISBEEAPP.page.lvgamepaginasend(gameId);

			    return false;
			}, false);
		},

		poolsPagina: function() {
			function addEventListenerByClass(className, event, fn) {
			    var list = document.getElementsByClassName(className);
			    for (var i = 0, len = list.length; i < len; i++) {
			        list[i].addEventListener(event, fn, false);
			    }
			}

			addEventListenerByClass('poolidtoggle', 'click', toonGamesBijPool); 

			function toonGamesBijPool() {
				event.preventDefault();

				var gekozenPoolId = this.id;

				var appendTo = qwery('#append' + gekozenPoolId)[0];
				var poolsAppend = qwery('#poolsAppend')[0];

				poolsAppend.style.display='none';
				appendTo.appendChild(poolsAppend);

				var bijbehorendeSection = document.getElementById('section' + gekozenPoolId);

				FRISBEEAPP.page.lvgamesbijpool(gekozenPoolId, poolsAppend);

				return false;
			}
		},

		schedulePagina: function() {
			function addEventListenerByClassVoorSchedule(className, event, fn) {
			    var list = document.getElementsByClassName(className);
			    for (var i = 0, len = list.length; i < len; i++) {
			        list[i].addEventListener(event, fn, false);
			    }
			}

			addEventListenerByClassVoorSchedule('lvschedulescoreform', 'submit', updateScheduleScore);

			function updateScheduleScore () {
				event.preventDefault();

				var verstuurdeScheduleForm = this; 

				var gameIdverstuurdeScheduleForm = this.id;
				gameIdverstuurdeScheduleForm = gameIdverstuurdeScheduleForm.replace('gameform', '');

				var valuesofgameschedule = [];

				for (var i = 0; i < verstuurdeScheduleForm.length; i++) {
					valuesofgameschedule[i] = verstuurdeScheduleForm.elements[i].value;
				}

				var scheduleScoreTeam1 = valuesofgameschedule[0];
				var scheduleScoreTeam2 = valuesofgameschedule[1];

				FRISBEEAPP.page.lvschedulepaginasend(gameIdverstuurdeScheduleForm, scheduleScoreTeam1, scheduleScoreTeam2);

				return false;

			}
		}
	};

	FRISBEEAPP.list = {
		sorteerPoolGamesOpWins: function(id) {
			var poolSortClasses = document.getElementsByClassName('poolSort');
			for (var i = 0, len = poolSortClasses.length; i < len; i++) {
				var poolSortClassesId = poolSortClasses[i].id; // haal per class de id op
				sortWins(poolSortClassesId); // voor elk id wordt de sort functie aangeroepen
			}

			function sortWins(poolSortClassesId) {
				var options = { 
					valueNames: [ 'winsSort', 'loseSort', 'pointsSort', 'allowedSort' ] 
				};
				var teamList = new List(poolSortClassesId, options);
				teamList.sort('winsSort' , {
					asc: false
				});
				// teamList.sort('loseSort', { 
				// 	asc: true 
				// });
				// teamList.sort('pointsSort', {
				// 	asc: false
				// });
				// teamList.sort('allowedSort', {
				// 	asc: true
				// });
			}	
		},

		zoekFunctieInSchedule: function(id) {
			var options = { 
				valueNames: [ 'name', 'name2', 'poolNaam', 'gespeeldeTijd' ] 
			};
			var teamList = new List('lvschedule', options);		
		}
	};

	FRISBEEAPP.append = {
		appendFormBijTrId: function(id) {
			var trAppendClass = document.getElementsByClassName('trAppendClass');
			var formBijTrIds = document.getElementsByClassName('formbijtrid');
			for (var i = 0, len = formBijTrIds.length; i < len; i++) {
				 trAppendClass[i].appendChild(formBijTrIds[i]);
			}
		}
	};

	FRISBEEAPP.gestures = {
		pullToRefresh: function() {



		}
	}
	

	// Stap 1
	// DOM is klaar (pagina is geladen)
	domready(function () {
		// Roep de controller init aan om de methodes uit te voeren die hier in staan (in dit geval de routie functie uit het router-script)
		FRISBEEAPP.controller.init();
	});
	
})();
