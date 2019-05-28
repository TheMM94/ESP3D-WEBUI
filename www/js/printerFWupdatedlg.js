var printer_update_ongoing=false;
var printer_current_update_filename="";
//pritner update dialog
function printerFWupdatedlg () {
    var modal = setactiveModal('printerFWupdatedlg.html');
	if ( modal == null) 
		return;
    document.getElementById("printer_fw_file_name").innerHTML=translate_text_item("No file chosen");
    document.getElementById('printer_prgfw').style.display = 'none';
    document.getElementById('printer_uploadfw-button').style.display = 'none';
    document.getElementById('printer_updatemsg').innerHTML = "";
    document.getElementById('printer_fw-select').value="";
	if (target_firmware == "grbl-embedded")
		document.getElementById('printer_fw_update_dlg_title').innerHTML= translate_text_item("3D Printer Firmware Update").replace("ESP3D", "GRBL_ESP32");
	if (target_firmware == "marlin-embedded")
		document.getElementById('printer_fw_update_dlg_title').innerHTML= translate_text_item("3D Printer Firmware Update").replace("ESP3D", "Marlin");
    showModal() ;
}

function printer_closeUpdateDialog(msg){
    if (printer_update_ongoing) {
        alertdlg (translate_text_item("Busy..."), translate_text_item("Update is ongoing, please wait and retry."));
        return;
    }
    closeModal(msg);
}

function printer_checkupdatefile(){

    var files = document.getElementById('printer_fw-select').files;
    document.getElementById('printer_updatemsg').style.display='none';
	if (files.length==0)
		document.getElementById('printer_uploadfw-button').style.display = 'none';
	else 
		document.getElementById('printer_uploadfw-button').style.display = 'block';
    if (files.length >0) {
        if (files.length == 1 ) {
            document.getElementById("printer_fw_file_name").innerHTML = files[0].name;
        }
        else {
            var tmp = translate_text_item("$n files");
            document.getElementById("printer_fw_file_name").innerHTML = tmp.replace("$n", files.length);
        }
    } else {
        document.getElementById("printer_fw_file_name").innerHTML=translate_text_item("No file chosen");
    }

}

function printer_UpdateProgressDisplay(oEvent){
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total)*100;
        document.getElementById('printer_prgfw').value=percentComplete;
        document.getElementById('printer_updatemsg').innerHTML = translate_text_item("Uploading ") + current_update_filename + " " + percentComplete.toFixed(0)+"%" ;
    }
}

function Pritner_UploadUpdatefile() {
    confirmdlg(translate_text_item("Please confirm"), translate_text_item("Update Pritner Firmware ?"), Printer_ResetuC)
}

function Printer_ResetuC(response){
    if (response != "yes") 
        return;
    document.getElementById('printer_updatemsg').innerHTML = translate_text_item("Restarting 3D Printer in Bootloader...");
    SendGetHttp("/StartPrinterFWUpdate", Printer_StartUploadUpdatefile, null);
}

function Printer_StartUploadUpdatefile(response) {
    if (response.indexOf("uC Reset and Erase okay")<0) {
        document.getElementById('printer_updatemsg').innerHTML = translate_text_item("Restarting 3D Printer Faild!!! "+response);
        alertdlg (translate_text_item("Error"), translate_text_item( "Restarting 3D Printer Faild!!! ")+response);
        return;
    }

    if (http_communication_locked) {
        alertdlg (translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."));
        return;
    }
    var files = document.getElementById('printer_fw-select').files
    var formData = new FormData();
    var url = "/UploadePrinterFW";
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var arg ="/" + file.name + "S";
        //append file size first to check updload is complete
        formData.append(arg, file.size);
        formData.append('myfile[]', file, "/"+file.name);
    }
    document.getElementById('printer_fw-select_form').style.display = 'none';
    document.getElementById('printer_uploadfw-button').style.display = 'none';
    update_ongoing=true;
    document.getElementById('printer_updatemsg').style.display='block';
    document.getElementById('printer_prgfw').style.display = 'block';
    if (files.length == 1)
        current_update_filename = files[0].name;
    else 
        current_update_filename = "";
    document.getElementById('printer_updatemsg').innerHTML = translate_text_item("Uploading ") + current_update_filename;
    SendFileHttp(url, formData, printer_UpdateProgressDisplay, printer_updatesuccess, printer_updatefailed)
}

function printer_updatesuccess(response){
    document.getElementById('printer_updatemsg').innerHTML = translate_text_item("Restarting 3D Printer, please wait....");
    document.getElementById("printer_fw_file_name").innerHTML="";
    var i = 0;
	var interval;
	var x = document.getElementById("printer_prgfw");
	x.max=10;
	interval = setInterval(function(){
		i=i+1;
		var x = document.getElementById("printer_prgfw");
		x.value=i;
        document.getElementById('printer_updatemsg').innerHTML = translate_text_item("Restarting 3D Printer, please wait....") + (10-i) +translate_text_item(" seconds") ;
		if (i>10){
            update_ongoing=false;
            clearInterval(interval);
            document.getElementById('printer_updatemsg').innerHTML = translate_text_item("3D Printer Update Finished");
		}
	},1000);
}

function printer_updatefailed(errorcode, response){
    document.getElementById('printer_fw-select_form').style.display = 'block';
    document.getElementById('printer_prgfw').style.display = 'none';
    document.getElementById('printer_uploadfw-button').style.displsay = 'block';
    document.getElementById('printer_updatemsg').innerHTML = translate_text_item("Upload failed : ") + errorcode + "<br>" + response;
    console.log("Error " + errorcode + " : " + response);
    alertdlg (translate_text_item("3D Printer Firmware Update Error"), translate_text_item( "Upload failed : ")+errorcode+ "<br>" +response);
    update_ongoing=false;
}


