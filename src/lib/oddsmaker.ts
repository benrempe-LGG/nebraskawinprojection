// ============================================================
// P4 Schedule Data & Spread Math
// ============================================================

export interface Game {
  week: number;
  date: string;
  opponent: string;
  loc: "HOME" | "AWAY" | "NEUTRAL";
  venue: string;
}

export interface TeamInfo {
  conference: string;
  schedule: Game[];
}

// Compact data: { teamName: [conference, [[date, opponent, loc], ...]] }
// loc: H=HOME, A=AWAY, N=NEUTRAL
const RAW: Record<string, [string, [string, string, string][]]> = {"Illinois":["Big Ten",[["SEP 5","UAB","H"],["SEP 12","Duke","H"],["SEP 19","SIU","H"],["SEP 26","Ohio State","A"],["OCT 3","Purdue","H"],["OCT 10","Michigan State","A"],["OCT 24","Oregon","H"],["OCT 31","Maryland","A"],["NOV 7","Nebraska","H"],["NOV 14","UCLA","A"],["NOV 21","Iowa","H"],["NOV 28","Northwestern","H"]]],"Indiana":["Big Ten",[["SEP 5","North Texas","H"],["SEP 12","Howard","H"],["SEP 19","Western Kentucky","H"],["SEP 26","Northwestern","H"],["OCT 3","Rutgers","A"],["OCT 10","Nebraska","A"],["OCT 17","Ohio State","H"],["OCT 24","Michigan","A"],["OCT 31","Minnesota","H"],["NOV 14","USC","H"],["NOV 21","Washington","A"],["NOV 28","Purdue","H"]]],"Iowa":["Big Ten",[["SEP 5","Northern Illinois","H"],["SEP 12","Iowa State","H"],["SEP 19","Northern Iowa","H"],["SEP 26","Michigan","A"],["OCT 3","Ohio State","H"],["OCT 10","Washington","A"],["OCT 24","Minnesota","A"],["OCT 31","Wisconsin","H"],["NOV 7","Northwestern","A"],["NOV 14","Purdue","H"],["NOV 21","Illinois","A"],["NOV 27","Nebraska","H"]]],"Maryland":["Big Ten",[["SEP 5","Howard","H"],["SEP 12","UConn","A"],["SEP 19","Virginia Tech","H"],["SEP 26","UCLA","H"],["OCT 3","Nebraska","A"],["OCT 10","Ohio State","A"],["OCT 17","Rutgers","H"],["OCT 31","Illinois","H"],["NOV 7","Purdue","A"],["NOV 14","Wisconsin","H"],["NOV 21","USC","A"],["NOV 28","Penn State","H"]]],"Michigan":["Big Ten",[["SEP 5","Western Michigan","H"],["SEP 12","Oklahoma","H"],["SEP 19","UTEP","H"],["SEP 26","Iowa","H"],["OCT 3","Minnesota","A"],["OCT 17","Penn State","H"],["OCT 24","Indiana","H"],["OCT 31","Rutgers","A"],["NOV 7","Michigan State","H"],["NOV 14","Oregon","A"],["NOV 21","UCLA","H"],["NOV 28","Ohio State","A"]]],"Michigan State":["Big Ten",[["SEP 5","Toledo","H"],["SEP 12","Eastern Michigan","H"],["SEP 19","Notre Dame","A"],["SEP 26","Nebraska","H"],["OCT 3","Wisconsin","A"],["OCT 10","Illinois","H"],["OCT 17","Northwestern","H"],["OCT 24","UCLA","A"],["NOV 7","Michigan","A"],["NOV 14","Washington","H"],["NOV 21","Oregon","H"],["NOV 28","Rutgers","A"]]],"Minnesota":["Big Ten",[["SEP 3","Eastern Illinois","H"],["SEP 12","Mississippi State","H"],["SEP 19","Akron","H"],["SEP 26","Washington","A"],["OCT 3","Michigan","H"],["OCT 10","Purdue","A"],["OCT 24","Iowa","H"],["OCT 31","Indiana","A"],["NOV 7","UCLA","H"],["NOV 14","Penn State","A"],["NOV 21","Northwestern","H"],["NOV 28","Wisconsin","A"]]],"Nebraska":["Big Ten",[["SAT SEP 5","Ohio","H"],["SAT SEP 12","Bowling Green","H"],["SAT SEP 19","North Dakota","H"],["SAT SEP 26","Michigan State","A"],["SAT OCT 3","Maryland","H"],["SAT OCT 10","Indiana","H"],["SAT OCT 17","Oregon","A"],["SAT OCT 31","Washington","H"],["SAT NOV 7","Illinois","A"],["SAT NOV 14","Rutgers","A"],["SAT NOV 21","Ohio State","H"],["FRI NOV 27","Iowa","A"]]],"Northwestern":["Big Ten",[["SEP 5","South Dakota State","H"],["SEP 19","Colorado","H"],["SEP 26","Indiana","A"],["OCT 3","Penn State","H"],["OCT 10","Ball State","H"],["OCT 17","Michigan State","A"],["OCT 24","Rutgers","H"],["OCT 31","Oregon","A"],["NOV 7","Iowa","H"],["NOV 14","Ohio State","A"],["NOV 21","Minnesota","A"],["NOV 28","Illinois","A"]]],"Ohio State":["Big Ten",[["SEP 5","Ball State","H"],["SEP 12","Texas","A"],["SEP 19","Kent State","H"],["SEP 26","Illinois","H"],["OCT 3","Iowa","A"],["OCT 10","Maryland","H"],["OCT 17","Indiana","A"],["OCT 31","USC","A"],["NOV 7","Oregon","H"],["NOV 14","Northwestern","H"],["NOV 21","Nebraska","A"],["NOV 28","Michigan","H"]]],"Oregon":["Big Ten",[["SEP 5","Boise State","H"],["SEP 12","Oklahoma State","A"],["SEP 19","Portland State","H"],["SEP 26","USC","A"],["OCT 10","UCLA","H"],["OCT 17","Nebraska","H"],["OCT 24","Illinois","A"],["OCT 31","Northwestern","H"],["NOV 7","Ohio State","A"],["NOV 14","Michigan","H"],["NOV 21","Michigan State","A"],["NOV 28","Washington","H"]]],"Penn State":["Big Ten",[["SEP 5","Marshall","H"],["SEP 12","Temple","A"],["SEP 19","Buffalo","H"],["SEP 26","Wisconsin","H"],["OCT 3","Northwestern","A"],["OCT 10","USC","H"],["OCT 17","Michigan","A"],["OCT 31","Purdue","H"],["NOV 7","Washington","A"],["NOV 14","Minnesota","H"],["NOV 21","Rutgers","H"],["NOV 28","Maryland","A"]]],"Purdue":["Big Ten",[["SEP 5","Indiana State","H"],["SEP 12","Wake Forest","H"],["SEP 19","UCLA","A"],["SEP 26","Notre Dame","H"],["OCT 3","Illinois","A"],["OCT 10","Minnesota","H"],["OCT 17","Washington","H"],["OCT 31","Penn State","A"],["NOV 7","Maryland","H"],["NOV 14","Iowa","A"],["NOV 21","Wisconsin","H"],["NOV 28","Indiana","A"]]],"Rutgers":["Big Ten",[["SEP 3","UMass","H"],["SEP 11","Boston College","A"],["SEP 19","USC","H"],["SEP 26","Howard","H"],["OCT 3","Indiana","H"],["OCT 17","Maryland","A"],["OCT 24","Northwestern","A"],["OCT 31","Michigan","H"],["NOV 7","Wisconsin","A"],["NOV 14","Nebraska","H"],["NOV 21","Penn State","A"],["NOV 28","Michigan State","H"]]],"UCLA":["Big Ten",[["SEP 5","Cal","A"],["SEP 12","San Diego State","H"],["SEP 19","Purdue","H"],["SEP 26","Maryland","A"],["OCT 10","Oregon","A"],["OCT 17","Wisconsin","H"],["OCT 24","Michigan State","H"],["OCT 31","Nevada","H"],["NOV 7","Minnesota","A"],["NOV 14","Illinois","H"],["NOV 21","Michigan","A"],["NOV 28","USC","H"]]],"USC":["Big Ten",[["SEP 5","Fresno State","H"],["SEP 12","Louisiana","H"],["SEP 19","Rutgers","A"],["SEP 26","Oregon","H"],["OCT 3","Washington","H"],["OCT 10","Penn State","A"],["OCT 24","Wisconsin","A"],["OCT 31","Ohio State","H"],["NOV 14","Indiana","A"],["NOV 21","Maryland","H"],["NOV 28","UCLA","A"]]],"Washington":["Big Ten",[["SEP 5","Washington State","H"],["SEP 12","Utah State","H"],["SEP 19","Eastern Washington","H"],["SEP 26","Minnesota","H"],["OCT 3","USC","A"],["OCT 10","Iowa","H"],["OCT 17","Purdue","A"],["OCT 31","Nebraska","A"],["NOV 7","Penn State","H"],["NOV 14","Michigan State","A"],["NOV 21","Indiana","H"],["NOV 28","Oregon","A"]]],"Wisconsin":["Big Ten",[["SEP 6","Notre Dame","N"],["SEP 12","Western Illinois","H"],["SEP 19","Eastern Michigan","H"],["SEP 26","Penn State","A"],["OCT 3","Michigan State","H"],["OCT 17","UCLA","A"],["OCT 24","USC","H"],["OCT 31","Iowa","A"],["NOV 7","Rutgers","H"],["NOV 14","Maryland","A"],["NOV 21","Purdue","A"],["NOV 28","Minnesota","H"]]],"Alabama":["SEC",[["SEP 5","East Carolina","H"],["SEP 12","Kentucky","A"],["SEP 19","Florida State","H"],["SEP 26","South Carolina","H"],["OCT 3","Mississippi State","A"],["OCT 10","Georgia","H"],["OCT 17","Tennessee","A"],["OCT 24","Texas A&M","H"],["NOV 7","LSU","A"],["NOV 14","Vanderbilt","A"],["NOV 21","Chattanooga","H"],["NOV 28","Auburn","H"]]],"Arkansas":["SEC",[["SEP 5","North Alabama","H"],["SEP 12","Utah","A"],["SEP 19","Georgia","H"],["SEP 26","Tulsa","H"],["OCT 3","Texas A&M","A"],["OCT 10","Tennessee","H"],["OCT 17","Vanderbilt","A"],["OCT 31","Missouri","H"],["NOV 7","Auburn","A"],["NOV 14","South Carolina","H"],["NOV 21","Texas","A"],["NOV 28","LSU","H"]]],"Auburn":["SEC",[["SEP 5","Baylor","N"],["SEP 12","Southern Miss","H"],["SEP 19","Florida","H"],["SEP 26","Vanderbilt","H"],["OCT 3","Tennessee","A"],["OCT 17","Georgia","A"],["OCT 24","LSU","H"],["OCT 31","Ole Miss","A"],["NOV 7","Arkansas","H"],["NOV 14","Mississippi State","A"],["NOV 21","Samford","H"],["NOV 28","Alabama","A"]]],"Florida":["SEC",[["SEP 5","Florida Atlantic","H"],["SEP 12","Campbell","H"],["SEP 19","Auburn","A"],["SEP 26","Ole Miss","H"],["OCT 3","Missouri","A"],["OCT 10","South Carolina","H"],["OCT 17","Texas","A"],["OCT 31","Georgia","N"],["NOV 7","Oklahoma","H"],["NOV 14","Kentucky","A"],["NOV 21","Vanderbilt","H"],["NOV 28","Florida State","A"]]],"Georgia":["SEC",[["SEP 5","Tennessee State","H"],["SEP 12","Western Kentucky","H"],["SEP 19","Arkansas","A"],["SEP 26","Oklahoma","H"],["OCT 3","Vanderbilt","H"],["OCT 10","Alabama","A"],["OCT 17","Auburn","H"],["OCT 31","Florida","N"],["NOV 7","Ole Miss","A"],["NOV 14","Missouri","H"],["NOV 21","South Carolina","A"],["NOV 28","Georgia Tech","H"]]],"Kentucky":["SEC",[["SEP 5","Youngstown State","H"],["SEP 12","Alabama","H"],["SEP 19","Texas A&M","A"],["SEP 26","South Alabama","H"],["OCT 3","South Carolina","A"],["OCT 10","LSU","H"],["OCT 17","Oklahoma","A"],["OCT 24","Vanderbilt","H"],["NOV 7","Tennessee","A"],["NOV 14","Florida","H"],["NOV 21","Missouri","A"],["NOV 28","Louisville","H"]]],"LSU":["SEC",[["SEP 5","Clemson","H"],["SEP 12","Louisiana Tech","H"],["SEP 19","Ole Miss","A"],["SEP 26","Texas A&M","H"],["OCT 3","McNeese State","H"],["OCT 10","Kentucky","A"],["OCT 17","Mississippi State","H"],["OCT 24","Auburn","A"],["NOV 7","Alabama","H"],["NOV 14","Texas","H"],["NOV 21","Tennessee","A"],["NOV 28","Arkansas","A"]]],"Mississippi State":["SEC",[["SEP 5","ULM","H"],["SEP 12","Minnesota","A"],["SEP 19","South Carolina","A"],["SEP 26","Missouri","H"],["OCT 3","Alabama","H"],["OCT 17","LSU","A"],["OCT 24","Oklahoma","H"],["OCT 31","Texas","A"],["NOV 7","Vanderbilt","H"],["NOV 14","Auburn","H"],["NOV 21","Tennessee Tech","H"],["NOV 28","Ole Miss","A"]]],"Missouri":["SEC",[["SEP 5","Arkansas-Pine Bluff","H"],["SEP 12","Kansas","A"],["SEP 19","Troy","H"],["SEP 26","Mississippi State","A"],["OCT 3","Florida","H"],["OCT 10","Texas A&M","H"],["OCT 17","Ole Miss","A"],["OCT 31","Arkansas","A"],["NOV 7","Texas","H"],["NOV 14","Georgia","A"],["NOV 21","Kentucky","H"],["NOV 28","Oklahoma","H"]]],"Oklahoma":["SEC",[["SEP 5","UTEP","H"],["SEP 12","Michigan","A"],["SEP 19","New Mexico","H"],["SEP 26","Georgia","A"],["OCT 10","Texas","N"],["OCT 17","Kentucky","H"],["OCT 24","Mississippi State","A"],["OCT 31","South Carolina","H"],["NOV 7","Florida","A"],["NOV 14","Ole Miss","H"],["NOV 21","Texas A&M","H"],["NOV 28","Missouri","A"]]],"Ole Miss":["SEC",[["SEP 5","Louisville","N"],["SEP 12","Charlotte","H"],["SEP 19","LSU","H"],["SEP 26","Florida","A"],["OCT 10","Vanderbilt","A"],["OCT 17","Missouri","H"],["OCT 24","Texas","A"],["OCT 31","Auburn","H"],["NOV 7","Georgia","H"],["NOV 14","Oklahoma","A"],["NOV 21","Wofford","H"],["NOV 28","Mississippi State","H"]]],"South Carolina":["SEC",[["SEP 5","Kent State","H"],["SEP 12","Towson","H"],["SEP 19","Mississippi State","H"],["SEP 26","Alabama","A"],["OCT 3","Kentucky","H"],["OCT 10","Florida","A"],["OCT 24","Tennessee","H"],["OCT 31","Oklahoma","A"],["NOV 7","Texas A&M","H"],["NOV 14","Arkansas","A"],["NOV 21","Georgia","H"],["NOV 28","Clemson","A"]]],"Tennessee":["SEC",[["SEP 5","Furman","H"],["SEP 12","Georgia Tech","A"],["SEP 19","Kennesaw State","H"],["SEP 26","Texas","H"],["OCT 3","Auburn","H"],["OCT 10","Arkansas","A"],["OCT 17","Alabama","H"],["OCT 24","South Carolina","A"],["NOV 7","Kentucky","H"],["NOV 14","Texas A&M","A"],["NOV 21","LSU","H"],["NOV 28","Vanderbilt","A"]]],"Texas":["SEC",[["SEP 5","Texas State","H"],["SEP 12","Ohio State","H"],["SEP 19","UTSA","H"],["SEP 26","Tennessee","A"],["OCT 10","Oklahoma","N"],["OCT 17","Florida","H"],["OCT 24","Ole Miss","H"],["OCT 31","Mississippi State","H"],["NOV 7","Missouri","A"],["NOV 14","LSU","A"],["NOV 21","Arkansas","H"],["NOV 27","Texas A&M","A"]]],"Texas A&M":["SEC",[["SEP 5","Missouri State","H"],["SEP 12","Arizona State","H"],["SEP 19","Kentucky","H"],["SEP 26","LSU","A"],["OCT 3","Arkansas","H"],["OCT 10","Missouri","A"],["OCT 17","The Citadel","H"],["OCT 24","Alabama","A"],["NOV 7","South Carolina","A"],["NOV 14","Tennessee","H"],["NOV 21","Oklahoma","A"],["NOV 27","Texas","H"]]],"Vanderbilt":["SEC",[["SEP 5","Austin Peay","H"],["SEP 12","Delaware","H"],["SEP 19","NC State","H"],["SEP 26","Auburn","A"],["OCT 3","Georgia","A"],["OCT 10","Ole Miss","H"],["OCT 17","Arkansas","H"],["OCT 24","Kentucky","A"],["NOV 7","Mississippi State","A"],["NOV 14","Alabama","H"],["NOV 21","Florida","A"],["NOV 28","Tennessee","H"]]],"Boston College":["ACC",[["SEP 5","Cincinnati","A"],["SEP 11","Rutgers","H"],["SEP 19","Maine","H"],["SEP 26","Virginia Tech","H"],["OCT 3","SMU","A"],["OCT 17","Pittsburgh","H"],["OCT 24","Georgia Tech","A"],["OCT 31","Duke","A"],["NOV 7","Florida State","H"],["NOV 14","Notre Dame","A"],["NOV 21","Syracuse","H"],["NOV 28","Miami","H"]]],"Cal":["ACC",[["SEP 5","UCLA","H"],["SEP 12","Syracuse","H"],["SEP 19","Wagner","H"],["SEP 25","Clemson","H"],["OCT 3","UNLV","A"],["OCT 10","Virginia Tech","H"],["OCT 17","Wake Forest","H"],["OCT 24","SMU","A"],["OCT 31","NC State","A"],["NOV 14","Virginia","A"],["NOV 21","Stanford","H"],["NOV 28","Pittsburgh","H"]]],"Clemson":["ACC",[["SEP 5","LSU","A"],["SEP 12","Georgia Southern","H"],["SEP 19","North Carolina","H"],["SEP 25","Cal","A"],["OCT 3","Miami","H"],["OCT 17","Charleston Southern","H"],["OCT 24","Virginia Tech","H"],["OCT 31","Florida State","A"],["NOV 7","Wake Forest","H"],["NOV 14","Georgia Tech","H"],["NOV 21","Duke","H"],["NOV 28","South Carolina","H"]]],"Duke":["ACC",[["SEP 5","Tulane","H"],["SEP 12","Illinois","A"],["SEP 19","Stanford","H"],["SEP 26","William & Mary","H"],["OCT 10","Georgia Tech","A"],["OCT 17","North Carolina","H"],["OCT 23","Virginia","A"],["OCT 31","Boston College","H"],["NOV 7","NC State","A"],["NOV 14","Miami","A"],["NOV 20","Clemson","H"],["NOV 28","Wake Forest","A"]]],"Florida State":["ACC",[["SEP 5","New Mexico State","H"],["SEP 12","North Carolina","A"],["SEP 19","Alabama","A"],["SEP 26","Louisville","A"],["OCT 3","NC State","H"],["OCT 10","Miami","H"],["OCT 24","SMU","H"],["OCT 31","Clemson","H"],["NOV 7","Boston College","A"],["NOV 14","Pittsburgh","A"],["NOV 21","Virginia","H"],["NOV 28","Florida","H"]]],"Georgia Tech":["ACC",[["SEP 5","Kennesaw State","H"],["SEP 12","Tennessee","H"],["SEP 19","Alcorn State","H"],["SEP 26","Wake Forest","A"],["OCT 3","Virginia","H"],["OCT 10","Duke","H"],["OCT 17","Louisville","H"],["OCT 24","Boston College","H"],["OCT 31","Virginia Tech","A"],["NOV 14","Clemson","A"],["NOV 21","NC State","H"],["NOV 28","Georgia","A"]]],"Louisville":["ACC",[["SEP 5","Ole Miss","N"],["SEP 12","Virginia","H"],["SEP 19","Eastern Kentucky","H"],["SEP 26","Florida State","H"],["OCT 3","NC State","A"],["OCT 10","North Carolina","H"],["OCT 17","Georgia Tech","A"],["OCT 24","Syracuse","A"],["OCT 31","SMU","H"],["NOV 7","Stanford","H"],["NOV 14","Wake Forest","H"],["NOV 28","Kentucky","A"]]],"Miami":["ACC",[["SEP 4","Bethune-Cookman","H"],["SEP 12","Notre Dame","A"],["SEP 19","South Florida","H"],["SEP 26","Pittsburgh","H"],["OCT 3","Clemson","A"],["OCT 10","Florida State","A"],["OCT 17","Stanford","H"],["OCT 24","North Carolina","H"],["NOV 7","Duke","H"],["NOV 14","Wake Forest","A"],["NOV 20","Virginia Tech","H"],["NOV 28","Boston College","A"]]],"NC State":["ACC",[["AUG 29","Virginia","N"],["SEP 12","UConn","H"],["SEP 19","East Carolina","H"],["SEP 26","Wake Forest","H"],["OCT 3","Florida State","A"],["OCT 10","Stanford","H"],["OCT 17","SMU","A"],["OCT 24","Duke","A"],["OCT 31","Cal","H"],["NOV 7","Louisville","H"],["NOV 21","Georgia Tech","A"],["NOV 28","North Carolina","H"]]],"North Carolina":["ACC",[["AUG 29","TCU","N"],["SEP 12","Florida State","H"],["SEP 19","Clemson","A"],["SEP 26","Duke","H"],["OCT 3","Syracuse","A"],["OCT 10","Louisville","A"],["OCT 17","Virginia","H"],["OCT 24","Miami","A"],["NOV 7","Pittsburgh","H"],["NOV 14","SMU","H"],["NOV 21","Virginia","A"],["NOV 28","NC State","A"]]],"Pittsburgh":["ACC",[["SEP 5","Youngstown State","H"],["SEP 12","UCF","H"],["SEP 17","Syracuse","H"],["SEP 26","Miami","A"],["OCT 3","Virginia Tech","H"],["OCT 10","Boston College","A"],["OCT 24","Wake Forest","H"],["NOV 7","North Carolina","A"],["NOV 14","Florida State","H"],["NOV 21","Virginia","H"],["NOV 28","Cal","A"]]],"SMU":["ACC",[["SEP 5","North Texas","H"],["SEP 12","Incarnate Word","H"],["SEP 19","Notre Dame","A"],["SEP 26","Stanford","H"],["OCT 3","Boston College","H"],["OCT 10","Syracuse","H"],["OCT 17","NC State","H"],["OCT 24","Cal","H"],["OCT 31","Louisville","A"],["NOV 14","Duke","H"],["NOV 21","Wake Forest","A"],["NOV 28","Stanford","A"]]],"Stanford":["ACC",[["AUG 29","Hawaii","H"],["SEP 12","Notre Dame","A"],["SEP 19","Sacramento State","H"],["SEP 26","SMU","A"],["OCT 3","Duke","A"],["OCT 10","NC State","A"],["OCT 17","Miami","A"],["OCT 24","Virginia Tech","H"],["OCT 31","Louisville","A"],["NOV 7","Louisville","A"],["NOV 21","Cal","A"],["NOV 28","SMU","H"]]],"Syracuse":["ACC",[["SEP 5","Colgate","H"],["SEP 12","Cal","A"],["SEP 17","Pittsburgh","A"],["SEP 26","Army","H"],["OCT 3","North Carolina","H"],["OCT 10","SMU","A"],["OCT 17","Virginia Tech","H"],["OCT 24","Louisville","H"],["NOV 7","Wake Forest","A"],["NOV 14","Virginia","H"],["NOV 21","Boston College","A"],["NOV 28","Notre Dame","H"]]],"Virginia":["ACC",[["AUG 29","NC State","N"],["SEP 11","Norfolk State","H"],["SEP 19","West Virginia","N"],["SEP 26","Delaware","H"],["OCT 3","Florida State","A"],["OCT 10","Syracuse","H"],["OCT 17","SMU","A"],["OCT 23","Duke","H"],["OCT 31","Wake Forest","A"],["NOV 14","Cal","H"],["NOV 21","North Carolina","H"],["NOV 28","Virginia Tech","A"]]],"Virginia Tech":["ACC",[["SEP 5","Old Dominion","H"],["SEP 12","Rhode Island","H"],["SEP 19","Maryland","A"],["SEP 26","Boston College","A"],["OCT 3","Pittsburgh","A"],["OCT 10","Cal","A"],["OCT 17","Syracuse","A"],["OCT 24","Clemson","A"],["OCT 31","Georgia Tech","H"],["NOV 7","Stanford","H"],["NOV 20","Miami","A"],["NOV 28","Virginia","A"]]],"Wake Forest":["ACC",[["SEP 5","Campbell","H"],["SEP 12","Purdue","A"],["SEP 19","Norfolk State","H"],["SEP 26","Virginia","H"],["OCT 3","Georgia Tech","H"],["OCT 10","North Carolina","A"],["OCT 17","Cal","A"],["OCT 24","Pittsburgh","A"],["NOV 7","Syracuse","H"],["NOV 14","Louisville","A"],["NOV 21","SMU","H"],["NOV 28","Duke","H"]]],"Arizona":["Big 12",[["SEP 5","Northern Arizona","H"],["SEP 12","BYU","A"],["SEP 19","Northern Illinois","H"],["SEP 26","Washington State","A"],["OCT 3","Cincinnati","H"],["OCT 10","West Virginia","A"],["OCT 24","Iowa State","H"],["OCT 31","Texas Tech","A"],["NOV 7","TCU","H"],["NOV 14","Utah","H"],["NOV 21","Kansas","H"],["NOV 28","Arizona State","A"]]],"Arizona State":["Big 12",[["SEP 5","Morgan State","H"],["SEP 12","Texas A&M","A"],["SEP 19","Kansas","N"],["OCT 3","Baylor","H"],["OCT 10","Hawaii","H"],["OCT 17","Texas Tech","A"],["OCT 24","Kansas State","H"],["OCT 31","BYU","A"],["NOV 7","Colorado","H"],["NOV 14","UCF","A"],["NOV 21","Oklahoma State","H"],["NOV 28","Arizona","H"]]],"Baylor":["Big 12",[["SEP 5","Auburn","N"],["SEP 12","Prairie View A&M","H"],["SEP 19","Louisiana Tech","H"],["SEP 26","Colorado","H"],["OCT 3","Arizona State","A"],["OCT 17","TCU","H"],["OCT 24","Kansas","A"],["OCT 31","UCF","A"],["NOV 7","Iowa State","H"],["NOV 14","BYU","A"],["NOV 21","Texas Tech","H"],["NOV 28","Houston","A"]]],"BYU":["Big 12",[["SEP 5","Southeast Missouri","H"],["SEP 12","Arizona","H"],["SEP 19","Stanford","A"],["SEP 26","Utah State","H"],["OCT 3","West Virginia","A"],["OCT 10","Kansas State","H"],["OCT 17","Notre Dame","H"],["OCT 31","Arizona State","H"],["NOV 7","Utah","A"],["NOV 14","Baylor","H"],["NOV 21","Houston","A"],["NOV 28","Oklahoma State","H"]]],"Cincinnati":["Big 12",[["SEP 5","Boston College","H"],["SEP 12","Pitt","A"],["SEP 19","Ball State","H"],["SEP 26","UCF","A"],["OCT 3","Arizona","A"],["OCT 10","Oklahoma State","H"],["OCT 17","Colorado","H"],["OCT 24","West Virginia","A"],["OCT 31","Iowa State","H"],["NOV 7","Kansas State","A"],["NOV 14","Houston","H"],["NOV 21","Utah","A"]]],"Colorado":["Big 12",[["SEP 5","UNLV","H"],["SEP 12","Georgia Tech","A"],["SEP 19","Northwestern","A"],["SEP 26","Baylor","A"],["OCT 3","Kansas State","H"],["OCT 10","Texas Tech","H"],["OCT 17","Cincinnati","A"],["OCT 24","UCF","H"],["NOV 7","Arizona State","A"],["NOV 14","Oklahoma State","H"],["NOV 21","West Virginia","H"],["NOV 28","Kansas","A"]]],"Houston":["Big 12",[["SEP 5","Rice","H"],["SEP 12","Sam Houston","H"],["SEP 19","Texas Tech","A"],["SEP 26","Kansas State","A"],["OCT 3","Utah","H"],["OCT 10","TCU","A"],["OCT 17","UCF","H"],["OCT 24","Oklahoma State","A"],["NOV 7","West Virginia","H"],["NOV 14","Cincinnati","A"],["NOV 21","BYU","H"],["NOV 28","Baylor","H"]]],"Iowa State":["Big 12",[["SEP 5","Northern Iowa","H"],["SEP 12","Iowa","A"],["SEP 19","Montana","H"],["SEP 26","TCU","H"],["OCT 3","Kansas","A"],["OCT 10","Kansas State","H"],["OCT 24","Arizona","A"],["OCT 31","Cincinnati","A"],["NOV 7","Baylor","A"],["NOV 14","Texas Tech","H"],["NOV 21","Oklahoma State","A"],["NOV 28","West Virginia","H"]]],"Kansas":["Big 12",[["SEP 5","Kent State","H"],["SEP 12","Missouri","H"],["SEP 19","Arizona State","N"],["SEP 26","Oklahoma State","H"],["OCT 3","Iowa State","H"],["OCT 10","Kansas State","A"],["OCT 24","Baylor","H"],["NOV 7","TCU","A"],["NOV 14","West Virginia","A"],["NOV 21","Arizona","A"],["NOV 28","Colorado","H"]]],"Kansas State":["Big 12",[["SEP 5","South Dakota","H"],["SEP 12","Tulane","H"],["SEP 19","Eastern Michigan","H"],["SEP 26","Houston","H"],["OCT 3","Colorado","A"],["OCT 10","Kansas","H"],["OCT 17","Iowa State","A"],["OCT 24","Arizona State","A"],["NOV 7","Cincinnati","H"],["NOV 14","UCF","H"],["NOV 21","TCU","A"],["NOV 28","Utah","H"]]],"Oklahoma State":["Big 12",[["SEP 5","Central Arkansas","H"],["SEP 12","Oregon","H"],["SEP 19","Tulsa","H"],["SEP 26","Kansas","A"],["OCT 3","TCU","H"],["OCT 10","Cincinnati","A"],["OCT 17","Utah","H"],["OCT 24","Houston","H"],["NOV 14","Texas Tech","H"],["NOV 21","Arizona State","A"],["NOV 28","BYU","A"]]],"TCU":["Big 12",[["AUG 29","North Carolina","N"],["SEP 12","SMU","H"],["SEP 19","Louisiana","H"],["SEP 26","Iowa State","A"],["OCT 3","Oklahoma State","A"],["OCT 10","Houston","H"],["OCT 17","Baylor","A"],["NOV 7","Kansas","H"],["NOV 14","Utah","A"],["NOV 21","Kansas State","H"],["NOV 28","Texas Tech","A"]]],"Texas Tech":["Big 12",[["SEP 5","Abilene Christian","H"],["SEP 12","Oregon State","A"],["SEP 19","Houston","H"],["SEP 26","Sam Houston","H"],["OCT 3","UCF","A"],["OCT 10","Colorado","A"],["OCT 17","Arizona State","H"],["OCT 31","Arizona","H"],["NOV 14","Oklahoma State","A"],["NOV 14","Iowa State","A"],["NOV 21","Baylor","A"],["NOV 28","TCU","H"]]],"UCF":["Big 12",[["SEP 5","Bethune-Cookman","H"],["SEP 12","Pittsburgh","A"],["SEP 19","Mercer","H"],["SEP 26","Cincinnati","H"],["OCT 3","Texas Tech","H"],["OCT 17","Houston","A"],["OCT 24","Colorado","A"],["OCT 31","Baylor","H"],["NOV 7","West Virginia","A"],["NOV 14","Arizona State","H"],["NOV 14","Kansas State","A"],["NOV 21","Iowa State","H"]]],"Utah":["Big 12",[["SEP 5","Weber State","H"],["SEP 12","Arkansas","H"],["SEP 19","San Jose State","H"],["SEP 26","Oregon State","A"],["OCT 3","Houston","A"],["OCT 10","West Virginia","H"],["OCT 17","Oklahoma State","A"],["NOV 7","BYU","H"],["NOV 14","Arizona","A"],["NOV 14","TCU","H"],["NOV 21","Cincinnati","H"],["NOV 28","Kansas State","A"]]],"West Virginia":["Big 12",[["SEP 5","FIU","H"],["SEP 12","Virginia","N"],["SEP 19","Coastal Carolina","H"],["SEP 26","Georgia Tech","H"],["OCT 3","BYU","H"],["OCT 10","Arizona","H"],["OCT 24","Cincinnati","H"],["NOV 7","Houston","A"],["NOV 14","Kansas","H"],["NOV 21","Colorado","A"],["NOV 28","Iowa State","A"]]]};

