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
					padding = 0,
					x = d3.scale.ordinal()
						.domain(d3.range(data.rounds.length)) // number of rounds
						.rangeBands([0, w + (w/(data.rounds.length-1))], gapratio),
					y = d3.scale.linear()
						.domain([0, totalvotes]) // number of votes
						.range([0, h - padding * d3.keys(data.candidates).length]),
					line = d3.svg.line()
						.interpolate('basis');
					
					// Map colors to candidates
					var candidateColor = d3.scale.ordinal()
						.domain(["ALP", "LP", "NP", "GRN"])
						.range(["#E95D4E", "#45A1DE", "#F4A425", "#59BC26", "#2C3E50", "#E9662C", "#762AAC", "#AC876A", "#7591AC", "#52AC5E", "#AC72A2", "#068894", "#94261D", "#00AC65",]);
					
					// Seperate chart and overlays
					var chart = vis.append('svg:g')
						.attr('class', 'chart');
					var overlays = vis.append('svg:g')
						.attr('class', 'overlays');
					
					// 50% of votes line
					var pc50 = overlays.append('svg:g');
					pc50.append('svg:text')
						.text('50%')
						.attr('text-anchor', 'end')
						.attr('x', w)
						.attr('y', y(totalvotes/2));
					pc50.append('svg:line')
						.attr('class', 'threshold')
						.attr('x1', 0)
						.attr('x2', w)
						.attr('y1', y(totalvotes/2))
						.attr('y2', y(totalvotes/2));
					
					// Rounds
					var rounds = chart.selectAll('g.round')
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
								candidate.offset_transfers = 0;
								candidate.order = order;
								prev += candidate.votes;
								order++;
							});
							return candidates;
						})
							.enter().append('svg:g')
								.attr('class', function(candidate) {
									var c = data.candidates[candidate.id]
									return 'candidate '+c.partyAbbrv;
								})
								.attr('visibility', function(c) { return c.votes ? 'visible' : 'hidden'; });
					
					// Candidate sankey bars
					candidates.append('svg:rect')
						.style('fill', function(candidate) {
									var c = data.candidates[candidate.id];
									return candidateColor(c.partyAbbrv);
								})
						.attr('y', function(candidate, i) { return y(candidate.offset) + i*padding; })
						.attr('width', x.rangeBand())
						.attr('height', function(candidate) { return y(candidate.votes) })
						.on('mouseover', function(candidate) {
									var c = data.candidates[candidate.id];
									d3.selectAll('.candidate.'+c.partyAbbrv+' .flow').attr('class', 'flow highlight');
								})
								.on('mouseout', function(candidate) {
									var c = data.candidates[candidate.id];
									d3.selectAll('.candidate.'+c.partyAbbrv+' .flow').attr('class', 'flow');
								})
						.append('svg:title')
							.text(function(c) {
								var cand = data.candidates[c.id];
								return 'Preference ' + (c.round+1) + '\n' +
									cand.party + " - " + cand.name + '\n' +
									c.votes.toLocaleString() + ' votes';
							});
					// Candidate labels
					var label = candidates.append('svg:text')
						.attr('class', 'label')
						.attr('y', function(candidate, i) { return y(candidate.offset+candidate.votes) + i*padding; })
						.attr('x', x.rangeBand()/2)
						.attr('text-anchor', 'middle');
					
					label.append('tspan')
							.text(function(candidate) {
								var c = data.candidates[candidate.id];
								return c.partyAbbrv;
							})
						.append('tspan')
							.text(function(candidate) {
								return candidate.votes.toLocaleString();
							})
							.attr('x', x.rangeBand()/2)
							.attr('dy', '-1em');
					
					label.attr('visibility', function(c) {
						if (this.parentNode.getAttribute('visibility') == 'hidden') return 'hidden';
						return (this.parentNode.getBBox().height > this.getBBox().height) ? 'visible' : 'hidden';
					});
					
					
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
							.enter().append('svg:g');
						
						flows.append('svg:path')
								.attr('class', 'flow')
								.style('stroke-width', function(flow) { return y(flow.size); })
								.style('stroke', function(flow) {
									var c = data.candidates[flow.source.id];
									return candidateColor(c.partyAbbrv);
								})
								.on('mouseover', function(flow) {
									var c = data.candidates[flow.source.id];
									d3.selectAll('.candidate.'+c.partyAbbrv+' .flow').attr('class', 'flow highlight');
									d3.select(this).attr('class', 'flow highlight');
								})
								.on('mouseout', function(flow) {
									var c = data.candidates[flow.source.id];
									d3.selectAll('.candidate.'+c.partyAbbrv+' .flow').attr('class', 'flow');
									d3.select(this).attr('class', 'flow');
								})
								.attr('d', flowLine());
					
					// Flow label
					flows.insert('svg:text')
						.attr('class', 'label')
						.attr('y', function(flow) { return y(flow.target.offset + flow.offset + flow.size/2); })
						.attr('text-anchor', 'end')
						.text(function(flow) { return flow.source.votes.toLocaleString(); });
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