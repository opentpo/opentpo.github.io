/************************************
This is script for openTPO_0.2.1.preview.
All lefts reserved.
*************************************/

//include functions
function __deleteNode(node){
    if (node != null){
	var parent = node.parentNode;
	node.parentNode.removeChild(node);
	return true;
    }
    else{
	return false;
    }
}
function __deleteId(Id){
    __deleteNode(document.getElementById(Id));
}
function __deleteAllChild(parent){
    if (parent == null) return false;
    var childNode;
    for (; (childNode = parent.lastChild) != null; ){
	parent.removeChild(childNode);
    }
}
function __show(Id){
    __deleteId('style' + Id);
    var sheet = document.createElement('style');
    sheet.innerHTML = '#' + Id + ' {display: block !important;}';
    sheet.id = 'style' + Id;
    document.body.appendChild(sheet);
}
function __hide(Id){
    __deleteId('style' + Id);
}
function __hideAll(){
    var arr;
    for (; (arr = document.getElementsByTagName('style')).length > 0;){
	__deleteNode(arr[0]);
    }
}
function __appendTextNode(parent, text){
    if (parent == null) return false;
    var textnode = document.createTextNode(text);
    parent.appendChild(textnode);
    return textnode;
}
function __appendNode(parent, tagname){
    if (parent == null) return false;
    var newnode = document.createElement(tagname);
    parent.appendChild(newnode);
    return newnode;
}
function __addStyleSheet(Id, str){
    var sheet = document.createElement('style');
    sheet.innerHTML = str;
    sheet.id = Id;
    document.body.appendChild(sheet);
}
function __id(Id){
    return document.getElementById(Id);
}
var voidFunction = function(){
};
//include functions end


//general structure definitions
var _reading = function(){
    var text = new Array();
    var seen = new Array();
    var last = new Array();
    var q = new Array();
    var glossary = {};//word:desc
    var maxseen;
    return {
	addGlossary : function(word, desc){
	    glossary[word] = desc;
	},
	getGlossary : function(word){
	    if (glossary[word]){
		return glossary[word];
	    }else{
		return '';
	    }
	},
	updateMaxSeen : function(thisq){
	    maxseen = (thisq > maxseen) ? thisq : maxseen;
	},
	getMaxSeen : function(){
	    return maxseen;
	},
	reset: function(){
	    text = [];
	    seen = [];
	    q = [];
	    maxseen = 0;
	    glossary = {};
	},
	addText : function(str){
	    text[text.length] = str;
	    seen[seen.length] = false;
	    last[last.length] = q.length;
//process text AFTER processing questions, so flag[reading] = the last number of q
	},
	getText : function(num){
	    return text[num];
	},
	addQ : function(theq){
	    q[q.length] = theq;
	},
	getQ : function(num){
	    return q[num];
	},
	totalQ : function(){
	    return q.length;
	},
	correspondTextNum : function(qnum){
	    if (qnum === -1) return -1;//for boundary situations
	    var i = 0;
	    while (qnum >= last[i]){
		i++;
	    }
	    return i;
	},
	questionStart : function(pnum){
	    if (pnum === 0) return 0;
	    return last[pnum - 1];
	},
	hasSeen : function(pnum){
	    return seen[pnum];
	},
	setSeen : function(pnum){
	    seen[pnum] = true;
	},
	addMarkPara : function(qnum, para){
	    if (!q[qnum].markPara){
		q[qnum].markPara = [];
	    }
	    q[qnum].markPara.push(para);
	}
    };
}();

var generalTimer = function(){
    var timeremain = 0;
    var counting = false;
    var showing = false;
    var outoftime = '';
    var controller;
    function updateReadableTimer(timeArg){
	var thetime = parseInt(timeArg / 10);
	var hourN = thetime / 3600;
	var minuteN = (thetime % 3600) / 60;
	var secondN = thetime % 60;
	__deleteAllChild(__id('hours'));
	__deleteAllChild(__id('minutes'));
	__deleteAllChild(__id('seconds'));
	__appendTextNode(__id('hours'), parseInt(hourN / 10).toString() + parseInt(hourN % 10).toString());
	__appendTextNode(__id('minutes'), parseInt(minuteN / 10).toString() + parseInt(minuteN % 10).toString());
	__appendTextNode(__id('seconds'), parseInt(secondN / 10).toString() + parseInt(secondN % 10).toString());
    }
    function countWorker(){
	if (timeremain <= 0) return;
	if (!counting) return;
	timeremain--;
	if (timeremain % 10 === 0){
	    updateReadableTimer(timeremain);
	    if (timeremain === 0){
		notify.show('blue', 'Time out', '<p>Time exceeds. Your answers have been saved.</p><p>Press <strong>Continue</strong> to leave this part.</p>', [['Continue', outoftime]], false);
		generalTimer.discard();
	    }
	}
    }
    function setStart(){
	if (tpoMode === 1){
	    __show('pauseTestButton');
	    __id('pauseTestButton').onclick = function(){
		generalTimer.stop();
	    };
	}
	__hide('resumeTestButton');
    }
    function setStop(){
	__hide('pauseTestButton');
	__show('resumeTestButton');
	if (tpoMode === 1){
	    __id('resumeTestButton').onclick = function(){
		generalTimer.start();
	    };
	}
    }
    return {
	init : function(thetime, outoftimeproceed){
	    outoftime = outoftimeproceed;
	    timeremain = thetime * 10;//100ms an interval
	    updateReadableTimer(timeremain);
	},
	show : function(){
	    __show('hideTimeButton');
	    __hide('showTimeButton');
	    __show('timer');
	    showing = true;
	},
	hide : function(){
	    __hide('hideTimeButton');
	    __show('showTimeButton');
	    __hide('timer');
	    showing = false;
	},
	start : function(){
	    setStart();
	    counting = true;
	    controller = setInterval(countWorker, 100);
	},
	stop : function(){
	    setStop();
	    counting = false;
	    clearInterval(controller);
	},
	resumeAppear : function(){
	    if (showing){
		this.show();
	    }else{
		this.hide();
	    }
	    if (counting){
		setStart();
	    }else{
		setStop();
	    }
	},
	discard : function(){
	    this.stop();
	    this.hide();
	}
    }
}();