// Build structured data from compact format
const ALL_TEAMS: Record<string, TeamInfo> = {};
const CONFERENCES: Record<string, string[]> = {};

for (const [name, [conf, games]] of Object.entries(RAW)) {
  const locMap: Record<string, "HOME" | "AWAY" | "NEUTRAL"> = { H: "HOME", A: "AWAY", N: "NEUTRAL" };
  ALL_TEAMS[name] = {
    conference: conf,
    schedule: games.map((g, i) => ({
      week: i + 1,
      date: g[0],
      opponent: g[1],
      loc: locMap[g[2]] || "HOME",
      venue: g[2] === "A" ? "Away" : g[2] === "N" ? "Neutral Site" : "Home",
    })),
  };
  if (!CONFERENCES[conf]) CONFERENCES[conf] = [];
  if (!CONFERENCES[conf].includes(name)) CONFERENCES[conf].push(name);
}

// The original compact schedules were assembled from team-by-team sources and
// contained duplicate and one-sided conference matchups. Normalize ACC and Big
// 12 league slates from the conferences' official 2026 opponent matrices so a
// matchup exists exactly once on each team's schedule.
const OFFICIAL_CONFERENCE_HOME_GAMES: Record<string, Record<string, string[]>> = {
  ACC: {
    "Boston College": ["Florida State", "Pittsburgh", "Syracuse", "Virginia Tech"],
    Cal: ["Clemson", "Pittsburgh", "Stanford", "Virginia Tech", "Wake Forest"],
    Clemson: ["Georgia Tech", "Miami", "North Carolina", "Virginia Tech"],
    Duke: ["Boston College", "Clemson", "North Carolina", "Stanford"],
    "Florida State": ["Clemson", "NC State", "SMU", "Virginia"],
    "Georgia Tech": ["Boston College", "Duke", "Louisville", "Wake Forest"],
    Louisville: ["Florida State", "Pittsburgh", "SMU", "Stanford", "Wake Forest"],
    Miami: ["Boston College", "Duke", "Florida State", "Pittsburgh", "Virginia Tech"],
    "NC State": ["Cal", "Duke", "Louisville", "Syracuse", "Wake Forest"],
    "North Carolina": ["Louisville", "Miami", "NC State", "Syracuse"],
    Pittsburgh: ["Florida State", "Georgia Tech", "North Carolina", "Syracuse"],
    SMU: ["Boston College", "Cal", "Virginia", "Virginia Tech", "Wake Forest"],
    Stanford: ["Georgia Tech", "Miami", "NC State", "SMU"],
    Syracuse: ["Cal", "Clemson", "Louisville", "SMU"],
    Virginia: ["Cal", "Duke", "North Carolina", "NC State", "Syracuse"],
    "Virginia Tech": ["Georgia Tech", "Pittsburgh", "Stanford", "Virginia"],
    "Wake Forest": ["Duke", "Miami", "Stanford", "Virginia"],
  },
  "Big 12": {
    Arizona: ["Cincinnati", "Iowa State", "TCU", "Utah", "Arizona State"],
    "Arizona State": ["Kansas", "Baylor", "Kansas State", "Colorado", "Oklahoma State"],
    Baylor: ["Colorado", "TCU", "Iowa State", "Texas Tech"],
    BYU: ["Arizona", "Iowa State", "Arizona State", "Baylor", "Cincinnati"],
    Cincinnati: ["Kansas State", "Texas Tech", "Utah", "Colorado"],
    Colorado: ["Texas Tech", "Utah", "Kansas State", "Houston", "UCF"],
    Houston: ["UCF", "Oklahoma State", "Cincinnati", "Baylor"],
    "Iowa State": ["Utah", "West Virginia", "Oklahoma State", "Cincinnati", "Kansas State"],
    Kansas: ["Baylor", "UCF", "BYU"],
    "Kansas State": ["Houston", "Kansas", "Oklahoma State", "Arizona"],
    "Oklahoma State": ["UCF", "Colorado", "Texas Tech", "Kansas"],
    TCU: ["BYU", "West Virginia", "Kansas", "Kansas State", "Utah"],
    "Texas Tech": ["Houston", "Arizona State", "Arizona", "West Virginia", "TCU"],
    UCF: ["TCU", "BYU", "Baylor", "Arizona State", "Iowa State"],
    Utah: ["Kansas", "Houston", "BYU", "West Virginia"],
    "West Virginia": ["Oklahoma State", "Arizona", "Cincinnati", "Kansas", "Houston"],
  },
};

