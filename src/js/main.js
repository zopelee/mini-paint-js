/* global HELPER, EVENTS, LAYER, POP, FILE, GUI, DRAW */
/* global WIDTH, HEIGHT, canvas_back, canvas_grid, COLOR, ALPHA  */

var MAIN = new MAIN_CLASS();

/**
 * main class - initialize app
 * 
 * @author ViliusL
 */
function MAIN_CLASS() {
  this.init = function (options) {
    var options = options || {}
    if (options.firstLoad) {
      if (options.drawHelpers) {
        GUI.draw_helpers();
      }
      GUI.autodetect_dimensions();
      POP.height_mini = Math.round(POP.width_mini * HEIGHT / WIDTH);
    }
    EVENTS.autosize = true;
    FILE.file_info = {
      general: [],
      exif: [],
    };
    DRAW.select_data = false;

    canvas_back = document.getElementById("canvas_back").getContext("2d");		//layer for grid/transparency
    canvas_front = document.getElementById("canvas_front").getContext("2d");		//tmp layer
    canvas_grid = document.getElementById("canvas_grid").getContext("2d");		//grid layer
    canvas_preview = document.getElementById("canvas_preview").getContext("2d");	//mini preview

    LAYER.reset_layers()
    GUI.init()
    EVENTS.bindAllEvents()

    //init translation
    var lang_cookie = HELPER.getCookie('language');
    if (lang_cookie != '')
      LANG = lang_cookie.replace(/([^a-z]+)/gi, '');
    HELP.help_translate(LANG);

    // init menu
    ddsmoothmenu.init({
      mainmenuid: MENU_ID || "main_menu", //menu DIV id
      orientation: 'h', //Horizontal or vertical menu: Set to "h" or "v"
      classname: 'ddsmoothmenu', //class added to menu's outer DIV
      //customtheme: ["#1c5a80", "#18374a"],
      contentsource: "markup" //"markup" or ["container_id", "path_to_menu_file"]
    })
  };
  this.destroy = function () {
    EVENTS.unbindAllEvents()
    LAYER.layers = []
    DRAW.active_tool = 'select_tool'
  }
}