var notify = function(){
    var colorTable = {};
    colorTable.green = ['#30b030', '#dfd'];
    colorTable.red = ['#b03030', '#fdd'];
    colorTable.yellow = ['#f0b020', '#ffd'];
    colorTable.blue = ['#6060d0', '#ddf'];
    var addColor = function(thecolor){
	var str = '#notificationHeader {background: ' + colorTable[thecolor][0] + '} #notification {background: ' + colorTable[thecolor][1] + '}';
	__addStyleSheet('styleNotifyColor', str);
    };
    var temp = [];
    return {
	close : function(){
	    __hide('notifySystem');
	},
	show : function(color, title, content, buttonsArray, haveCloseButton){
	    //buttonsArray = [[xxx, "function();"], ...]
	    if (haveCloseButton === undefined) haveCloseButton = false;
	    var str;
	    str = '<p>' + title + '</p>' + ((haveCloseButton) ? '<a id="notifyClose"></a>' : '');
	    __id('notificationHeader').innerHTML = str;
	    __id('notificationContent').innerHTML = content;
	    var node = __id('notifyButtonsWrapper');
	    __deleteAllChild(node);
	    var i;
	    var newnode;
	    var that = this;
	    for (i = 0; i < buttonsArray.length; i++){
		temp[i] = buttonsArray[i][1];
		newnode = __appendNode(node, 'a');
		newnode.className = 'notifyButtons';
		newnode.href = 'javascript:';
		newnode.onclick = Function(buttonsArray[i][1] + 'notify.close();');
		__appendTextNode(newnode, buttonsArray[i][0]);
	    }
	    if (haveCloseButton){
		__id('notifyClose').onclick = this.close;
	    }
	    __deleteId('styleNotifyColor');
	    addColor(color);
	    __show('notifySystem');
	}
    }
}();
var storage = function(){
    var savVer = '01';
    return {
	reset : function(){
	    var i, j, temp, tempj;
	    this.save('preinit', 1);
	    for (i = 1; i <= allSets; i++){
		temp = i.toString();
		for (j = 0; j <= 50; j++){
		    var tempj = j.toString();
		    this.save(temp + 'prerq' + tempj, 0);
		    this.save(temp + 'prelq' + tempj, 0);
		}
		this.save(temp + 'prew1', '');
		this.save(temp + 'prew2', '');
	    }
	},
	load : function(str){
	    //2rq3 : set02, reading, question03
	    //2lq3
	    //2w1/2w2
	    //init
	    var a = localStorage.getItem(str);
	    if (a === null || a === undefined){
		this.save(str, 0);
	    }
	    return localStorage.getItem(str);
	},
	save : function(str, value){
	    localStorage.setItem(str, value.toString());
	},
	clearReading : function(set){
	    for (j = 0; j <= 50; j++){
		var tempj = j.toString();
		this.save(set.toString() + 'prerq' + tempj, 0);
	    }
	},
	clearListening : function(set){
	    for (j = 0; j <= 50; j++){
		var tempj = j.toString();
		this.save(set.toString() + 'prelq' + tempj, 0);
	    }
	},
	clearWriting : function(set){
	    this.clearWriting1();
	    this.clearWriting2();
	},
	clearWriting1 : function(set){
	    this.save(set.toString() + 'prew1', '');
	},
	clearWriting2 : function(set){
	    this.save(set.toString() + 'prew2', '');
	},
	exportToContainer : function(con){
	    __deleteAllChild(con);
	    var str = 'Start';
	    var i, j;
	    var tmpvalue;
	    str += allSets.toString();
	    str += savVer;//save version
	    str += this.load('preinit');
	    for (i = 1; i <= allSets; i++){
		temp = i.toString();
		for (j = 0; j <= 50; j++){
		    var tempj = j.toString();
		    tmpvalue = this.load(temp + 'prerq' + tempj);
		    //str += '_';
		    str += tmpvalue;
		    tmpvalue = this.load(temp + 'prelq' + tempj);
		    //str += '_';
		    str += tmpvalue;
		}
		tmpvalue = this.load(temp + 'prew1');
		//str += '|_|';
		str += tmpvalue;
		//str += '|_|';
		str += tmpvalue;
	    }
	    str += 'End';
	    __appendTextNode(con, str);
	},
	importFromString : function (str){//return status
	    if (str.slice(0, 5) !== 'Start') return 'invalid';
	    if (str.slice(-3) !== 'End') return 'invalid';
	    //set check
	    var temp = str.slice(5, 7);
	    if (!(((/^[0-9]+$/.test(temp))) && (parseInt(temp, 10) > 0))){//invalid set num
		return 'invalid';
	    }
	    var setnum = parseInt(temp, 10);
	    if (setnum > allSets) return 'oldver';
	    //version check
	    temp = str.slice(7, 9);
	    if (!(((/^[0-9]+$/.test(temp))) && (parseInt(temp, 10) > 0))){//invalid set num
		return 'invalid';
	    }
	    if (temp !== savVer) return 'savVermismatch';
	    //read contents
	    var sstr = str.slice(9, -3);
	    var iInit;
	    var iReading = [];
	}
    }
}();
//general structure definitions end