const OFFICIAL_NEUTRAL_GAMES = new Set([
  ["Arizona State", "Kansas"].sort().join("|"),
]);

function normalizeConferenceSchedule(
  conference: string,
  homeGames: Record<string, string[]>
) {
  const teams = Object.keys(homeGames);
  const teamSet = new Set(teams);
  const oldSchedules = new Map(
    teams.map((team) => [team, ALL_TEAMS[team].schedule])
  );
  const normalized = new Map(
    teams.map((team) => [
      team,
      ALL_TEAMS[team].schedule.filter(
        (game) => !teamSet.has(game.opponent)
      ),
    ])
  );

  for (const [homeTeam, opponents] of Object.entries(homeGames)) {
    for (const awayTeam of opponents) {
      const matchupId = [homeTeam, awayTeam].sort().join("|");
      const prior =
        oldSchedules.get(homeTeam)?.find((game) => game.opponent === awayTeam) ||
        oldSchedules.get(awayTeam)?.find((game) => game.opponent === homeTeam);
      const date = prior?.date || "TBD";
      const neutral = OFFICIAL_NEUTRAL_GAMES.has(matchupId);

      normalized.get(homeTeam)!.push({
        week: 0,
        date,
        opponent: awayTeam,
        loc: neutral ? "NEUTRAL" : "HOME",
        venue: neutral ? "Neutral Site" : "Home",
      });
      normalized.get(awayTeam)!.push({
        week: 0,
        date,
        opponent: homeTeam,
        loc: neutral ? "NEUTRAL" : "AWAY",
        venue: neutral ? "Neutral Site" : "Away",
      });
    }
  }

  for (const team of teams) {
    ALL_TEAMS[team].schedule = normalized
      .get(team)!
      .map((game, index) => ({ ...game, week: index + 1 }));
  }
}

