
//- JSTpl
/* 
 * JavaScript-based HTML Template Engine , born with GWA2
 *
 * @Xenxin@ufqi.com, Wadelau@hotmail.com
 * @Since Nov 11, 2018
 * @Ver 1.1
 * 
 * God's return to God, Caesar's return to Caesar; 
 * the backend runs in background, the frontend is executed in foreground.
 * 上帝的归上帝, 凯撒的归凯撒; 后端的归后台, 前端的归前台。
 * 
 * Pros:
 1) Runtime in client-side, reduce computing render in server-side;
 2) Language-independent, not-bound with backend scripts/languages;
 3) Totally-isolated between MVC, data transfer with JSON;
 4) Full-support with built-in logic and customerized JavaScript functions;
 5) No more tags language to be learned, just JavaScript;
 ...
 * History:
 * Nov 24, 2018, +include with scripts
 * Dec 02, 2018, +variables, +functions
 * Dec 04, 2018, +tpl2code string to array, +foreach
 */

"use strict";

//- JSTpl config, modify at your conveniences
if(!window){ window = {}; } //- why this?
window.JSTplDefault = {
	"TplVarTag": "$", //- variables from response starting with this, e.g. $pageTitle
	"JsonDataId": "jstpljsondata", //- an html element id which holds server response json data
	"LogTag": "JSTpl", //- inner usage
	"ParseTag": "__JSTPL__",  //- inner usage
	"IncludeScriptTag": "JSTpl_INCLUDE_SCRIPT", //- inner usage
	"IsDebug": false, //- verbose output in console
};

/*
 * JSTpl runtime 
 * ----------------- !!! Please do not edit any code below this line !!! -----------------
 */
 
 //- parent's configs will override defaults
if(window.JSTpl){
	for(var $k in window.JSTpl){
		window.JSTplDefault[$k] = window.JSTpl[$k];
	}
}
window.JSTpl = window.JSTplDefault;