//global variables
var testSet = 0;
var allSets = 1;
var tpoMode = 0; //test=0 practice=1 review=2
var nowSection = 0; //r=0 l=1 s=2 w=3
var reviewed;
var showGloss = '';//glossary
//global variables end


//init
__id('pagewrapper').onselectstart = __id('pagewrapper').ondrag = function(){
    return false;
} //disable selection

for (var i = 1; i <= allSets; i++){
    var thisset = 'TPO ' + parseInt(i / 10) + i % 10;
    var node = __id('setSelectButtons');
    var newButton = document.createElement('a');
    newButton.className = 'whiteButtonsSetSelect';
    newButton.href = 'javascript:';
    newButton.onclick = function(i){
	return function(){
	    testSet = i;
	    readingPreprocess(_readingmaterial[i - 1]);
	    switch(tpoMode){
	    case 0:
		__hideAll();
		showTestIntro();
		break;
	    case 1:
		notify.show('blue', 'Select section', '<p>Which section of test set ' + testSet + ' would you like to take?</p><p>In this preview version of openTPO, only <strong>Reading</strong> button is effective. </p>', [['Reading', '__hideAll();readingHub("directions");'], ['Listening', ''], ['Speaking', ''], ['Writing', '']], true);
		break;
	    case 2:
		reviewed = 'n';//keep reviewed longer than empty string
		__hideAll();
		showReviewChart();
		break;
	    default:
		break;
	    }
	}
    }(i);
    node.appendChild(newButton);
    __appendTextNode(newButton, 'Sample Set 01');
}

function resetSystem(){
    generalTimer.discard();
    __hideAll();
    __show('welcomePage');
    __id('backButton').onclick = function(){
	__hideAll();
	__show('welcomePage');
    }
}
//then bind permanent buttons

__id('testModeButton').onclick = function(){
    __hideAll();
    __show('setSelectPage');
    __id('questionNumber').innerHTML = 'Test Mode';
    __show('questionNumber');
    tpoMode = 0;
    __show('backButton');
};
__id('practiceModeButton').onclick = function(){
    __hideAll();
    __show('setSelectPage');
    __id('questionNumber').innerHTML = 'Practice Mode';
    __show('questionNumber');
    tpoMode = 1;
    __show('backButton');
};
__id('reviewModeButton').onclick = function(){
    __hideAll();
    __show('setSelectPage');
    __id('questionNumber').innerHTML = 'Review Mode';
    __show('questionNumber');
    tpoMode = 2;
    __show('backButton');
};
__id('settingsLink').onclick = function (){
    __hideAll();
    __show('settingsPage');
    __show('backButton');
};
__id('helpLink').onclick = function (){
    __hideAll();
    __show('helpPage');
    __show('backButton');
};
__id('aboutLink').onclick = function (){
    __hideAll();
    __show('aboutPage');
    __show('backButton');
};
__id('helpButton').onclick = function(){
    notify.show('green', 'Help', '<p>openTPO simulates the process and appearance of the actual test. If you are not sure about something, you are encouraged to try it out. In actual test, pressing <strong>Help</strong> button will show a help window.</p><p>Remember: the clock does NOT stop while you are reading instructions in Help in the actual test.</p>', [['OK', '']], false);
};
__id('testExitButton').onclick = function (){
    notify.show('yellow', 'Exit Test', '<p>Are you going to exit the test? Your progress has been saved automatically.</p>', [['Exit', 'clearThisSection();resetSystem();'], ['Cancel', '']], false);
};
__id('sectionExitButton').onclick = function (){
    if (tpoMode !== 2){
	notify.show('yellow', 'Exit Section', '<p>Are you going to exit this section? Your progress has been saved automatically.</p>', [['Exit', 'exitThisSection();'], ['Cancel', '']], false);
    }else{
	__hideAll();
	showReviewChart();
    }
};
__id('glossaryClose').onclick = function(){
    __hide('readingGlossary');
    showGloss = '';
}
__id('showTimeButton').onclick = function(){
    generalTimer.show();
};
__id('hideTimeButton').onclick = function(){
    generalTimer.hide();
};
window.onload = function(){
    resetSystem();
    if (storage.load('preinit') === '0'){
	notify.show('green', 'First start', '<p>Welcome to openTPO online preview. Please feel free to experience its features!</p><p>It would be helpful to know more about openTPO project by clicking on other parts of the navigation bar.</p>', [['OK', 'storage.reset();']], false);
}
}

//first-start instructions & clean storage


function clearThisSection(){
    switch(nowSection){
    case 0:
	clearReadingSection();
	break;
    case 1:
	//clearListeningSection();
	break;
    case 2:
	//clearSpeakingSection();
	break;
    case 3:
	//clearWritingSection();
	break;
    default:
	break;
    }
}
function showTestIntro(){//test intro only appears in Test Mode
    if (tpoMode === 2){
	showReviewChart();
	return;
    }
    __show('testIntro');
    __show('testExitButton');
    __show('continueButton');
    __id('continueButton').onclick = function(){
	__hideAll();
	readingHub('directions');
    };
}

