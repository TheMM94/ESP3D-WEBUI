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

function Pritner_UploadUpdatefile() {
    confirmdlg(translate_text_item("Please confirm"), translate_text_item("Update Pritner Firmware ?"), Printer_StartUploadUpdatefile)
}

function Printer_StartUploadUpdatefile( response) {
	if (response != "yes") 
		return;
    if (http_communication_locked) {
        alertdlg (translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."));
    	return;
	}
	
	SendGetHttp("/fwUpdate?test654321", null, null);

}

function printer_checkupdatefile(){

	SendGetHttp("/fwUpdate?test01234", null, null);
	return;

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