for (const [conference, homeGames] of Object.entries(
  OFFICIAL_CONFERENCE_HOME_GAMES
)) {
  normalizeConferenceSchedule(conference, homeGames);
}

// Complete Big 12 schedules published by the conference:
// https://big12sports.com/news/2026/1/21/big-12-conference-announces-2026-football-schedule.aspx
// These replace the earlier mixed-source schedules and remove runtime TBD dates.
const OFFICIAL_BIG12_SCHEDULES: Record<string, [string, string, string][]> = {
  Arizona: [["SEP 5","Northern Arizona","H"],["SEP 12","BYU","A"],["SEP 19","Northern Illinois","H"],["SEP 26","Washington State","A"],["OCT 3","Cincinnati","H"],["OCT 10","West Virginia","A"],["OCT 24","Iowa State","H"],["OCT 31","Texas Tech","A"],["NOV 6","TCU","H"],["NOV 14","Utah","H"],["NOV 21","Kansas State","A"],["NOV 28","Arizona State","H"]],
  "Arizona State": [["SEP 5","Morgan State","H"],["SEP 12","Texas A&M","A"],["SEP 19","Kansas","N"],["OCT 3","Baylor","H"],["OCT 10","Hawaii","H"],["OCT 17","Texas Tech","A"],["OCT 24","Kansas State","H"],["OCT 31","BYU","A"],["NOV 7","Colorado","H"],["NOV 14","UCF","A"],["NOV 21","Oklahoma State","H"],["NOV 28","Arizona","A"]],
  Baylor: [["SEP 5","Auburn","N"],["SEP 12","Prairie View A&M","H"],["SEP 19","Louisiana Tech","H"],["SEP 26","Colorado","H"],["OCT 3","Arizona State","A"],["OCT 17","TCU","H"],["OCT 24","Kansas","A"],["OCT 30","UCF","A"],["NOV 7","Iowa State","H"],["NOV 14","BYU","A"],["NOV 21","Texas Tech","H"],["NOV 28","Houston","A"]],
  BYU: [["SEP 5","Utah Tech","H"],["SEP 12","Arizona","H"],["SEP 19","Colorado State","A"],["OCT 3","TCU","A"],["OCT 9","Iowa State","H"],["OCT 17","Notre Dame","H"],["OCT 24","UCF","A"],["OCT 31","Arizona State","H"],["NOV 7","Utah","A"],["NOV 14","Baylor","H"],["NOV 21","Kansas","A"],["NOV 28","Cincinnati","H"]],
  Cincinnati: [["SEP 5","Boston College","H"],["SEP 12","Western Carolina","H"],["SEP 19","Miami (OH)","H"],["SEP 26","Kansas State","H"],["OCT 3","Arizona","A"],["OCT 17","West Virginia","A"],["OCT 24","Texas Tech","H"],["OCT 31","Utah","H"],["NOV 7","Houston","A"],["NOV 14","Iowa State","A"],["NOV 21","Colorado","H"],["NOV 28","BYU","A"]],
  Colorado: [["SEP 3","Georgia Tech","A"],["SEP 12","Weber State","H"],["SEP 19","Northwestern","A"],["SEP 26","Baylor","A"],["OCT 3","Texas Tech","H"],["OCT 17","Utah","H"],["OCT 24","Oklahoma State","A"],["OCT 31","Kansas State","H"],["NOV 7","Arizona State","A"],["NOV 13","Houston","H"],["NOV 21","Cincinnati","A"],["NOV 28","UCF","H"]],
  Houston: [["SEP 5","Oregon State","H"],["SEP 12","Southern","H"],["SEP 18","Texas Tech","A"],["SEP 26","Georgia Southern","A"],["OCT 3","UCF","H"],["OCT 10","Kansas State","A"],["OCT 17","Oklahoma State","H"],["OCT 24","Utah","A"],["NOV 7","Cincinnati","H"],["NOV 13","Colorado","A"],["NOV 21","West Virginia","A"],["NOV 28","Baylor","H"]],
  "Iowa State": [["SEP 5","Southeast Missouri","H"],["SEP 12","Iowa","A"],["SEP 19","Bowling Green","H"],["SEP 26","Utah","H"],["OCT 3","West Virginia","H"],["OCT 9","BYU","A"],["OCT 24","Arizona","A"],["OCT 31","Oklahoma State","H"],["NOV 7","Baylor","A"],["NOV 14","Cincinnati","H"],["NOV 20","UCF","A"],["NOV 28","Kansas State","H"]],
  Kansas: [["SEP 4","LIU","H"],["SEP 11","Missouri","H"],["SEP 19","Arizona State","N"],["OCT 3","Middle Tennessee","H"],["OCT 10","Utah","A"],["OCT 17","Kansas State","A"],["OCT 24","Baylor","H"],["OCT 31","TCU","A"],["NOV 7","UCF","H"],["NOV 14","West Virginia","A"],["NOV 21","BYU","H"],["NOV 28","Oklahoma State","A"]],
  "Kansas State": [["SEP 5","Nicholls","H"],["SEP 12","Washington State","H"],["SEP 19","Tulane","H"],["SEP 26","Cincinnati","A"],["OCT 10","Houston","H"],["OCT 17","Kansas","H"],["OCT 24","Arizona State","A"],["OCT 31","Colorado","A"],["NOV 7","Oklahoma State","H"],["NOV 14","TCU","A"],["NOV 21","Arizona","H"],["NOV 28","Iowa State","A"]],
  "Oklahoma State": [["SEP 5","Tulsa","A"],["SEP 12","Oregon","H"],["SEP 19","Murray State","H"],["SEP 26","West Virginia","A"],["OCT 10","UCF","H"],["OCT 17","Houston","A"],["OCT 24","Colorado","H"],["OCT 31","Iowa State","A"],["NOV 7","Kansas State","A"],["NOV 14","Texas Tech","H"],["NOV 21","Arizona State","A"],["NOV 28","Kansas","H"]],
  TCU: [["AUG 29","North Carolina","N"],["SEP 12","Grambling State","H"],["SEP 19","Arkansas State","H"],["SEP 26","UCF","A"],["OCT 3","BYU","H"],["OCT 17","Baylor","A"],["OCT 24","West Virginia","H"],["OCT 31","Kansas","H"],["NOV 6","Arizona","A"],["NOV 14","Kansas State","H"],["NOV 21","Utah","H"],["NOV 26","Texas Tech","A"]],
  "Texas Tech": [["SEP 5","Abilene Christian","H"],["SEP 12","Oregon State","A"],["SEP 18","Houston","H"],["SEP 26","Sam Houston","H"],["OCT 3","Colorado","A"],["OCT 17","Arizona State","H"],["OCT 24","Cincinnati","A"],["OCT 31","Arizona","H"],["NOV 7","West Virginia","H"],["NOV 14","Oklahoma State","A"],["NOV 21","Baylor","A"],["NOV 26","TCU","H"]],
  UCF: [["SEP 3","Bethune-Cookman","H"],["SEP 12","Pittsburgh","A"],["SEP 19","Georgia State","H"],["SEP 26","TCU","H"],["OCT 3","Houston","A"],["OCT 10","Oklahoma State","A"],["OCT 24","BYU","H"],["OCT 30","Baylor","H"],["NOV 7","Kansas","A"],["NOV 14","Arizona State","H"],["NOV 20","Iowa State","H"],["NOV 28","Colorado","A"]],
  Utah: [["SEP 3","Idaho","H"],["SEP 12","Arkansas","H"],["SEP 19","Utah State","H"],["SEP 26","Iowa State","A"],["OCT 10","Kansas","H"],["OCT 17","Colorado","A"],["OCT 24","Houston","H"],["OCT 31","Cincinnati","A"],["NOV 7","BYU","H"],["NOV 14","Arizona","A"],["NOV 21","TCU","A"],["NOV 27","West Virginia","H"]],
  "West Virginia": [["SEP 5","Coastal Carolina","H"],["SEP 12","UT Martin","H"],["SEP 19","Virginia","N"],["SEP 26","Oklahoma State","H"],["OCT 3","Iowa State","A"],["OCT 10","Arizona","H"],["OCT 17","Cincinnati","H"],["OCT 24","TCU","A"],["NOV 7","Texas Tech","A"],["NOV 14","Kansas","H"],["NOV 21","Houston","H"],["NOV 27","Utah","A"]],
};

