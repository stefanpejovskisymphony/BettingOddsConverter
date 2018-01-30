var odds = require("odds-converter");

$("#resetOdds").click(function() {
	$(':input').val('');
});

function addingOdds(odd1, odd2, odd3){

	var allOdds = [], ukOdds=[], euOdds=[], usaOdds=[];

		ukOdds.push(odd1);
		euOdds.push(odd2);
		usaOdds.push(odd3);

	    allOdds = { ukOdds: ukOdds, euOdds: euOdds, usaOdds : usaOdds };

		$.ajax({
			method: "POST",
			url: "http://localhost:9000/data.php",
			data: { data : allOdds }
		})
		.done(function() {
			//console.log("Data successfully saved");
		});
}

$("#ukOdds").change(function() {
	var ukOdd = $('#ukOdds').val();
	var fields = ukOdd.split('/');
    var x = parseInt(fields[0]);
    var y = parseInt(fields[1]);
	var resultUKtoUE = odds.fraction.toDecimal(x,y);
	$("#euOdds").val(resultUKtoUE);
	var resultUKtoUSA = odds.fraction.toAmerican(x,y);
	$("#usaOdds").val(resultUKtoUSA); 

	addingOdds(ukOdd, resultUKtoUE, resultUKtoUSA);

});
 
$("#euOdds").change(function() {
	var euOdd  = parseFloat($('#euOdds').val());
	var resultEUtoUK = new Fraction(euOdd).toString();
	var res = resultEUtoUK.slice(1, 8);
	$("#ukOdds").val(res);
	var resultEUtoUSA = odds.decimal.toAmerican(euOdd);
	$("#usaOdds").val(resultEUtoUSA); 

	addingOdds(res, euOdd, resultEUtoUSA);
});   

$("#usaOdds").change(function() {
	var usaOdd = $('#usaOdds').val();
	var resultUSAtoUK = odds.american.toFractional(usaOdd).simplify();
	var pom = resultUSAtoUK.toString();
    var result = pom.slice(1, -1);
	$("#ukOdds").val(result);
	var resultUSAtoEU = odds.american.toDecimal(usaOdd);
	$("#euOdds").val(resultUSAtoEU);
    
	addingOdds(result, resultUSAtoEU, usaOdd);
});

$(document).ready(function(){
     $('[data-toggle="tooltip"]').tooltip(); 
});


