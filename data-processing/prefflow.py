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
        electorates[pref['DivisionID']] = []

    # Get the electorate and round of voting
    electorate = electorates[pref['DivisionID']]
    round_number = int(pref["CountNumber"])

    # Create/retrieve a round (a list of parties and preferences)
    if len(electorate) <= round_number:
        round = {
            "parties": {},
            "number": round_number,
        }
        electorate.append(round)
    else:
        round = electorate[round_number]

    # Get the percentage of votes the party has this round
    if pref['CalculationType'] == 'Preference Count':
        round['parties'][pref['PartyNm']] = {
            "name": pref['PartyNm'],
            "votes": float(pref['CalculationValue']),
            "round": round_number,
        }
    if pref['CalculationType'] == 'Transfer Count':
        round['parties'][pref['PartyNm']]['transfers'] = float(pref['CalculationValue'])

        if float(pref['CalculationValue'])< 0:
            round['transferrer'] = pref['PartyNm']
        
        
# Write the results as JSON to a file
out = json.dumps(electorates)
out_file = open(PREFERENCES_JSON, 'w')
out_file.write(out)

# close files
in_file.close()
out_file.close()
