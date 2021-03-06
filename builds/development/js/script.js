(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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



Fraction = function(numerator, denominator)
{
    /* double argument invocation */
    if (numerator && denominator) {
        if (typeof(numerator) === 'number' && typeof(denominator) === 'number') {
            this.numerator = numerator;
            this.denominator = denominator;
        } else if (typeof(numerator) === 'string' && typeof(denominator) === 'string') {
            // what are they?
            // hmm....
            // assume they are ints?
            this.numerator = parseInt(numerator);
            this.denominator = parseInt(denominator);
        }
    /* single-argument invocation */
    } else if (!denominator) {
        num = numerator; // swap variable names for legibility
        if (typeof(num) === 'number') {  // just a straight number init
            this.numerator = num;
            this.denominator = 1;
        } else if (typeof(num) === 'string') {
            var a, b;  // hold the first and second part of the fraction, e.g. a = '1' and b = '2/3' in 1 2/3
                       // or a = '2/3' and b = undefined if we are just passed a single-part number
            [a, b] = num.split(' ');
            /* compound fraction e.g. 'A B/C' */
            //  if a is an integer ...
            if (a % 1 === 0 && b && b.match('/')) {
                return (new Fraction(a)).add(new Fraction(b));
            } else if (a && !b) {
                /* simple fraction e.g. 'A/B' */
                if (typeof(a) === 'string' && a.match('/')) {
                    // it's not a whole number... it's actually a fraction without a whole part written
                    var f = a.split('/');
                    this.numerator = f[0]; this.denominator = f[1];
                /* string floating point */
                } else if (typeof(a) === 'string' && a.match('\.')) {
                    return new Fraction(parseFloat(a));
                /* whole number e.g. 'A' */
                } else { // just passed a whole number as a string
                    this.numerator = parseInt(a);
                    this.denominator = 1;
                }
            } else {
                return undefined; // could not parse
            }
        }
    }
    this.normalize();
}


Fraction.prototype.clone = function()
{
    return new Fraction(this.numerator, this.denominator);
}


/* pretty-printer, converts fractions into whole numbers and fractions */
Fraction.prototype.toString = function()
{
    var wholepart = Math.floor(this.numerator / this.denominator);
    var numerator = this.numerator % this.denominator 
    var denominator = this.denominator;
    var result = [];
    if (wholepart != 0) 
        result.push(wholepart);
    if (numerator != 0)  
        result.push(numerator + '/' + denominator);
    return result.length > 0 ? result.join(' ') : 0;
}


/* destructively rescale the fraction by some integral factor */
Fraction.prototype.rescale = function(factor)
{
    this.numerator *= factor;
    this.denominator *= factor;
    return this;
}


Fraction.prototype.add = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction) {
        b = b.clone();
    } else {
        b = new Fraction(b);
    }
    td = a.denominator;
    a.rescale(b.denominator);
    b.rescale(td);

    a.numerator += b.numerator;

    return a.normalize();
}


Fraction.prototype.subtract = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction) {
        b = b.clone();  // we scale our argument destructively, so clone
    } else {
        b = new Fraction(b);
    }
    td = a.denominator;
    a.rescale(b.denominator);
    b.rescale(td);

    a.numerator -= b.numerator;

    return a.normalize();
}


Fraction.prototype.multiply = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction)
    {
        a.numerator *= b.numerator;
        a.denominator *= b.denominator;
    } else if (typeof b === 'number') {
        a.numerator *= b;
    } else {
        return a.multiply(new Fraction(b));
    }
    return a.normalize();
}

Fraction.prototype.divide = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction)
    {
        a.numerator *= b.denominator;
        a.denominator *= b.numerator;
    } else if (typeof b === 'number') {
        a.denominator *= b;
    } else {
        return a.divide(new Fraction(b));
    }
    return a.normalize();
}

Fraction.prototype.equals = function(b)
{
    if (!(b instanceof Fraction)) {
        b = new Fraction(b);
    }
    // fractions that are equal should have equal normalized forms
    var a = this.clone().normalize();
    var b = b.clone().normalize();
    return (a.numerator === b.numerator && a.denominator === b.denominator);
}


/* Utility functions */

/* Destructively normalize the fraction to its smallest representation. 
 * e.g. 4/16 -> 1/4, 14/28 -> 1/2, etc.
 * This is called after all math ops.
 */
