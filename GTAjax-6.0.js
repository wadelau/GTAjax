//<!--
/*
 * GTAjax.js 
 * @abstract: General-Targeted Ajax 
 * @author: wadelau@{ufqi,gmail,hotmail}.com
 * @since: 2006-2-17 14:04
 * @update: 12:15 Friday, February 20, 2015
 * @code: 6.0 // a.bc , funcs added b+, errs updated c+ 
 * @NOTICE: DO NOT USE THIS COMMERICALLY WITHOUT AUTHOR'S PAPER AUTHORIZATION
 * Tue Jan 25 12:55:01 GMT 2011
 * Wed Jan 26 17:31:33 GMT 2011
 * Wed Jul 20 08:08:09 BST 2011
 * Fri Mar 16 16:36:52 CST 2012
 * 12:15 Friday, February 20, 2015
 * 6.x Bears 
	HTML 5
	ECMAScript 5, 6 
	HTTP/2 and Event-driven, 
	highly-cached,
	code style of high-performance and readability
 * in mind
 */ 
//---- DO NOT CHANGE ANY PART OF THE CODE UNDER THIS LINE ---

'use strict'; //- 13:10 Saturday, February 21, 2015

var GTAjaxContext = {
	//- runtime context, parent, process, single
	instanceI : 0,
};

function GTAjax(){
	//- instance definition, child, thread, multiple
	GTAjaxContext.instanceI++;
	var conf = {iname:'Minina','jname':'Yoyo'};
	console.log(new Date()+':['+GTAjaxContext.instanceI+']');
	this.set = function(sId, myVal){
		conf.sId = myVal;
	};
	this.set('iname', 'wadelau');
	console.log(new Date()+':['+GTAjaxContext.instanceI+'] iname:['+conf.iname+'] jname:['+conf.jname+']');
};

//-- binding to window object
window.GTAjax = GTAjax;
window.GTAjaxContext = GTAjaxContext;

//-- for test only....
var gta = new GTAjax();
var gta2 = new GTAjax();
var sId = 'iname';
gta2.set(sId, 'wadelau2');
var myconf = gta2.conf;
console.log(new Date()+':['+GTAjaxContext.instanceI+'] iname-in-instance:['+myconf.iname+']');
var gta3 = new GTAjax();

//---- DO NOT CHANGE ANY PART OF THE CODE ABOVE THIS LINE ---
/*

var gtaj = new GTAjax();
gtaj.set('nobacktag','<!--gtajaxsucc-->'); //--- server response string with this tag, no append back link
gtaj.set('nocopy',true); //--- forbid copy content from current page
gtaj.get(sUrl);

*/
//-- http://www.thescripts.com/forum/thread508775.html
// compress tool : http://dojotoolkit.org/docs/compressor_system.html
// java -jar custom_rhino.jar -c infile.js > outfile.js 2>&1
// java -jar custom_rhino.jar -c GTAjax-20070515-2.01.js > GTAjax_.js 2>&1

//--> 