function readingPreprocess(originalarray){
    function readingPassagePreprocess(original, start){
	var qstart = start - 1;
	var temp;
	function ___paragraph(){
	    //||
	    var block = temp.split('||');
	    temp = '<h1>' + block[0] + '</h1>';
	    for (var i = 1; i < block.length; i++){
		temp += '<p>' + block[i] + '</p>';
	    }
	}
	function ___mark(){
	    //##1  ##
	    var block = temp.split('##');
	    var markFlag = false;
	    temp = '';
	    for (var i = 0; i < block.length; i++){
		if (markFlag === true){
		    var num = parseInt(block[i]);
		    var len;
		    len = (num < 10) ? 1 : 2;
		    temp += '<span class="r' + (num + qstart).toString() + '"><span class="rMark">' + block[i].substring(len, block[i].length) + '</span></span>';
		}
		else{
		    temp += block[i];
		}
		markFlag = !markFlag;
	    }
	}
	function ___arrow(){
	    //``2
	    var block = temp.split('``');
	    var paraCount = 0;
	    temp = block[0];
	    paraCount += block[0].split('<p>').length - 1;
	    for (var i = 1; i < block.length; i++){
		var num = parseInt(block[i], 10);
		var len;
		len = (num < 10) ? 1 : 2;
		temp += '<span class="r' + (num + qstart).toString() + '"><span class="rArrow"></span></span>' + block[i].substring(len, block[i].length);
		_reading.addMarkPara(num + qstart, paraCount);
		paraCount += block[i].split('<p>').length - 1;
	    }
	}
	function ___insert(reading){
	    //^^3
	    var block = temp.split('^^');
	    temp = block[0];
	    for (var i = 1; i < block.length; i++){
		var num = parseInt(block[i]);
		var strIns = _reading.getQ(num + qstart).sentence + ' ';
		var len;
		len = (num < 10) ? 1 : 2;
		temp += '<span class="r' + (num + qstart) + '"><a class="rIns' + ((i - 1) % 4) + '" onclick="insClick(' + ((i - 1) % 4) + ', ' + (num + qstart) + ');"></a><strong>' + strIns + '</strong></span>' + block[i].substring(len, block[i].length);//insClick(0, 13)
	    }
	}
	function ___nouns(){
	    //++  ++
	    var block = temp.split('++');
	    var nounFlag = false;
	    temp = '';
	    for (var i = 0; i < block.length; i++){
		if (nounFlag === true){
		    temp += '<em>' + block[i] + '</em>';
		}
		else{
		    temp += block[i];
		}
		nounFlag = !nounFlag;
	    }
	}
	function ___glossary(){
	    // ***word---desc***
	    var block = temp.split('***');
	    var wordFlag = false;
	    var tempb;
	    var worditself;
	    temp = '';
	    for (var i = 0; i < block.length; i++){
		if (wordFlag === true){
		    tempb = block[i].split('---');
		    worditself = tempb[0].toLowerCase();
		    _reading.addGlossary(worditself, tempb[1]);
		    temp += '<a href="javascript:" class="glossaryUnderlined" onclick="showGlossary(\'' + worditself + '\');">' + tempb[0] + '</a>';
		}
		else{
		    temp += block[i];
		}
		wordFlag = !wordFlag;
	    }
	}
	temp = original;
	___paragraph();
	___mark();
	___arrow();
	___insert(i);
	___nouns();
	___glossary();
	return temp;
    }
    function readingQuestionPreprocess(original){
	function ___mark(temp){
	    //##  ##
	    var result;
	    var block = temp.split('##');
	    var markFlag = false;
	    result = '';
	    for (var i = 0; i < block.length; i++){
		if (markFlag === true){
		    result += '<span class="rMark">' + block[i] + '</span>';
		}
		else{
		    result += block[i];
		}
		markFlag = !markFlag;
	    }
	    return result;
	}
	var everyq = original.split('---');
	for (var j = 0; j < everyq.length; j++){
	    var thisq = new Object();
	    var detailq = everyq[j].split('::');
	    thisq.type = parseInt(detailq[1]);
	    if (detailq[0] === 'all'){//summary question
		thisq.heading = detailq[2];
		thisq.choice = detailq[3].split('||');
		thisq.ansCorrect = detailq[4];
	    }
	    else{
		thisq.gotoPara = parseInt(detailq[0]);
		if (parseInt(detailq[1]) === 4){//insert
		    thisq.sentence = detailq[2];
		    thisq.ansCorrect = detailq[3];
		}
		else{//single or multiple
		    thisq.heading = ___mark(detailq[2]);
		    thisq.choice = detailq[3].split('||');
		    thisq.ansCorrect = detailq[4];
		}
	    }
	    //alert(j.toString() + thisq.heading);
	    _reading.addQ(thisq);
	}
    }
    _reading.reset();
    for (var i = 0; i < 3; i++){
	var splited = originalarray[i].split('____');
	var qtotal = _reading.totalQ();
	readingQuestionPreprocess(splited[1]);
	_reading.addText(readingPassagePreprocess(splited[0], qtotal));
    }
}

