electvisdiagrams = angular.module('elect-vis-diagrams', []);

electvisdiagrams.directive('diagram', function() {
	return {
		restrict: "E",
		scope: {
			data: "=data",
		},
		link: function(scope, elem, attrs) {
			var vis = d3.select(elem[0])
				.append('svg:svg');
			
			/* A sankey diagram used for visualising party preferences */
			if (attrs.type == "sankey") {
				scope.$watch('data', function(data) {
					if (data == undefined) return;
					
					// Settings and scales
					var w = vis[0][0].offsetWidth,
					h = vis[0][0].offsetHeight,
					totalvotes = d3.sum(d3.values(data[0].parties), function(p) { return p.votes; }),
					gapratio = 0.7,
					padding = 15,
					x = d3.scale.ordinal()
						.domain(d3.range(data.length)) // number of rounds
						.rangeBands([0, w + (w/(data.length-1))], gapratio),
					y = d3.scale.linear()
						.domain([0, totalvotes]) // number of votes
						.range([0, h - padding * d3.keys(data[0].parties).length]),
					line = d3.svg.line()
						.interpolate('basis');
					
					// Rounds
					var rounds = vis.selectAll('g.round')
						.data(data)
							.enter().append('svg:g')
								.attr('class', 'round')
								.attr("transform", function(d, i) { return "translate(" + (x(i) - x(0)) + ",0)" });
					
					// Parties
					var parties = rounds.selectAll('g.party')
						.data(function(round) {
							var parties = d3.map(round.parties).values();
							parties.sort(function(partyA,partyB) { return partyB.votes-partyA.votes; });
							
							var prev = 0;
							var order = 0;
							parties.forEach(function(party) {
								party.previous = prev;
								party.order = order;
								prev += party.votes;
								order++;
							});
							return parties;
						})
							.enter().append('svg:g')
								.attr('class', 'party');
					
					// Party sankey bars
					parties.append('svg:rect')
						.attr('fill', 'steelblue')
						.attr('y', function(party, i) {
							return y(party.previous) + i * padding;
						})
						.attr('width', x.rangeBand())
						.attr('height', function(party) { return y(party.votes) })
						.append('svg:title')
							.text(function(party) { return party.name; });
					
					// The function to generate a preference flow
					var flowLine = function() {
						return function(flow) {
							var source = flow.source,
								target = flow.target,
								gapWidth = x(0),
								bandWidth = x.rangeBand() + gapWidth,
								startx = x.rangeBand() - bandWidth,
								sourcey = y(source.previous) + 
									source.order * padding +
									y(flow.onset) +
									y(flow.size)/2,
								targety = y(target.previous) + 
									target.order * padding + 
									y(flow.offset) +
									y(flow.size)/2,
								points = [
									[startx, sourcey],
									[startx + gapWidth/2, sourcey],
									[startx + gapWidth/2, targety],
									[0, targety]
								];
							
							return line(points);
						}
					}
					
					// Flows
					var flows = parties.selectAll('path.flow')
						.data(function(party) {
							if (party.round < 1) return []; // No flows for the first round
							
							// Previous round of results
							var round = data[party.round],
								prev_round = data[party.round-1];
							
							// Skip parties that have no preferences this round
							if (party.votes == 0) return [];
							
							// Keep count of the offset of the transfer flow
							var transferrer = prev_round.parties[round.transferrer];
							if (transferrer.previous_transfers === undefined)
								transferrer.previous_transfers = 0;
							transferrer.previous_transfers += party.transfers;
							
							return [{
								source: prev_round.parties[party.name],
								target: party,
								size: prev_round.parties[party.name].votes,
								offset: 0,
								onset: 0,
							}, {
								source: transferrer,
								target: party,
								size: party.transfers,
								offset: prev_round.parties[party.name].votes,
								onset: transferrer.previous_transfers - party.transfers,
							}];
						})
							.enter().append('svg:path')
								.attr('class', 'flow')
								.style('stroke-width', function(flow) { return y(flow.size); })
								.attr('d', flowLine());
				});
			}
		}
	}
});

electvisdiagrams.directive('preferenceFlow', function() {
	return {
		restrict: "E",
		templateUrl: 'pages/preference-flow.html',
		scope: {
			data: "=data",
			name: "=name",
		},
		link: function(scope, elem, attrs) {
		}
	}
});