for (const [team, games] of Object.entries(OFFICIAL_BIG12_SCHEDULES)) {
  ALL_TEAMS[team].schedule = games.map(([date, opponent, loc], index) => ({
    week: index + 1,
    date,
    opponent,
    loc: locMap[loc] || "HOME",
    venue: loc === "A" ? "Away" : loc === "N" ? "Neutral Site" : "Home",
  }));
}

// Sort conference lists
for (const c of Object.keys(CONFERENCES)) {
  CONFERENCES[c].sort();
}

export { ALL_TEAMS, CONFERENCES };

// Keep original SCHEDULE export for backward compat (Nebraska)
export const SCHEDULE: Game[] = ALL_TEAMS["Nebraska"]?.schedule || [];

export function getTeamSchedule(teamName: string): Game[] {
  return ALL_TEAMS[teamName]?.schedule || [];
}

export function getTeamConference(teamName: string): string {
  return ALL_TEAMS[teamName]?.conference || "";
}

export function isConferenceGame(opponent: string, teamName: string = "Nebraska"): boolean {
  const teamConf = ALL_TEAMS[teamName]?.conference;
  if (!teamConf) return false;
  const oppConf = ALL_TEAMS[opponent]?.conference;
  return oppConf === teamConf;
}

// Probability of finishing with exactly k wins, given per-game win probabilities
export function computeDistribution(probs: number[]): number[] {
  const n = probs.length;
  let dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 0; i < n; i++) {
    const p = probs[i];
    const newDp = new Array(n + 1).fill(0);
    for (let k = 0; k <= i + 1; k++) {
      if (k > 0) newDp[k] += dp[k - 1] * p;
      newDp[k] += dp[k] * (1 - p);
    }
    dp = newDp;
  }
  return dp;
}