Fraction.prototype.normalize = (function()
{

    var isFloat = function(n)
    {
        return (typeof(n) === 'number' && 
                ((n > 0 && n % 1 > 0 && n % 1 < 1) || 
                 (n < 0 && n % -1 < 0 && n % -1 > -1))
               );
    }

    var roundToPlaces = function(n, places) 
    {
        if (!places) {
            return Math.round(n);
        } else {
            var scalar = Math.pow(10, places);
            return Math.round(n*scalar)/scalar;
        }
    }
        
    return (function() {

        // XXX hackish.  Is there a better way to address this issue?
        //
        /* first check if we have decimals, and if we do eliminate them
         * multiply by the 10 ^ number of decimal places in the number
         * round the number to nine decimal places
         * to avoid js floating point funnies
         */
        if (isFloat(this.denominator)) {
            var rounded = roundToPlaces(this.denominator, 9);
            var scaleup = Math.pow(10, rounded.toString().split('.')[1].length);
            this.denominator = Math.round(this.denominator * scaleup); // this !!! should be a whole number
            //this.numerator *= scaleup;
            this.numerator *= scaleup;
        } 
        if (isFloat(this.numerator)) {
            var rounded = roundToPlaces(this.numerator, 9);
            var scaleup = Math.pow(10, rounded.toString().split('.')[1].length);
            this.numerator = Math.round(this.numerator * scaleup); // this !!! should be a whole number
            //this.numerator *= scaleup;
            this.denominator *= scaleup;
        }
        var gcf = Fraction.gcf(this.numerator, this.denominator);
        this.numerator /= gcf;
        this.denominator /= gcf;
        if ((this.numerator < 0 && this.denominator < 0) || (this.numerator > 0 && this.denominator < 0)) {
            this.numerator *= -1;
            this.denominator *= -1;
        }
        return this;
    });

})();


/* Takes two numbers and returns their greatest common factor.
 */
Fraction.gcf = function(a, b)
{

    var common_factors = [];
    var fa = Fraction.primeFactors(a);
    var fb = Fraction.primeFactors(b);
    // for each factor in fa
    // if it's also in fb
    // put it into the common factors
    fa.forEach(function (factor) 
    { 
        var i = fb.indexOf(factor);
        if (i >= 0) {
            common_factors.push(factor);
            fb.splice(i,1); // remove from fb
        }
    });

    if (common_factors.length === 0)
        return 1;

    var gcf = (function() {
        var r = common_factors[0];
        var i;
        for (i=1;i<common_factors.length;i++)
        {
            r = r * common_factors[i];
        }
        return r;
    })();

    return gcf;

};


