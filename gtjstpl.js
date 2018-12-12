//-
//- GTJSTpl
//- 
/* 
 * (G)enerally-(T)argeted
 * (J)ava(S)cript-based HTML (T)em(pl)ate Engine
 * --- The template semantic, syntax and its engine ---
 * 基于JavaScript通用HTML页面模板引擎
 * --- 模板语义, 语法及解析引擎 ---
 *
 * @Born with GWA2， General Web Application Architecture
 * @Xenxin@ufqi.com, Wadelau@hotmail.com
 * @Since Oct 10, 2018
 * @Ver 1.1
 * 
 *** Philosophy:
 * God's return to God, Caesar's return to Caesar; 
 * the backend runs in background, the frontend is executed in foreground.
 * 上帝的归上帝, 凯撒的归凯撒; 后端的归后台, 前端的归前台。
 * 
 *** Pros:
 1) Runtime in client-side, reduce computing render in server-side;
 2) Language-independent, not-bound with backend scripts/languages;
 3) Totally-isolated between MVC, data transfer with JSON;
 4) Full-support template tags with built-in logic and customerized JavaScript functions;
 5) No more tags language to be learned, just JavaScript;
 ...
 *** History:
 * Nov 24, 2018, +include with scripts
 * Dec 02, 2018, +variables, +functions
 * Dec 04, 2018, +tpl2code string to array, +foreach
 * Dec 08, 2018, +else if, +embedded tpl in <>
 * Dec 16, 2018, +literal
 */

"use strict"; //- we are serious

//- GTJSTpl configs, modify at your conveniences
if(!window){ window = {}; } //- why this?
window.GTJSTplDefault = {
	"TplVarTag": "$", //- variables from response starting with this, e.g. $pageTitle
	"JsonDataId": "gtjstpljsondata", //- an html element id which holds server response json data
	"LogTag": "GTJSTpl", //- inner usage
	"ParseTag": "__JSTPL__",  //- inner usage
	"IncludeScriptTag": "GTJSTpl_INCLUDE_SCRIPT", //- inner usage
	"IsDebug": false, //- verbose output in console
};

/*
 * GTJSTpl runtime 
 * ----------------- !!! Please do not edit any code below this line !!! -----------------
 */
 //- parent's configs will override defaults
