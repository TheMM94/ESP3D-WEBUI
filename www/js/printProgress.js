var intervalPrintProgress=-1;

function on_autocheck_PrintProgress(use_value){
	if (typeof (use_value) !== 'undefined' )  
		document.getElementById('autocheck_printprogress').checked = use_value;
    if (document.getElementById('autocheck_printprogress').checked) {
       var interval = parseInt(document.getElementById('printProgressInterval_check').value);
       if (!isNaN(interval) && interval > 0 && interval < 301) {
			if (intervalPrintProgress != -1 )
				clearInterval(intervalPrintProgress);
			intervalPrintProgress = setInterval(function(){ getPrintProgress() }, interval * 1000);
		}
        else {
            document.getElementById('autocheck_printprogress').checked = false;
            document.getElementById('printProgressInterval_check').value = 0;
			if (intervalPrintProgress != -1 )
				clearInterval(intervalPrintProgress);
            intervalPrintProgress = -1;
        }
    }
  else {
		if (intervalPrintProgress != -1 )
			clearInterval(intervalPrintProgress);
        intervalPrintProgress = -1;
    }
}

function onPrintProgressChange(){
	var interval = parseInt(document.getElementById('printProgressInterval_check').value);
	if (!isNaN(interval) && interval > 0 && interval < 301 )
		on_autocheck_PrintProgress();
	else {
		document.getElementById('autocheck_printprogress').checked = false;
		document.getElementById('printProgressInterval_check').value = 0;
		if (interval != 0)
			alertdlg (translate_text_item("Out of range"), translate_text_item( "Value of auto-check must be between 0s and 300s !!"));
		on_autocheck_PrintProgress();
	}
}

function getPrintProgress(){
	var command = "M27";
	SendPrinterCommand(command, false, process_PrintProgress ,null ,105 , 1);
}

function process_PrintProgress(response){
	try{
		response=response.trim();
		var p_start=response.indexOf("SD printing byte ");
		var p_slash=response.indexOf("/");
		if(p_start>-1 && p_slash>-1 && p_start<p_slash && response.length>=20) {
			var progress=parseInt(response.substring(p_start+17,p_slash));
			var total=parseInt(response.substring(p_slash+1,response.length));

			if(isNaN(progress) ||isNaN(total))
				throw response;

			var procent=progress*100/total;
			document.getElementById("printProgressbar").innerHTML = procent+"% (Line: "+progress+"/"+total+")";
			document.getElementById("printProgressbar").setAttribute("aria-valuenow",progress);
			document.getElementById("printProgressbar").setAttribute("aria-valuemax",total);
			document.getElementById("printProgressbar").setAttribute("style","width: "+procent+"%");

			if(progress>=total) {
				document.getElementById("printProgressbar").setAttribute("class","progress-bar progress-bar-striped");
				document.getElementById("printProgressbar").setAttribute("style","width: "+procent+"%; background-color:#28a745;");
			}
			else {
				document.getElementById("printProgressbar").setAttribute("class","progress-bar progress-bar-striped active");
				document.getElementById("printProgressbar").setAttribute("style","width: "+procent+"%");
			}
		}
		else if(response.indexOf("Not SD printing")!=-1) {
			document.getElementById("printProgressbar").setAttribute("class","progress-bar");
			document.getElementById("printProgressbar").innerHTML = "No File is Printing from the SD Card";
			document.getElementById("printProgressbar").setAttribute("aria-valuenow","100");
			document.getElementById("printProgressbar").setAttribute("aria-valuemax","100");
			document.getElementById("printProgressbar").setAttribute("style","width: 100%");
		}
		else {
			throw response;
		}
	}	
	catch (e)
	{
		document.getElementById("printProgressbar").setAttribute("class","progress-bar");
		document.getElementById("printProgressbar").innerHTML = "Unknown Response:\n"+e;
		document.getElementById("printProgressbar").setAttribute("aria-valuenow","100");
		document.getElementById("printProgressbar").setAttribute("aria-valuemax","100");
		document.getElementById("printProgressbar").setAttribute("style","width: 100%; background-color:#ffc107;");		
	}

}