function readingHub(status){
    function updatePassage(num){
	var thePassage = __id('readingPassage');
	__deleteAllChild(thePassage);
	thePassage.innerHTML = _reading.getText(num);
    }
    function updateQuestion(qnum){
	var i;
	var origans = parseInt(storage.load(testSet.toString() + 'prerq' + qnum), 10);
	__deleteId('insStyle'); //delete the tracks of InsertQuestion
	//and generate and show question number in the header
	__deleteAllChild(__id('questionNumber'));
	var qnStr = 'Question ' + (qnum + 1) + ' of ' + _reading.totalQ();
	__appendTextNode(__id('questionNumber'), qnStr);
	__show('questionNumber');
	//questionSeen used in Review page
	_reading.updateMaxSeen(qnum);
	var theQ = _reading.getQ(qnum);
	if (theQ.type >= 6){//summary question
	    //	__deleteAllChild(__id('readingQ'));
	    __id('viewTextButton').onclick = function(){
		__hide('readingQSumSix');
		__show('readingSplitWindow');
		__hide('viewTextButton');
		__show('viewQuestionButton');
		if (showGloss) showGlossary(showGloss);
	    };
	    __id('viewQuestionButton').onclick = function(){
		__show('readingQSumSix');
		__hide('readingSplitWindow');
		__show('viewTextButton');
		__hide('viewQuestionButton');
		__hide('readingGlossary');
	    };
	    __hide('readingQ');
	    __hide('readingQIns');
	    __show('readingQSumSix');
	    __show('viewTextButton');
	    __addStyleSheet('summaryNoBar', '#readingStatusBar {display: none !important;} #readingPassage {top: 0 !important;}');
	    __hide('readingSplitWindow');

	    __deleteAllChild(__id('readingQSumSixHead'));
	    __appendTextNode(__id('readingQSumSixHead'), theQ.heading);
	    sumSix.update(qnum);
	}
	else if (theQ.type < 3){ //normal or multiple question
	    if (showGloss) showGlossary(showGloss);
	    __hide('readingQIns');
	    __show('readingQ');
	    var qNode = __id('readingQ');
	    __deleteAllChild(qNode);
	    var qhStr = theQ.heading;

	    if (theQ.type === 2){//if it is a multiple question, we should give some instructions
		qhStr += ' <strong>Choose 2 correct answers.</strong>';
	    }

	    __appendNode(qNode, 'p').innerHTML = qhStr;
	    var choiceList = __appendNode(qNode, 'ul');

	    if (theQ.type === 1){
		var choiceClass = 'oval';
	    }
	    else{
		var choiceClass = 'square';
	    }

	    for (i = 0; i <= 3; i++){
		var liNode = __appendNode(choiceList, 'li');
		__appendNode(liNode, 'span');
		var aNode = __appendNode(liNode, 'a');
		aNode.href = 'javascript:';
		liNode.onclick = function(choiceClass, i, qnum){
		    return function(){
			if (choiceClass === 'oval'){
			    ovalClickR(i.toString(), qnum);
			}else{
			    squareClickR(i.toString(), qnum);
			}
		    };
		}(choiceClass, i, qnum);
		__appendTextNode(aNode, theQ.choice[i]);
		if ((origans & (1 << i)) != 0){
		    liNode.className = choiceClass + 'Selected';
		}
		else{
		    liNode.className = choiceClass + 'NotSelected';
		}
		if (tpoMode === 2){//mark correct answer
		    if (theQ.ansCorrect.indexOf((i + 1).toString()) >= 0){
			liNode.getElementsByTagName('a')[0].className = 'correctChoice';
		    }
		}
		liNode.id = 'choice' + i.toString();
	    }
	    if (theQ.markPara){
		var arrowText = 'Paragraph ' + theQ.markPara[0] + ' ';
		if (theQ.markPara.length > 1){
		    for (i = 1; i < theQ.markPara.length; i++){
			arrowText += 'and ' + theQ.markPara[i] + ' ';
		    }
		    arrowText += 'are marked with arrows';
		}
		else{
		    arrowText += 'is marked with an arrow';
		}
		arrowText += ' [<span class="rArrowQ"></span>].';
		var arrowNode = __appendNode(qNode, 'p');
		arrowNode.innerHTML = arrowText;
		arrowNode.style.position = 'relative';
		arrowNode.style.top = '2.6em';
	    }
	}
	else if (theQ.type === 4){
	    if (showGloss) showGlossary(showGloss);
	    __hide('readingQ');
	    __show('readingQIns');
	    var theNode = __id('toBeInserted');
	    __deleteAllChild(theNode);
	    __appendTextNode(theNode, theQ.sentence);
	    insUpdate(-1, qnum);//if user selected no answer, the correct answer should be marked automatically in review mode.
	    for (i = 0; i < 4; i++){
		if ((origans & (1 << i)) !== 0){
		    insUpdate(i, qnum);
		    break;
		}
	    }
	}
	var sheetName = 'r' + qnum;
	var strSS = '.' + sheetName;
	var newsheet = strSS + ' .rArrow {display: inline-block;} ' + strSS + ' .rMark {background: #c0c0c0 !important;}';
	for (i = 0; i < 4; i++){
	    newsheet += strSS + ' a.rIns0 {display: inline-block;} ' + strSS + ' a.rIns1 {display: inline-block;} ' + strSS + ' a.rIns2 {display: inline-block;} ' + strSS + ' a.rIns3 {display: inline-block;} '
	}
	__addStyleSheet(sheetName, newsheet);
    }
    


    //here starts the main part of function
    __hideAll();
    if (tpoMode !== 2){
	__show('testExitButton');
	__show('sectionExitButton');
    }else{
	__show('sectionExitButton');
	__show('showSolutionButton');
    }
    for (var i = 1; i <= _reading.totalQ(); i++){
	__deleteId('r' + i.toString());
    }
    if (status === 'directions'){
	showGloss = '';
	__show('readingSectionDirections');
	__show('nextButtonGrey');
	__show('backButtonGrey');
	__show('helpButton');
	__show('reviewButtonGrey');
	__show('continueButton');
	__id('continueButton').onclick = function(){
	    generalTimer.init(3600, 'readingSectionEnd();');
	    generalTimer.start();
	    generalTimer.show();
	    readingHub(0);//question no.1 ready!
	};
	return;
    }
    if (tpoMode !== 2) generalTimer.resumeAppear();
    if (status === 'haveTime'){
	__hide('testExitButton');
	__hide('sectionExitButton');
	__show('continueButton');
	__show('reviewSquareButton');
	__show('returnButton');
	__show('readingHaveTime');
	__id('returnButton').onclick = function(){
	    readingHub(_reading.totalQ() - 1);
	};
	__id('continueButton').onclick = function(){
	    if (tpoMode === 0){
		notify.show('green', 'Notice', '<p>Since this preview version of openTPO includes only reading section, the test will end after clicking on <strong>OK</strong>.</p>', [['OK', 'readingSectionEnd();']], false);
	    }//temporarily halt the test, since listening section is not ready
	    else if (tpoMode === 1){
		notify.show('green', 'Notice', '<p>This is the end of reading section. You will return to welcome page because it is <strong>Practice Mode</strong></p>.', [['OK', 'readingSectionEnd();']], false);
	    }
	};
	__id('reviewSquareButton').onclick = function(){
	    readingHub('review' + _reading.totalQ().toString());
	};
	return;
    }
    var reviewtest = /^review([0-9]+)$/;
    if (reviewtest.test(status)){
	__show('readingReview');
	__show('returnButton');
	__show('gotoQuestionButton');
	notify.show('green','Feature under testing', '<p>In this preview version of openTPO, review page is merely an experience prototype. You could click on <strong>Return</strong> to go back to where you were in the test.</p>', [['OK', '']], false);
	var presentq = parseInt(reviewtest.exec(status)[1]);
	var selectedq = presentq;
	var returnButtonClick;
	__id('returnButton').onclick = function(){
	    if (presentq < _reading.totalQ()){
		readingHub(presentq);
	    }else{
		readingHub('haveTime');
	    }
	};
	__id('gotoQuestionButton').onclick = function(){
	    readingHub(selectedq);
	};
	return;
    }
    if (typeof status === 'number'){
	__show('readingSplitWindow');
	questionNow = status;
	var readingNumber = _reading.correspondTextNum(status);
	thisSeen = _reading.hasSeen(readingNumber);
	updatePassage(readingNumber);
	if (_reading.correspondTextNum(status) !== _reading.correspondTextNum(status - 1)){
	    if (status > 0){
		showGloss = ''; //for glossary autohide
	    }
	    if (!thisSeen && tpoMode !== 2){//not review mode
		__deleteAllChild(__id('readingQ'));
		__show('continueCircleButton');
		__show('testExitButton');
		__show('sectionExitButton');
		__id('continueCircleButton').onclick = function(){
		    _reading.setSeen(readingNumber);
		    readingHub(status);
		}
		return;
	    }
	}

	if (status + 1 === _reading.totalQ() && tpoMode === 2){
	    __show('nextButtonGrey');
	}else{
	    __show('nextButton');
	}
	if (status === 0){
	    __show('backButtonGrey');
	}else{
	    __show('backButton');
	}
	__show('helpButton');
	__show('reviewButton');
	__id('reviewButton').onclick = function(){
	    readingHub('review' + status.toString());
	};
	__id('backButton').onclick = function(){
	    readingHub(status - 1);
	};

	__id('nextButton').onclick = function(){
	    if (status + 1 === _reading.totalQ()){
		readingHub('haveTime');
	    }else{
		readingHub(status + 1);
	    }
	};
	updateQuestion(status);
    }
}

