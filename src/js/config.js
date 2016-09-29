/**
 * main config file
 * 
 * @author ViliusL
 */

//canvas layers
var canvas_back
var canvas_front
var canvas_grid
var canvas_preview


/**
 * latest 3 saved states of all layers for undo
 */
var layers_archive = [{}, {}, {}];

//global settings
var VERSION = '3.1.1';
var WIDTH;						//canvas midth
var HEIGHT;						//canvas height
var COLOR = '#0000ff';				//active color
var ALPHA = 255;					//active color alpha
var LANG = 'en';					//active language

var DRAW_TOOLS_CONFIG = [
  {name: 'select_tool', title: 'Select object tool', icon: [null, 0 + 7, 2], attributes: {}},
  {name: 'select_square', title: 'Select area tool', icon: [null, -50 + 4, 5], attributes: {}},
  {name: 'magic_wand', title: 'Magic Wand Tool', icon: [null, -150 + 1, -50 + 2], attributes: {power: 40, anti_aliasing: true}},
  {name: 'erase', title: 'Erase', icon: [null, -100 + 3, 4], attributes: {size: 20, circle: true, strict: true}},
  {name: 'fill', title: 'Fill', icon: [null, -150 + 3, 3], attributes: {power: 0, anti_aliasing: false}},
  {name: 'pick_color', title: 'Pick Color', icon: [null, -200 + 3, 3], attributes: {}},
  {name: 'pencil', title: 'Pencil', icon: [null, -250 + 3, 3], attributes: {}},
  {name: 'line', title: 'Draw line', icon: [null, -300 + 3, 3], attributes: {size: 1, type_values: ['Simple', 'Multi-line', 'Arrow', 'Curve']}},
  {name: 'letters', title: 'Draw letters', icon: [null, -350 + 3, 4], attributes: {}},
  {name: 'draw_square', title: 'Draw rectangle', icon: [null, -400 + 3, 5], attributes: {fill: false, square: false}},
  {name: 'draw_circle', title: 'Draw circle', icon: [null, -450 + 3, 5], attributes: {fill: false, circle: false}},
  {name: 'brush', title: 'Brush', icon: [null, -500 + 6, 3], attributes: {type: 'Brush', type_values: ['Brush', 'BezierCurve', 'Chrome', 'Fur', 'Grouped', 'Shaded', 'Sketchy'], size: 5, anti_aliasing: false}, on_update: 'update_brush', },
  {name: 'blur_tool', title: 'Blur tool', icon: [null, -250 + 5, -50 + 2], attributes: {size: 30, power: 1}},
  {name: 'sharpen_tool', title: 'Sharpen tool', icon: [null, -300 + 5, -50 + 2], attributes: {size: 30}},
  {name: 'burn_dodge_tool', title: 'Burn/Dodge tool', icon: [null, -500 + 3, -50 + 4], attributes: {burn: true, size: 30, power: 50}},
  {name: 'desaturate_tool', title: 'Desaturate', icon: [null, -550 + 3, -00 + 4], attributes: {size: 50, anti_aliasing: true}},
  {name: 'clone_tool', title: 'Clone tool', icon: [null, -350 + 4, -50 + 3], attributes: {size: 30, anti_aliasing: true}},
  {name: 'gradient_tool', title: 'Gradient', icon: [null, -400 + 3, -50 + 4], attributes: {radial: false, power: 50}},
  {name: 'crop_tool', title: 'Crop', icon: [null, -450 + 2, -50 + 2], attributes: {}},
];

// colors
var COLORS_DATA = [
  ['#ff0000', '#ff5b31', '#ffa500', '#ff007f', '#ff00ff'], //red
  ['#00ff00', '#008000', '#7fff00', '#00ff7f', '#8ac273'], //green
  ['#0000ff', '#007fff', '#37629c', '#000080', '#8000ff'], //blue
  ['#ffff00', '#ffff80', '#ddd06a', '#808000', '#bcb88a'], //yellow
  ['#ffffff', '#c0c0c0', '#808080', '#404040', '#000000'], //grey
]

// menu
// override
ddsmoothmenu.arrowimages = {down: ['downarrowclass', '', 23], right: ['rightarrowclass', '', 6], left: ['leftarrowclass', '']}
var MENU_ID = 'main_menu'