// Adapted from: 
// http://www.btinternet.com/~se16/js/factor.htm
Fraction.primeFactors = function(n) 
{

    var num = Math.abs(n);
    var factors = [];
    var _factor = 2;  // first potential prime factor

    while (_factor * _factor <= num)  // should we keep looking for factors?
    {      
      if (num % _factor === 0)  // this is a factor
        { 
            factors.push(_factor);  // so keep it
            num = num/_factor;  // and divide our search point by it
        }
        else
        {
            _factor++;  // and increment
        }
    }

    if (num != 1)                    // If there is anything left at the end...
    {                                // ...this must be the last prime factor
        factors.push(num);           //    so it too should be recorded
    }

    return factors;                  // Return the prime factors
}

},{"odds-converter":3}],2:[function(require,module,exports){
/**
 * fractional-arithmetic.js is a javascript library for doing fractional arithmetic
 * Author: Alexandros Georgiou <alex.georgiou@gmail.com>
 * 
 */

var isInteger = function(i) {
	return !isNaN( i ) && ( parseInt( i ) == parseFloat( i ) );
};

module.exports.isInteger = isInteger;

var gcd = function( a, b) {
    a = Math.abs( a );
    b = Math.abs( b );
    var temp;
    while ( b > 0 ) {
        temp = b;
        b = a % b;
        a = temp;
    }
    return a;
};

module.exports.gcd = gcd;

var lcm = function( a, b ) {
    a = Math.abs( a );
    b = Math.abs( b );
    return a * ( b / gcd( a, b ) );
};
module.exports.lcm = lcm;

function NotAFractionError(message) {
    this.name = 'NotAFractionError';
    this.message = message || 'Not a Fraction';
}

NotAFractionError.prototype = new Error();
NotAFractionError.prototype.constructor = NotAFractionError;

function Fraction( n, d ) {
	
	if ( typeof(n) === 'undefined' )
		throw new NotAFractionError( 'You must specify a fraction' );
	
	// create without new keyword
	if ( ! ( this instanceof Fraction ) ) {
		return new Fraction( n, d );
	}
	
	// create from fraction
	if ( n instanceof Fraction && typeof(d) === 'undefined' ) {
		this.n = n.n;
		this.d = n.d;
		return;
	}
	
	//create from integers
	if ( isInteger(n) && isInteger(d)) {
		this.n = parseInt(n);
		this.d = parseInt(d);
		return;
	}
	
	//create from one integer
	if ( isInteger(n) && typeof(d) === 'undefined') {
		this.n = parseInt(n);
		this.d = 1;
		return;
	}
	
	
	if ( typeof(n) === 'number' ) {
		var ns = '' + n;
		var decimals = ns.length - ns.indexOf( '.' ) - 1;
		this.n = parseInt( ns.replace( '.', '' ) );
		this.d = Math.pow( 10, decimals );
		return;
	}
	
	throw new NotAFractionError(
		'Cannot instantiate Fraction(' + n + ( typeof(d) === 'undefined' ? '' : d ) + ')'
	);
}

Fraction.prototype.toString = Fraction.prototype.toS = Fraction.prototype.inspect = function() {
	return '(' + this.n + '/' + this.d + ')';
};

Fraction.prototype.toNumber = function () {
	return this.n / this.d;
};

Fraction.prototype.toLatex = function() {
	return '\\frac{' + this.n + '}{' + this.d + '}';
};

Fraction.prototype.toMathML = function() {
	return '<mfrac><mn>' + this.n + '</mn><mn>' + this.d + '</mfrac>';
};

Fraction.prototype.simplify = function() {
    if ( this.d < 0 ) {
        this.n *= -1;
        this.d *= -1;
    }
	var g = gcd( this.n, this.d );
	return g == 1 ? this : new Fraction( this.n / g, this.d / g);
};

Fraction.prototype.inverse = function() {
	return new Fraction( this.d, this.n );
};

Fraction.prototype.times = Fraction.prototype.multiply = function( n, d ) {
	
	if ( n instanceof Fraction && typeof(d) === 'undefined' ) {
		return new Fraction( this.n * n.n, this.d * n.d ).simplify();
	} else if ( isInteger(n) && isInteger(d) ) {
		return this.times( new Fraction( n, d ) );
	}
	throw new NotAFractionError('Cannot multiply ' + this + ' with n=' + n + ', d=' + d );
};

Fraction.prototype.dividedBy = Fraction.prototype.div = function( n, d ) {
	
	if ( n instanceof Fraction && typeof(d) === 'undefined' ) {
		return n.inverse().times( this );
	} else if ( isInteger(n) && isInteger(d) ) {
		return this.times( new Fraction( d, n ) );
	}
	throw new NotAFractionError('Cannot divide '+this+' by n='+n+', d='+d);
};

Fraction.prototype.plus = function( n, d ) {
	
	if ( n instanceof Fraction && typeof(d) === 'undefined') {
		var l = lcm( this.d, n.d );
		return new Fraction( this.n * l / this.d + n.n * l / n.d, l );
	} else if ( isInteger(n) && isInteger(d) ) {
		return this.plus( new Fraction(n,d) );
	}
	throw new NotAFractionError( 'Cannot add ' + this + ' to n=' + n + ', d=' + d );
};

Fraction.prototype.minus = function( n, d ) {
	
	if ( n instanceof Fraction && typeof(d) === 'undefined' ) {
		var l = lcm(this.d,n.d);
		return new Fraction( this.n * l / this.d - n.n * l / n.d, l);
	} else if (isInteger(n) && isInteger(d)) {
		return this.minus( new Fraction(n,d) );
	}
	throw new NotAFractionError( 'Cannot add ' + this + ' to n=' + n + ', d=' + d);
};

module.exports.Fraction = Fraction;

},{}],3:[function(require,module,exports){
var Fraction = require('fractional-arithmetic').Fraction;
var OddsConverter = OddsConverter || {};

OddsConverter.decimal = {
    toAmerican: function(decimal){
        decimal < 2.0 ? moneyline = ( (-100)/(decimal - 1) ).toPrecision(5) : moneyline = ( (decimal - 1) * 100 ).toPrecision(5);
        return moneyline;
    },
    toFractional: function(decimal){
        fraction = Fraction((decimal - 1));
        return fraction;
    }
}
OddsConverter.fraction = {
    toAmerican: function(n,d){
        n > d ? moneyline = ((n/d) * 100) : moneyline = (-100)/(n/d);
        return moneyline;
    },
    toDecimal: function(n,d){
        return decimal = (n/d) + 1;
    }
}

OddsConverter.american = {
    toDecimal: function(moneyline){
        moneyline > 0 ? decimal = (moneyline/100) + 1 : decimal = ((100/Math.abs(moneyline)) + 1).toPrecision(3);
        return decimal;
    },
    toFractional: function(moneyline){
        moneyline > 0 ? fraction = new Fraction(moneyline/100) : fraction = new Fraction(100/Math.abs(moneyline));
        return fraction;
    }
}

module.exports = OddsConverter;
},{"fractional-arithmetic":2}]},{},[1])