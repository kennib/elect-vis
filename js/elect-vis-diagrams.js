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
			
			/* A sankey diagram used for visualising candidate preferences */
			if (attrs.type == "sankey") {
				scope.$watch('data', function(data) {
					if (data == undefined) return;
					
					// Settings and scales
					var w = vis[0][0].offsetWidth,
					h = vis[0][0].offsetHeight,
					totalvotes = d3.sum(d3.values(data.rounds[0].candidates), function(p) { return p.votes; }),
					gapratio = 0.7,
					padding = 15,
					x = d3.scale.ordinal()
						.domain(d3.range(data.rounds.length)) // number of rounds
						.rangeBands([0, w + (w/(data.rounds.length-1))], gapratio),
					y = d3.scale.linear()
						.domain([0, totalvotes]) // number of votes
						.range([0, h - padding * d3.keys(data.candidates).length]),
					line = d3.svg.line()
						.interpolate('basis');
					
					// Map colors to candidates
					var candidateColor = d3.scale.category10();
					
					// Rounds
					var rounds = vis.selectAll('g.round')
						.data(data.rounds)
							.enter().append('svg:g')
								.attr('class', 'round')
								.attr("transform", function(d, i) { return "translate(" + (x(i) - x(0)) + ",0)" });
					
					// Candidates
					var candidates = rounds.selectAll('g.candidate')
						.data(function(round) {
							var candidates = d3.map(round.candidates).values();
							candidates.sort(function(candidateA,candidateB) { return candidateB.votes-candidateA.votes; });
							
							var prev = 0;
							var order = 0;
							candidates.forEach(function(candidate) {
								candidate.offset = prev;
								candidate.order = order;
								prev += candidate.votes;
								order++;
							});
							return candidates;
						})
							.enter().append('svg:g')
								.attr('class', 'candidate');
					
					// candidate sankey bars
					candidates.append('svg:rect')
						.attr('fill', function(candidate) { return candidateColor(candidate.id); })
						.attr('y', function(candidate, i) {
							return y(candidate.offset) + i * padding;
						})
						.attr('width', x.rangeBand())
						.attr('height', function(candidate) { return y(candidate.votes) })
						.append('svg:title')
							.text(function(candidate) { return candidate.id; });
					
					// The function to generate a preference flow
					var flowLine = function() {
						return function(flow) {
							var source = flow.source,
								target = flow.target,
								gapWidth = x(0),
								bandWidth = x.rangeBand() + gapWidth,
								startx = x.rangeBand() - bandWidth,
								sourcey = y(source.offset) + 
									source.order * padding +
									y(flow.onset) +
									y(flow.size)/2,
								targety = y(target.offset) + 
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
					var flows = candidates.selectAll('path.flow')
						.data(function(candidate) {
							if (candidate.round < 1) return []; // No flows for the first round
							
							// offset round of results
							var round = data.rounds[candidate.round],
								prev_round = data.rounds[candidate.round-1];
							
							// Skip candidates that have no preferences this round
							if (candidate.votes == 0) return [];
							
							// Keep count of the offset of the transfer flow
							
							var transferrer = prev_round.candidates[round.transferrer];
							if (transferrer.offset_transfers === undefined)
								transferrer.offset_transfers = 0;
							transferrer.offset_transfers += candidate.transfers;
							
							return [{
								source: prev_round.candidates[candidate.id],
								target: candidate,
								size: prev_round.candidates[candidate.id].votes,
								offset: 0,
								onset: 0,
							}, {
								source: transferrer,
								target: candidate,
								size: candidate.transfers,
								offset: prev_round.candidates[candidate.id].votes,
								onset: transferrer.offset_transfers - candidate.transfers,
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