// Spread math (unchanged)
function winPctToFairSpread(winPct: number): number {
  if (winPct <= 0 || winPct >= 100) return winPct <= 0 ? 50 : -50;
  const p = winPct / 100;
  const logit = Math.log(p / (1 - p));
  return -logit * 8.0;
}

export function getImpliedSpread(winPct: number, isHome: boolean): number | null {
  if (isNaN(winPct) || winPct < 0 || winPct > 100) return null;
  const neutralSpread = winPctToFairSpread(winPct);
  const HFA = 2.75;
  return isHome ? neutralSpread - HFA : neutralSpread + HFA;
}

export function formatSpread(spread: number | null, teamName: string = "NEB"): string {
  if (spread === null) return "—";
  const abs = Math.abs(spread);
  if (abs < 0.5) return "Pick'em";
  const rounded = Math.round(abs * 2) / 2;
  // Use last word of team name as abbreviation
  const abbr = teamName.split(" ").pop()?.toUpperCase().slice(0, 4) || "TEAM";
  if (spread < 0) return `${abbr} -${rounded.toFixed(1)}`;
  return `OPP -${rounded.toFixed(1)}`;
}

export type SpreadSentiment = "positive" | "negative" | "neutral" | "none";

export function getSpreadSentiment(spread: number | null): SpreadSentiment {
  if (spread === null) return "none";
  if (Math.abs(spread) < 0.5) return "neutral";
  if (spread < 0) return "positive";
  return "negative";
}


// Resolve a predicted winner from a team's probability. At exactly 50%,
// home-field advantage supplies the default favorite; neutral games remain open.
export function getProjectedWinner(
  teamName: string,
  game: Game,
  winPct: string | number
): string | null {
  const probability =
    typeof winPct === "number" ? winPct : Number.parseFloat(winPct);
  if (!Number.isFinite(probability) || probability < 0 || probability > 100) {
    return null;
  }
  if (probability > 50) return teamName;
  if (probability < 50) return game.opponent;
  if (game.loc === "HOME") return teamName;
  if (game.loc === "AWAY") return game.opponent;
  return null;
}