var readingSectionEnd = function(){
    clearReadingSection();
    resetSystem();
}
var clearReadingSection = function(){
    generalTimer.discard();
    __hideAll();
}
var exitThisSection = function(){
    switch(nowSection){
    case 0:
	readingSectionEnd();
	break;

    default:
	break;
    }
}

//choices click function
function ovalClickR(index, qnum){
    if (tpoMode === 2) return;
    if (__id('choice' + index.toString()).className === 'ovalNotSelected'){ //choose it
	for (var i = 0; i < 4; i++){
	    __id('choice' + i.toString()).className = 'ovalNotSelected';
	}
	__id('choice' + index.toString()).className = 'ovalSelected';
	storage.save(testSet.toString() + 'prerq' + qnum, 1 << index);
    }
    else{//cancel it
	__id('choice' + index.toString()).className = 'ovalNotSelected';
	storage.save(testSet.toString() + 'prerq' + qnum, 0);
    }
}
function squareClickR(index, qnum){
    if (tpoMode === 2) return;
    var qstr = testSet.toString() + 'prerq' + qnum;
    var origans = parseInt(storage.load(qstr), 10);
    if (__id('choice' + index.toString()).className === 'squareNotSelected'){ //choose it
	__id('choice' + index.toString()).className = 'squareSelected';
	storage.save(testSet.toString() + 'prerq' + qnum, origans + (1 << index));
    }
    else{//cancel it
	__id('choice' + index.toString()).className = 'squareNotSelected';
	readingUpdateAnswer(questionNow, index, 'cancel');
	storage.save(testSet.toString() + 'prerq' + qnum, origans - (1 << index));
    }
}
function insUpdate(index, qnum){
    __deleteId('insStyle');
    var correct = parseInt(_reading.getQ(qnum).ansCorrect);
    var newStyle = '';
    var strSS = '.r' + qnum;
    if (index >= 0){//-1 is reserved for review mode
	newStyle = strSS + ' a.rIns' + index.toString() + ' {display: none !important;}' + strSS + ' a.rIns' + index.toString() + ' + strong {display: inline !important;}';
    }
    if (tpoMode === 2){
	newStyle += strSS + ' a.rIns' + (correct - 1).toString() + ' {display: none !important;}' + strSS + ' a.rIns' + (correct - 1).toString() + ' + strong {display: inline !important; background: #9f9 !important;}';
    }
    __addStyleSheet('insStyle', newStyle);
}
function insClick(index, qnum){//0~~3 // only reading
    if (tpoMode === 2) return;
    var qstr = testSet.toString() + 'prerq' + qnum;
    insUpdate(index, qnum);
    storage.save(qstr, 1 << index);
}
var sumSix = function(){
    //answer of sumSix is like '425', which indicates the choice that three answer frames are filled in
    var getOrigAns = function(qnum){
	var qstr = testSet.toString() + 'prerq' + qnum;
	var origans = storage.load(qstr);
	while (origans.length < 3){
	    origans = '0' + origans;
	}
	return origans;
    }
    var saveOrigAns = function(qnum, ans){
	var qstr = testSet.toString() + 'prerq' + qnum;
	storage.save(qstr, ans);
    }
    return {
	check : function(index, qnum){
	    var origans = getOrigAns(qnum);
	    var pos = origans.indexOf(index.toString());
	    return ((pos === -1) ? false : true);
	},
	add : function(index, qnum){//0~5
	    if (tpoMode === 2) return;
	    var origans = getOrigAns(qnum);
	    var pos = origans.indexOf('0');
	    if (pos != -1){
		origans = origans.slice(0, pos) + (index + 1).toString() + origans.slice(pos + 1);
	    }
	    saveOrigAns(qnum, origans);
	    this.update(qnum);
	},
	cancel : function(index, qnum){//0~2
	    if (tpoMode === 2) return;
	    var origans = getOrigAns(qnum);
	    origans = origans.slice(0, index) + '0' + origans.slice(index + 1);
	    saveOrigAns(qnum, origans);
	    this.update(qnum);
	},
	update : function(qnum){
	    var i;
	    var origans = getOrigAns(qnum);
	    var choosed = [false, false, false, false, false, false];
	    var thischoice;
	    var theQ = _reading.getQ(qnum);
	    for (i = 0; i < 3; i++){
		if (origans.charAt(i) !== '0'){//choosed
		    thischoice = parseInt(origans.charAt(i), 10) - 1;
		    choosed[thischoice] = true;
		    __id('dynamicSumSixAnswer' + i).innerHTML = theQ.choice[thischoice];
		    __id('dynamicSumSixAnswer' + i).onclick = function(i, qnum){
			return function(){
			    sumSix.cancel(i, qnum);
			}
		    }(i, qnum);
		    if (tpoMode === 2 && theQ.ansCorrect.indexOf((thischoice + 1).toString()) >= 0){
			__id('dynamicSumSixAnswer' + i).className = 'correctChoice';
		    }
		}else{
		    __id('dynamicSumSixAnswer' + i).innerHTML = '&nbsp;';//we reserve a blank character here, otherwise the page layout would be confusing.
		    __id('dynamicSumSixAnswer' + i).onclick = voidFunction;
		}
	    }
	    for (i = 0; i < 6; i++){
		if (choosed[i]){
		    __id('dynamicSumSixChoice' + i).innerHTML = '&nbsp;';
		    __id('dynamicSumSixChoice' + i).onclick = voidFunction;
		}else{
		    __id('dynamicSumSixChoice' + i).innerHTML = theQ.choice[i];
		    __id('dynamicSumSixChoice' + i).onclick = function(i, qnum){
			return function(){
			    sumSix.add(i, qnum);
			}
		    }(i, qnum);
		    if (tpoMode === 2 && theQ.ansCorrect.indexOf((i + 1).toString()) >= 0){
			__id('dynamicSumSixChoice' + i).className = 'correctChoice';
		    }
		}
	    }
	}
    }
}();
var showGlossary = function(word){
    var desc = _reading.getGlossary(word);
    if (desc === '') return;
    __id('readingGlossaryContents').innerHTML = '<strong>' + word + '</strong>: ' + desc;
    __show('readingGlossary');
    showGloss = word;
}


