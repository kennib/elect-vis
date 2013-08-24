import csv, json

# input file
PREFERENCES_CSV = "HouseDopByDivisionDownload-15508.csv"
# output file
PREFERENCES_JSON = "../data/preferences.json"


in_file = open(PREFERENCES_CSV)
in_file.readline() # discard the line of data at the start

prefs = csv.DictReader(in_file)

electorates = {}

for pref in prefs:
    # Add a list of rounds for electorates not yet seen
    if pref['DivisionID'] not in electorates:
        electorates[pref['DivisionID']] = {
            'rounds': [],
            'candidates': {},
        }

    # Get the electorate and round of voting
    electorate = electorates[pref['DivisionID']]
    round_number = int(pref["CountNumber"])
    
    # Add the candidates' info
    if round_number == 0:
        electorate['candidates'][pref['CandidateID']] = {
            "id": pref['CandidateID'],
            "name": pref['GivenNm'] + " " + pref['Surname'],
            "party": pref['PartyNm'],
            "partyAbbrv": pref['PartyAb'],
            "ballotPos": pref['BallotPosition'],
        }
    
    # Create/retrieve a round (a list of candidates and votes)
    if len(electorate['rounds']) <= round_number:
        round = {
            "candidates": {},
        }
        electorate['rounds'].append(round)
    else:
        round = electorate['rounds'][round_number]

    # Get the percentage of votes the party has this round
    if pref['CalculationType'] == 'Preference Count':
        round['candidates'][pref['CandidateID']] = {
            "id": pref['CandidateID'],
            "votes": float(pref['CalculationValue']),
            "round": round_number,
        }
    
    # Get the votes transferred from the previous round
    if pref['CalculationType'] == 'Transfer Count':
        round['candidates'][pref['CandidateID']]['transfers'] = float(pref['CalculationValue'])

        if float(pref['CalculationValue'])< 0:
            round['transferrer'] = pref['CandidateID']
        
        
# Write the results as JSON to a file
out = json.dumps(electorates)
out_file = open(PREFERENCES_JSON, 'w')
out_file.write(out)

# close files
in_file.close()
out_file.close()