//- MAGIC START
(function(window){ //- anonymous JSTpl main func bgn

	//- global object
	if(!window.JSTpl){
		var errMsg="JSTpl undefined. 201812011128"; 
		console.log(errMsg); return errMsg;
	}
	
	//- constants
	const parseTag = window.JSTpl.ParseTag; const tplVarTag = window.JSTpl.TplVarTag;
	const jsonDataId = window.JSTpl.JsonDataId; const logTag = window.JSTpl.LogTag+" ";
	const isDebug = window.JSTpl.IsDebug; const includeScriptTag = window.JSTpl.IncludeScriptTag;
	const includeScriptTagBgn = includeScriptTag + '_BGN';
	const includeScriptTagEnd = includeScriptTag + '_END';
	
	//- inner methods
	//- append embedded scripts into current runtime
	var _appendScript = function(myCode) {
		var s = document.createElement('script');
		s.type = 'text/javascript';
		var code = myCode;
		try{
			s.appendChild(document.createTextNode(code));
			document.body.appendChild(s);
		} 
		catch (e) {
			s.text = code;
			document.body.appendChild(s);
		}
		if(isDebug){
			console.log('_appendScript: '+myCode+' has been appended.');
		}
	};
	
	//- server response in json, 
	//- parse it into global variables starting with this tplVarTag
	var timeCostBgn = (new Date()).getTime();
	var pageJsonElement = document.getElementById(jsonDataId);
	var tplData = {};
	if(pageJsonElement){ 
		var tplDataStr = pageJsonElement.innerText; 
		tplData = JSON.parse(tplDataStr);
		if(!tplData['copyright_year']){ tplData['copyright_year'] = (new Date()).getYear(); }
		//- parse json keys as global variables
		//- variables starting with tplVarTag, i.e., $ as default
		for(var $k in tplData){
			//console.log("k:"+$k+" v:"+tplData[$k]);
			if($k != null && $k != ''){
				var $v = tplData[$k];
				$k = tplVarTag + $k;
				if(window){ window[$k] = $v; }
				else{ console.log('window undefined error. 201812011122.'); }
			}
		}
		//- hide raw data
		pageJsonElement.style.height = '0px';
		pageJsonElement.style.visibility = 'hidden'; // hide json data element
	}
	else{ 
		console.log(logTag+'pageJsonElement:['+jsonDataId+'] has error. 201812010927'); 
	}
	
	//- parse all tag blocks
	//console.log("aft parse copyright_year:"+$copyright_year);
	var renderTemplate = function(window, document, tplHTML){
		//var re = /\{([^\}]+)\}/gm, match, tplRaw, tplObject;
		var tplRe = /\{((for|if|while|else|switch|break|case|\$|\/|var|let)[^}]*)\}/gm;
		
		//- collect tpl content
		var match, tplRaw, tplObject;
		tplObject = document.body || document; 
		if(!tplHTML){
			tplRaw = tplObject.innerHTML;
			var tmppos = tplRaw.indexOf(' id="'+jsonDataId+'"');
			if(tmppos == -1){
				tmppos = tplRaw.indexOf(' id="'+jsonDataId+'"');
			}
			if(tmppos > -1){
				tplRaw = tplRaw.substring(0, tmppos); // discard json data
				tmppos = tplRaw.lastIndexOf('<'); 
				tplRaw = tplRaw.substring(0, tmppos); // remove json data tag
			}
			else{
				console.log(logTag + "jsonDataId:["+jsonDataId+"] has error.201812011028");
			}
		}
		else{
			tplRaw = tplHTML;
		}
		//console.log(tplRaw);
		tplRaw = tplRaw.replace(/[\n|\r]/g, '');
		
		var tplSegment = []; var lastpos = 0;
		var staticStr, ipos, matchStr, exprStr;	
		
		//- parse include parts
		var includeRe = /\{include [file|content]*="([^\}]*?)"\}/gm;
		var segi, segStr, tplRawNew, tmpCont;
		lastpos = 0; tplRawNew = tplRaw;
		while(match = includeRe.exec(tplRaw)){
			//console.log(match);
			matchStr = match[0]; exprStr = match[1];
			tmpCont = (new Function("return "+exprStr+";")).apply();
			tmpCont = tmpCont.replace(/[\n|\r]/g, '');
			if(tmpCont.indexOf('<script') > -1){
				tmpCont = includeScriptTagBgn + tmpCont + includeScriptTagEnd;
			}
			tplRawNew = tplRawNew.replace(matchStr, tmpCont);
		}
		tplRaw = tplRawNew;
		//console.log(tplRaw);
		
		//- parse original scripts
		var scriptRe = /<script[^>]*>(.*?)<\/script>/gm;
		var hasScript = false; var isIncludeScript = false;
		while(match = scriptRe.exec(tplRaw)){
			//console.log(match);
			ipos = match.index;
			staticStr = tplRaw.substring(lastpos, ipos);
			if(staticStr.indexOf(includeScriptTagBgn) > -1){
				isIncludeScript = true;
				staticStr = staticStr.replace(includeScriptTagBgn, '');
			}
			matchStr = match[0];
			exprStr = match[1];
			if(isIncludeScript){
				_appendScript(exprStr);
			}
			if(staticStr.indexOf(includeScriptTagEnd) > -1){
				isIncludeScript = false;
				staticStr = staticStr.replace(includeScriptTagEnd, '');
			}
			tplSegment.push(parseTag + staticStr);
			tplSegment.push(exprStr);
			lastpos = ipos + matchStr.length;
			hasScript = true;
		}
		if(hasScript){
			staticStr = tplRaw.substring(lastpos); // remainings
			if(staticStr.indexOf(includeScriptTagEnd) > -1){
				isIncludeScript = false;
				staticStr = staticStr.replace(includeScriptTagEnd, '');
			}
			tplSegment.push(parseTag + staticStr);
		}
		else{
			if(isDebug){ console.log(logTag + "no scripts:"+tplRaw); }
			tplSegment.push(parseTag + tplRaw);
		}
		//console.log(tplSegment);
		
		//- main body for tpl tags interpret
		var tpl2code, tpl2codeArr; segStr = ''; segi = 0;
		tpl2codeArr = []; tpl2codeArr.push("var tpl2js = [];");
		var blockBeginRe, tmpmatch, needSemiComma, containsDot, containsBracket;
		var tmpArr, containsEqual;
		for(segi in tplSegment){ //- loop over segments besides originals
			segStr = tplSegment[segi];
			if(segStr.indexOf(parseTag) == -1){ //- original scripts
				tpl2codeArr.push("\n" + segStr);
			}
			else{
				//- mixed tpl content
				segStr = segStr.replace(parseTag, '');
				lastpos = 0; 
				//- parse all tpl tags
				while(match = tplRe.exec(segStr)){
					ipos = match.index;
					staticStr = segStr.substring(lastpos, ipos);
					staticStr = staticStr.replace(/"/g, '\\"');
					if(staticStr != ''){
						tpl2codeArr.push("\ttpl2js.push(\""+staticStr+"\");");
					}
					//console.log(match);
					matchStr = match[0]; containsBracket = false;
					exprStr = match[1]; containsDot = false; containsEqual = false;
					if(exprStr.indexOf(tplVarTag) == 0){
						//- functions call
						if(exprStr.match(/(\+|\-|\*|\/|=|~|!|\()/gm)){
							if(exprStr.indexOf('(') > -1){ containsBracket = true;} 
							if(exprStr.indexOf('.') > -1){ containsDot = true; }
							if(exprStr.indexOf('=') > -1){ containsEqual = true; }
							if(containsBracket && !containsDot && !containsEqual){
								//- private, $aFunc($a)
								exprStr = exprStr.substring(1);
								tpl2codeArr.push("\ttpl2js.push("+exprStr+");");
							}
							else if(containsDot && !containsEqual){
								//- built-in, $a.substring(0, 5)
								tpl2codeArr.push("\ttpl2js.push("+exprStr+");");
							}
							else{
								//- variables operations, $a++
								tpl2codeArr.push(exprStr + ';');
							}
						}
						else{
							//- variables access, $a
							tpl2codeArr.push("\ttpl2js.push("+exprStr+");");
						}
					}
					else if(exprStr.match(/.*({|;|}).*/gm)
						&& exprStr.indexOf('t;') == -1){ // exceptions, &gt; &lt;
						tpl2codeArr.push("\ttpl2js.push(\""+matchStr+"\");");
						if(isDebug){
						console.log(logTag + "illegal tpl sentence:["+matchStr
							+"] for containing {, }, ;.  skip... 201812012201.");
						}
					}
					else{ //- directives
						needSemiComma = true;
						if(exprStr.match(/(^( )?(if|for|while|switch|case|break))(.*)?/g)){
							blockBeginRe = /^(if|for|while|switch)(.*)/gm; // why re-init?
							if(tmpmatch = blockBeginRe.exec(exprStr)){
								//console.log(tmpmatch);
								if(tmpmatch[2].indexOf('each ') == 0){ //- foreach
									tmpArr = tmpmatch[2].substring(5).split(' as ');
									tmpmatch[2] = 'var ' + tmpArr[1] + ' in ' + tmpArr[0];
								}
								if(tmpmatch[2].indexOf('(') == -1){
									if(isDebug){
									console.log(logTag+"illegal tpl sentence:["
										+exprStr+"] but compatible.");
									}
									exprStr = tmpmatch[1] + '(' + tmpmatch[2] + ')';
								}
							}
							else{
								if(isDebug){ console.log("not blockBegin? "+exprStr+""); }
							}
							exprStr += '{'; needSemiComma = false;
						}
						else if(exprStr.indexOf('else') == 0){ //- if branch
							exprStr = '}\n' + exprStr + '{'; needSemiComma = false;
						}
						else if(exprStr.indexOf('/') == 0){ //- end of a block
							exprStr = '}'; needSemiComma = false;
						}
						if(exprStr.indexOf('t;') > -1){
							exprStr = exprStr.replace('&gt;', '>');
							exprStr = exprStr.replace('&lt;', '<');
						}
						if(needSemiComma){ exprStr += ';'; }
						tpl2codeArr.push("\n" + exprStr);
					}
					lastpos = ipos + matchStr.length;
				}
				//- last static part
				staticStr = segStr.substring(lastpos);
				staticStr = staticStr.replace(/"/g, '\\"');
				if(staticStr != ''){
					tpl2codeArr.push("\ttpl2js.push(\""+staticStr+"\");");
				}
			}
		} // end of loop over tplSegment
		
		//- append to tpl2code
		tpl2codeArr.push("return tpl2js.join('');");
		tpl2code = tpl2codeArr.join("\n"); tpl2codeArr = null;
		tpl2code = "try{"+tpl2code+"\n}\ncatch(e1635){ console.log(\""
			+logTag+"code exec failed.\"); console.log(e1635); "
			+" return ''+JSON.stringify(e1635); }\n";
		
		//- merge data and compile
		var tplParse = '';		
		if(isDebug){ console.log(logTag + "tpl2code:"+tpl2code); }
		//tplParse = (function(){ return (new Function(tpl2code).apply(window)); }).apply();
		tplParse = (new Function(tpl2code)).apply(window);
		if(isDebug){ console.log("tplParse:"+tplParse); }
		tplObject.innerHTML = tplParse; tpl2code = null;
		
	};
	
	//- invoke the magic JSTpl
	renderTemplate(window, document, null);
	if(isDebug){ 
		console.log(logTag + "parse time \
			cost: "+(((new Date()).getTime() - timeCostBgn)/1000) + "s");
	}
	
})(window); //- anonymous JSTpl main func end

//- MAGIC COMPLETE