// review mode
function showReviewChart(){
    __id('returnButton').onclick = function(){
	resetSystem();
	__hideAll();
	__show('setSelectPage');
	__show('backButton');
    }
    __show('returnButton');
    __id('gotoQuestionButton').onclick = voidFunction;
    __show('reviewChart');
    __id('questionNumber').innerHTML = 'Review TPO ' + parseInt(testSet / 10).toString() + testSet.toString();
    __show('questionNumber');
    var r = -1;
    var l = -1;
    var s = -1;
    var w = -1;
    var temp = reviewed.charAt(0);
    switch(temp){
    case 'r':
	r = parseInt(reviewed.slice(1), 10);
	break;
    case 'l':
	break;
    case 's':
	break;
    case 'w':
	break;
    default:
	break;
    }
    generateReviewReadingChart(r);
}

var reviewGoto = function(mode, qnum){
    if (mode === 'r'){
	readingHub(qnum);
	return;
    }
}

function generateReviewReadingChart(rArg){
    __deleteAllChild(__id('reviewChartReading'));
    var tableNode = __appendNode(__id('reviewChartReading'), 'table');
    var trNode = __appendNode(tableNode, 'tr');
    var myans;
    var coans;
    var theQ;
    var i, j, temp;
    trNode.className = 'reviewTableHead';
    __appendTextNode(__appendNode(trNode, 'th'), '#');
    __appendTextNode(__appendNode(trNode, 'th'), 'My answer');
    __appendTextNode(__appendNode(trNode, 'th'), 'Correct answer');
    for (i = 0; i < _reading.totalQ(); i++){
	trNode = __appendNode(tableNode, 'tr');
	__appendTextNode(__appendNode(trNode, 'td'), (i + 1).toString());
	theQ = _reading.getQ(i);
	coans = theQ.ansCorrect; //it's a string
	switch(theQ.type){
	case 1:
	case 2:
	case 4:
	    myans = '';
	    temp = storage.load(testSet.toString() + 'prerq' + i);
	    for (j = 0; j < 4; j++){
		if ((temp & (1 << j)) !== 0){
		    myans += (j + 1).toString();
		}
	    }
	    break;
	case 6:
	    myans = '';
	    for (j = 1; j <= 6; j++){
		if (sumSix.check(j, i)){
		    myans += j.toString();
		}
	    }
	    break;
	default:
	    break;
	}
	if (myans === '') myans = 'none';
	__appendTextNode(__appendNode(trNode, 'td'), myans);
	__appendTextNode(__appendNode(trNode, 'td'), coans);
	if (myans === coans){
	    trNode.className = 'reviewTableCorrect';
	}
	else{
	    trNode.className = 'reviewTableIncorrect';
	}
	if (rArg === i){
	    trNode.id = 'reviewTableSelected';
	    __show('gotoQuestionButton');
	}
	trNode.onclick = function(i){
	    return function(){
		reviewed = 'r' + i.toString();
		__show('gotoQuestionButton');
		if (__id('reviewTableSelected') !== null){
		    __id('reviewTableSelected').id = '';
		}
		__id('reviewChartReading').getElementsByTagName('tr')[i + 1].id = 'reviewTableSelected';
		__id('gotoQuestionButton').onclick = function(){
		    reviewGoto('r', i);
		}
	    }
	}(i);
    }
}