if(window.GTJSTpl){
	for(var $k in window.GTJSTpl){
		window.GTJSTplDefault[$k] = window.GTJSTpl[$k];
	}
}
window.GTJSTpl = window.GTJSTplDefault;
//- ----------------- MAGIC START -----------------
(function(window){ //- anonymous GTJSTpl main func bgn

	//- global objects
	if(!window.GTJSTpl){
		var errMsg="GTJSTpl undefined. 201812011128"; 
		console.log(errMsg); return errMsg;
	}
	var timeCostBgn = (new Date()).getTime();
	
	//- constants
	const parseTag = window.GTJSTpl.ParseTag; const unParseTag = '__NOT' + parseTag;
	const tplVarTag = window.GTJSTpl.TplVarTag; const jsonDataId = window.GTJSTpl.JsonDataId; 
	const logTag = window.GTJSTpl.LogTag+" "; const isDebug = window.GTJSTpl.IsDebug; 
	const includeScriptTag = window.GTJSTpl.IncludeScriptTag;
	const includeScriptTagBgn = includeScriptTag + '_BGN';
	const includeScriptTagEnd = includeScriptTag + '_END';
	
	//- handle server response in json, 
	//- parse it into global variables starting with this tplVarTag
	var pageJsonElement = document.getElementById(jsonDataId);
	var tplData = {};
	if(pageJsonElement){ 
		var tplDataStr = pageJsonElement.innerText;
		try{
			tplData = JSON.parse(tplDataStr);
		}
		catch(e0939){ console.log(e0939);}
		if(!tplData['copyright_year']){ tplData['copyright_year'] = (new Date()).getFullYear(); }
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
		//pageJsonElement.style.height = '0px';
		pageJsonElement.style.visibility = 'hidden'; // hide json data element
		tplDataStr = null;
	}
	else{
		console.log(logTag+'pageJsonElement:['+jsonDataId+'] has error. 201812010927'); 
	}
	
	//- parse all tag blocks
	//- main function
	console.log("aft parse copyright_year:"+$copyright_year);
	var renderTemplate = function(window, document, tplHTML){
		
		//- tpl keywords and patterns
		var tplRe = /\{((for|if|while|else|switch|break|case|\$|\/|var|let)[^}]*)\}/gm;
		
		//- collect tpl content
		var match, tplRaw, tplObject;
		tplObject = document.body || document; 
		if(!tplHTML || tplHTML == ''){
			tplRaw = tplObject.innerHTML;
			//console.log(tplRaw);
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
		else{ tplRaw = tplHTML; }
		tplRaw = tplRaw.replace(/[\n|\r]/g, '');
		//console.log(tplRaw);
		
		var tplSegment = []; var lastpos = 0;
		var staticStr, ipos, matchStr, exprStr;	
		
		//- prepare-1
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
		
		//- parepare-2
		//- fix innerHTML bug {if="" for tpl embedded in <>
		var embeddedRe = /([^<]*)(if|for|while|switch|else|eq|lt|gt|\d|")[\}]*=""/gm;
		lastpos = 0; tplRawNew = tplRaw;
		while(match = embeddedRe.exec(tplRaw)){
			matchStr = match[0]; exprStr = matchStr;
			exprStr = _parseTagInElement(exprStr, match);
			tplRawNew = tplRawNew.replace(matchStr, exprStr);
			if(isDebug){
				console.log(logTag+"found embedded tpl sentence:["+matchStr
					+"] but compatible partially.");
			}
		}
		tplRaw = tplRawNew; tplRawNew = null;
		//console.log(tplRaw);
		
		//- parepare-3
		//- parse literal scripts
		var literalRe = /\{literal\}(.*?)\{\/literal\}/gm;
		var tplSegmentPre = []; var hasLiteralScript = false; lastpos = 0;
		if(tplRaw.indexOf('{literal}') > -1){
			while(match = literalRe.exec(tplRaw)){
				//console.log(match);
				ipos = match.index;
				staticStr = tplRaw.substring(lastpos, ipos);
				matchStr = match[0]; exprStr = match[1];
				tplSegmentPre.push(staticStr);
				tplSegmentPre.push(unParseTag + exprStr);
				lastpos = ipos + matchStr.length;
				hasLiteralScript = true;
			}
		}
		if(hasLiteralScript){
			staticStr = tplRaw.substring(lastpos); // remainings
			tplSegmentPre.push(staticStr);
		}
		else{
			if(isDebug){ console.log(logTag + "no literals:"+tplRaw); }
			tplSegmentPre.push(tplRaw);
		}
		//console.log(tplSegmentPre);
		
		//- prepare-4
		//- parse original scripts
		var scriptRe = /<script[^>]*>(.*?)<\/script>/gm;
		var hasScript = false; var isIncludeScript = false; 
		for(var $prei in tplSegmentPre){
			tplRawNew = tplSegmentPre[$prei];
			if(tplRawNew.indexOf(unParseTag) > -1){ // literal scripts
				tplSegment.push(tplRawNew);
			}
			else{
				lastpos = 0;
				while(match = scriptRe.exec(tplRawNew)){
					//console.log(match);
					ipos = match.index;
					staticStr = tplRawNew.substring(lastpos, ipos);
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
					staticStr = tplRawNew.substring(lastpos); // remainings
					if(staticStr.indexOf(includeScriptTagEnd) > -1){
						isIncludeScript = false;
						staticStr = staticStr.replace(includeScriptTagEnd, '');
					}
					tplSegment.push(parseTag + staticStr);
				}
				else{
					if(isDebug){ console.log(logTag + "no scripts:"+tplRawNew); }
					tplSegment.push(parseTag + tplRawNew);
				}
			}
		}
		//console.log(tplSegment);
		
		//- main body 
		//- loop over tplSegment for tags interpret
		var tpl2code, tpl2codeArr; segStr = ''; segi = 0;
		tpl2codeArr = []; tpl2codeArr.push("var tpl2js = [];");
		var blockBeginRe, tmpmatch, needSemiComma, containsDot, containsBracket;
		var tmpArr, containsEqual, tmpIfPos;
		for(segi in tplSegment){ //- loop over segments besides originals
			segStr = tplSegment[segi];
			if(segStr.indexOf(unParseTag) > -1){ //- literal scripts
				segStr = segStr.replace(unParseTag, '');
				tpl2codeArr.push("\ttpl2js.push(\""+segStr+"\");");
				//console.log(segStr);
			}
			else if(segStr.indexOf(parseTag) == -1){ //- original scripts
				tpl2codeArr.push("\n" + segStr);
			}
			else{ //- mixed tpl content
				//- parse all tpl tags with match
				segStr = segStr.replace(parseTag, ''); lastpos = 0;
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
						//- functions and variables
						if(exprStr.match(/(\+|\-|\*|\/|=|~|!|\()/gm)){
							//- functions call
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
						&& exprStr.indexOf('t;') == -1){ 
						// exceptions, &gt; &lt;
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
								//- blocks begin
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
							tmpIfPos = exprStr.indexOf('if ');
							if( tmpIfPos > -1 && exprStr.indexOf('(') < 0){
								if(isDebug){
								console.log(logTag+"illegal tpl sentence:"+exprStr
									+" but compatible.");
								}
								exprStr = exprStr.substr(0, tmpIfPos+3) 
									+ '(' + exprStr.substr(tmpIfPos+3) + ')';
							}
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
						if(exprStr.match(/ (eq|lt|gt) /)){
							exprStr = exprStr.replace('eq', '==')
								.replace('lt', '<')
								.replace('gt', '>');
						}
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
		
		//- append returns to tpl2code
		tpl2codeArr.push("return tpl2js.join('');");
		tpl2code = tpl2codeArr.join("\n"); tpl2codeArr = null;
		tpl2code = "try{ " + tpl2code + "\n}\ncatch(e1635){ console.log(\""
			+ logTag + "code exec failed.\"); console.log(e1635); "
			+ " return ''+JSON.stringify(e1635); }\n";
		
		//- merge data and compile
		var tplParse = '';		
		if(isDebug){ console.log(logTag + "tpl2code:"+tpl2code); }
		//tplParse = (function(){ return (new Function(tpl2code).apply(window)); }).apply();
		tplParse = (new Function(tpl2code)).apply(window);
		if(isDebug){ console.log("tplParse:"+tplParse); }
		tplObject.innerHTML = tplParse; 
		tpl2code = null; tpl2codeArr = null; 
		tplRaw = null; tplParse = null; tplSegment = null;
		
	};
	
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
		catch(e){
			s.text = code;
			document.body.appendChild(s);
		}
		if(isDebug){
			console.log('_appendScript: '+myCode+' has been appended.');
		}
	};
	
	//- inner methods
	//- search fields within a regexp match
	var _searchField = function(matchList){
		var fields = {};
		for(var $k in matchList){
			var tmpval = matchList[$k];
			if($k>=0 && $k != 'input' && $k != 'index'){
				tmpval = tmpval.replace(/\{\/(.+)/, '$1');
				if(tmpval.match(/(lt|gt|eq)/g)){
					fields['op'] = tmpval;
				}
				else if(tmpval.match(/=/g)){
					fields['result'] = tmpval;
				}
				else if(tmpval.match(/\$/g)){
					fields['condition'] = tmpval;
				}
				else{
					if(!tmpval.match(/(else|if)/) 
						&& tmpval != '{' && tmpval != '}'){
						tmpval = tmpval=='' ? '0' : tmpval; //- why 0?
						fields['val'] = tmpval.replace(/\{[\/]*(.+)\}/, '$1')
							.replace(/\}[ ]*/, '');
					}
					else{
						//console.log('unkown matchTag: k:'+$k+' val:'+tmpval);
					}
				}
			}
		}
		//console.log(matchList); console.log(fields);
		return fields;
	};
	
	//- inner methods
	//- parse tags embedded in an html element
	var _parseTagInElement = function(exprStr, match){
		//- only if support?
		if(!exprStr){ return ''; }
		exprStr = exprStr.replace(/\}=""/g, '}')
			.replace(/\{="" /g, '{/')
			.replace(/="" (eq|lt|gt)=""/, ' $1')
			.replace(/=""/g, '');
		var hasInsertSpace = false; var tmpmatch;
		if(exprStr.match(/([\S]+)\{if/g)){
			exprStr = exprStr.replace(/([\S]+)\{if/g, '$1 {if');
			hasInsertSpace = true;
			console.log(logTag+" found illegal tpl sentence:["+match[0]
				+"], consider add space between element attribute name and tpl tag."
				+ "["+exprStr+"]");
		}
		var startIfPos = exprStr.indexOf('{if');
		var endIfPos = exprStr.indexOf('if}'); var needSortElement = false;
		if(hasInsertSpace){ //- test whether unsorted or not
			var tagsBfrEnd = ['else', 'lt', 'gt', 'eq', '}', '{/'];
			var tmpArr = exprStr.split(' ');
			var tmpEndIfi = 0; var tmptagi = 0;
			for(var $k in tmpArr){
				for(var $l in tagsBfrEnd){
					if(tmpArr[$k].indexOf(tagsBfrEnd[$l]) > -1){
						tmptagi = $k;
					}
					else if(tmpArr[$k] == 'if}'){
						tmpEndIfi = $k;
					}
					if(tmpEndIfi > tmptagi){
						needSortElement = true; break;
					}
				}
				if(needSortElement){ break; }
			}
		}
		//- parse all unsort tpl list
		if((endIfPos > 0 && startIfPos > 0 && startIfPos > endIfPos)
			|| needSortElement){
			//- supposed in MS Edge
			var tmpi = 0;
			var parts = exprStr.split(' ');
			for(var $k in parts){
				if(parts[$k] == 'if}' || parts[$k] == '{if'){
					tmpi = $k;
					break;
				}
			}
			tmpi--; if(hasInsertSpace){ tmpi = 1; } 
			var parts2 = []; var parts3 = [];
			for(var $k=tmpi; $k<parts.length; $k++){
				parts2.push(parts[$k]);
			}
			for(var $k=0; $k<tmpi; $k++){
				parts3.push(parts[$k]);
			}
			//parts2.sort(); console.log(parts2); console.log(parts3);
			if(isDebug){
			console.log("exprStr:["+exprStr+"] tmpi:"+tmpi+" aft sorted:["+parts2.join(' ')+"]");
			}
			exprStr = parts2.join(' '); // left parts3
			var fields = _searchField(parts2);
			var newExprStr = " {if "+fields['condition']+" "+fields['op']+" "+fields['val']+" } "
				+fields['result']+" {/if}";
			newExprStr = parts3.join(' ') + ' ' + newExprStr;  // add parts3
			console.log('regX ifStart:'+startIfPos+' ifEnd:'+endIfPos
				+' matched! reverse:['+newExprStr+'] in MS Edge.');
			exprStr = newExprStr;
		}
		else{
			//- supposed in Chrome/Firefox...
			if(isDebug){ console.log(logTag+'sorted tpl sentence:['+exprStr+'] in Chrome-likes.'); }
		}
		return exprStr;
	};
	
	//- invoke the magic GTJSTpl
	window.onload = function(){ //- wait longer?
		renderTemplate(window, document, null);
		if(isDebug){ 
			console.log(logTag + "parse time \
				cost: "+(((new Date()).getTime() - timeCostBgn)/1000) + "s");
		}
	};
	
})(window); //- anonymous GTJSTpl main func end
//- ----------------- MAGIC COMPLETE -----------------