/************Settings page***************/
__id('resetStorage').onclick = function(){
    notify.show('red', 'DANGEROUS OPERATION', '<p>This operation will reset your local storage. All of your answers will be lost. Are you sure?</p>', [['Commit', 'storage.reset();'], ['Cancel', '']], true);
};
__id('resetReading').onclick = function(){
    var a = __id('resetInput').value;
    if (isValidSetNumStr(a) === false){
	notify.show('yellow', 'Value invalid', '<p>Input must be an integer between 1 and ' + allSets.toString() + '.</p>', [['Retry', 'a = "";']], false);
    }else{
	notify.show('red', 'Dangerous operation', '<p>This operation will clear all saved answers of reading set ' + a + '. Are you sure?</p>', [['Commit', 'storage.clearReading(' + a + ');'], ['Cancel', '']], true);
    }
}
__id('resetListening').onclick = function(){
    var a = __id('resetInput').value;
    if (isValidSetNumStr(a) === false){
	notify.show('yellow', 'Value invalid', 'Input must be an integer between 1 and ' + allSets.toString() + '.', [['Retry', 'a = "";']], false);
    }else{
	notify.show('red', 'Dangerous operation', '<p>This operation will clear all saved answers of listening set ' + a + '. Are you sure?</p>', [['Commit', 'storage.clearListening(' + a + ');'], ['Cancel', '']], true);
    }
}
__id('resetWriting1').onclick = function(){
    var a = __id('resetInput').value;
    if (isValidSetNumStr(a) === false){
	notify.show('yellow', 'Value invalid', 'Input must be an integer between 1 and ' + allSets.toString() + '.', [['Retry', 'a = "";']], false);
    }else{
	notify.show('red', 'Dangerous operation', '<p>This operation will clear saved response of integrated writing of set ' + a + '. Are you sure?</p>', [['Commit', 'storage.clearWriting1(' + a + ');'], ['Cancel', '']], true);
    }
}
__id('resetWriting2').onclick = function(){
    var a = __id('resetInput').value;
    if (isValidSetNumStr(a) === false){
	notify.show('yellow', 'Value invalid', 'Input must be an integer between 1 and ' + allSets.toString() + '.', [['Retry', 'a = "";']], false);
    }else{
	notify.show('red', 'Dangerous operation', '<p>This operation will clear saved response of independent writing of set ' + a + '. Are you sure?</p>', [['Commit', 'storage.clearWriting2(' + a + ');'], ['Cancel', '']], true);
    }
}
var isValidSetNumStr = function(a){
    return (a !== '') && ((/^[0-9]+$/.test(a))) && (parseInt(a, 10) > 0) && (parseInt(a, 10) <= allSets);
}
__id('importStorage').onclick = function(){
    __hideAll();
    __show('importStoragePage');
    __show('returnButton');
    notify.show('green', 'Feature under testing', 'In this preview version of openTPO, import page is merely an experience prototype. Clicking on <strong>Import</strong> button will trigger nothing.', [['OK', '']], false);
    __id('returnButton').onclick = function(){
	__hideAll();
	__show('settingsPage');
	__show('backButton');
    }
}
__id('exportStorage').onclick = function(){
    __hideAll();
    __show('exportStoragePage');
    storage.exportToContainer(__id('exportContent'));
    __show('returnButton');
    notify.show('green', 'Feature under testing', 'In this preview version of openTPO, export page is merely an experience prototype. Text generated in the textbox below is NOT the valid content using in future versions.', [['OK', '']], false);
    __id('returnButton').onclick = function(){
	__hideAll();
	__show('settingsPage');
	__show('backButton');
    }
}
__id('exportSelectAll').onclick = function(){
    __id('exportContent').select();
}


