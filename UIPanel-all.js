/*
This file is part of UIPanel.

UIPanel is free software: you can redistribute it and/or modify it under the terms of
the GNU General Public License as published by the Free Software Foundation, either
version 3 of the License, or (at your option) any later version.

UIPanel is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar.
If not, see <https://www.gnu.org/licenses/>.
*/

// noinspection JSSuspiciousNameCombination

class UIPanel {
	constructor() {
		this.element = U.DCE("div", "uiPanel");
		this.children = [];
	}

	appendChild(el) {
		if (el instanceof UIPanel) {
			this.element.appendChild(el.element);
			if (!this.children.includes(el))
				this.children.push(el);
		}
		else
			this.element.appendChild(el);
		return this;
	}

	prependChild(el) {
		if (el instanceof UIPanel) {
			this.element.prepend(el.element);
			if (!this.children.includes(el))
				this.children.unshift(el);
		}
		else
			this.element.prepend(el);
		return this;
	}

	removeChild(el) {
		try {
			if (el instanceof UIPanel) {
				this.element.removeChild(el.element);
				var idx = this.children.indexOf(el);
				if (idx !== -1)
					this.children.splice(idx, 1);
			}
			else
				this.element.removeChild(el);
			return this;
		} catch (e) {
			return this;
		}
	}

	removeAll() {
		this.children.length = 0;
		var e = this.element;
		while (e.firstChild) {
			e.firstChild.remove();
		}
	}

	/**
	 * Set whether alternate children of this UIPanel have the alt-shade attribute set
	 * and are thus highlighted.
	 * This function must be re-called after adding additional children.
	 * @param val True to highlight, false to remove highlight
	 */
	setHighlightAlternate(val){
		var t = this;
		for(var x = 0; x < t.children.length; x++){
			if((x % 2) && val)
				t.children[x].addClass("alt-shade");
			else
				t.children[x].removeClass("alt-shade");
		}
	}

	/**
	 * Function to call when this element's size changes.
	 * This function recursively calculates the size for all children,
	 * and then recursively applies the sizes.
	 * @caution To avoid layout thrashing, call this function on the root if possible
	 */
	resize() {
		this.calcSize();
		this.applySize();
	}

	/**
	 * Apply a JSON-based style to this object and its children.
	 * The style can either be a JSON object in the form of
	 * {class: {key1: value1, key2:value2...}, class2...}
	 * or an array of such objects.
	 * @param obj JSON style object
	 */
	applyStyle(obj) {
		if (Array.isArray(obj)) {
			for (var i = 0; i < obj.length; i++) {
				for (var x = 0; x < this.children.length; x++) {
					this.children[x].applyStyle(obj[i]);
				}
			}
		} else {
			for (var x = 0; x < this.children.length; x++) {
				this.children[x].applyStyle(obj);
			}
		}
	}
	update() {
		for (var x = 0; x < this.children.length; x++) { this.children[x].update(); }
	}
	calcSize() {
		for (var x = 0; x < this.children.length; x++) { this.children[x].calcSize(); }
	}
	applySize() {
		for (var x = 0; x < this.children.length; x++) { this.children[x].applySize(); }
	}

	/**
	 * Get a property from a style object
	 * @param obj style object
	 * @param property name of property to get
	 * @param oldVal value to return if style not found
	 */
	getApplyStyle(obj, property, oldVal) {
		var cls = this.element.classList;
		for (var x = 0; x < cls.length; x++) {
			var c = cls[x];
			if (obj[c] && obj[c][property]) {
				return obj[c][property];
			}
		}
		return oldVal;
	}

	getElement() {
		return this.element;
	}

	addClass(name) {
		this.element.classList.add(name); return this;
	}
	removeClass(name) {
		this.element.classList.remove(name); return this;
	}
	hasClass(name) {
		return this.element.classList.contains(name);
	}
	toggleClass(name) {
		if(this.hasClass(name))
			this.removeClass(name);
		else
			this.addClass(name);
	}

	hide() { this.setStyle("display", "none"); }
	show() { this.setStyle("display", null); }

	setStyle(name, value) { this.element.style[name] = value; return this; }
	setStyles(n1, n2, v) {
		this.setStyle(n1, v);
		this.setStyle(n2, v);
		return this;
	}
	// Shortcut to set flex-grow and flex-shrink.
	// Higher values makes the element more stretchy
	setElasticity(x) {
		this.setStyles("flexGrow", "flexShrink", x);
		return this;
	}
}


class TextField extends UIPanel{
	constructor(txt, useHtml){
		super();
		this.addClass("textField");
		if(txt != null){
			if(useHtml) this.setHtml(txt);
			else this.setText(txt);
		}
	}
	getHtml(){
		return this.element.innerHTML;
	}
	getText(){
		return this.element.textContent;
	}
	setText(txt){
		this.element.textContent = txt; return this;}
	setHtml(html){
		this.element.innerHTML = html; return this;}
}

class EditTextField extends UIPanel{
	constructor(txt, sz){
		super();
		var t = this;
		t.addClass("editTextField");
		t.input = U.DCE("input");
		t.input.type = "text";
		t.element.appendChild(t.input);
		if(txt != null)
			t.setText(txt);
		if(sz != null)
			t.setSize(sz);
	}
	addEditListener(f){
		this.input.addEventListener("change", f);
	}
	setEditable(val){
		this.input.readOnly = !val;
	}
	getText(){
		return this.input.value;
	}
	getValue(){
		return this.getText();
	}
	setText(txt){
		this.input.value = txt; return this;
	}
	setSize(x){
		this.input.size = x;
	}
}

// Maybe we need a SimpleButtonField with less weight
class ButtonField extends UIPanel {
	constructor(btnText, fullSize, useHtml) {
		super();
		var t = this;
		t.LONG_PRESS_TIME = 500;
		t.clickListeners = [];
		t.longClickListeners = [];
		t.adjustListeners = [];
		t.setFullSize(fullSize);
		t.btn = U.DCE("button");
		t.mouseTmr = 0; // Timer for long press - mouse
		t.touchTmr = 0; // Timer for long press - touch
		t._origY = null; // Original y-coordinate for button drag
		t.adjustDivider = 1;
		t.addClass("buttonField");
		t.appendChild(t.btn);
		if (useHtml)
			t.setHtml(btnText);
		else
			t.setText(btnText);
		t.btn.addEventListener("click", t.click.bind(t));
		t.btn.addEventListener("mousedown", function (e) {
			t.mouseTmr = setTimeout(t.longClickMouse.bind(t), t.LONG_PRESS_TIME);
			t.mouseLKD = false;
		});
		t.btn.addEventListener("mouseleave", t.LCMCancel.bind(t));
		t.btn.addEventListener("mouseup", t.LCMCancel.bind(t));

		t.btn.addEventListener("touchstart", function(e){
			t.touchTmr = setTimeout(t.longClickTouch.bind(t), t.LONG_PRESS_TIME);
			t.touchLKD = false;
		});
		t.btn.addEventListener("touchmove", function(e){
			// console.log("TouchMove", e);
			if(e.targetTouches.length > 1)
				t.LCTCancel();
			else {
				var touch = e.targetTouches[0];
				var el = document.elementFromPoint(touch.clientX, touch.clientY);
				if(touch.target !== el){
					t.LCTCancel();
					if(t._origY == null){
						t._origY = touch.screenY;
						t._adivDx = 0;
						t._adjMs = Date.now();
					}
				}
				if(t._origY != null){
					var diff = touch.screenY - t._origY;
					var diffDiv = Math.round(diff / t.adjustDivider);
					if(diffDiv !== t._adivX){
						var o = t._adivX | 0;
						var tm = Date.now();
						t._adivX = diffDiv;
						t.adjust(diffDiv, false, t._adivX - o, tm - t._adjMs);
						t._adjMs = tm;
					}
				}
			}
		});
		t.btn.addEventListener("touchend", function (e) {
			if(t._origY != null){
				t.adjust(t._adivX, true, 0, Date.now() - t._adjMs);
			}
			t._origY = null;
			t._adivX = null;
			t.LCTCancel();
			if (!t.enabled) return;
			e.uCanceledBy = t;
		});
		t.enabled = true;
	}

	setButtonStyle(name, value){
		this.btn.style[name] = value;
		return this;
	}

	LCMCancel(){ // Long Click - Mouse - Cancel
		var t = this;
		if (t.mouseTmr) clearTimeout(t.mouseTmr); t.mouseTmr = 0;
	}

	LCTCancel(){ // Long Click - Touch - Cancel
		var t = this;
		if (t.touchTmr) clearTimeout(t.touchTmr); t.touchTmr = 0;
	}

	longClickMouse(){
		if(this.mouseLKD) return;
		this.mouseLKD = true;
		this.longClick();
	}
	longClickTouch(){
		if(this.touchLKD) return;
		this.touchLKD = true;
		this.longClick();
	}

	longClick(){
		for (var x = 0; x < this.longClickListeners.length; x++)
			this.longClickListeners[x](this);
	}

	adjust(amt, done, diff, dTime){
		for (var x = 0; x < this.adjustListeners.length; x++)
			this.adjustListeners[x](this, amt, done, diff, dTime);
	}
	setAdjustDivider(a){
		this.adjustDivider = a;
	}

	click(e) {
		var t = this;
		if (!t.kbSupported && e && e.offsetX === 0 && e.offsetY === 0 && e.pageX === 0 && e.pageY === 0
			&& e.screenX === 0 && e.screenY === 0)
			return;
		if (!t.enabled)
			return; // Disabled
		if(t.mouseLKD) // Long Click disable
			return;
		// console.log("Click");
		for (var x = 0; x < t.clickListeners.length; x++)
			t.clickListeners[x](this);
		t.btn.classList.add("click");
		if (t.timeout)
			clearTimeout(t.timeout);
		t.timeout = setTimeout(function () {
			t.btn.classList.remove("click");
		}, 100);
	}
	setKeyboardSupport(x) {
		this.kbSupported = x;
	}
	setBorderColor(col) {
		this.btn.style.borderColor = col;
		return this;
	}
	setBgColor(col) {
		this.btn.style.background = col;
		return this;
	}
	setfgColor(col) {
		this.btn.style.color = col;
		return this;
	}
	setBorder(bd) {
		this.btn.style.border = bd;
		return this;
	}
	setEnabled(e) {
		var t = this;
		t.enabled = e;
		if (!e) t.btn.classList.add("disabled");
		else t.btn.classList.remove("disabled");
	}
	setSelected(sel) {
		var c = this.btn.classList;
		if (sel) c.add("sel");
		else c.remove("sel");
	}
	setFullSize(sz) {
		if (sz) this.addClass("fullSize");
		else this.removeClass("fullSize");
		return this;
	}
	setText(t) {
		this.btn.innerText = t;
		return this;
	}
	getText() {
		return this.btn.innerText;
	}
	setHtml(t) {
		this.btn.innerHTML = t;
		return this;
	}
	setFontSize(sz) {
		this.btn.style.fontSize = sz;
		return this;
	}
	addClickListener(f) {
		if (!this.clickListeners.includes(f))
			this.clickListeners.push(f);
		return this;
	}
	addLongClickListener(f) {
		if (!this.longClickListeners.includes(f))
			this.longClickListeners.push(f);
		return this;
	}
	addAdjustListener(f) {
		if (!this.adjustListeners.includes(f))
			this.adjustListeners.push(f);
		return this;
	}
}


class CheckboxField extends UIPanel {
	constructor(initVal) {
		super();
		var t = this;
		var label = U.DCE("label", "switch");
		var input = U.DCE("input");
		t.box = input;
		input.type = "checkbox";
		if(initVal)
			input.checked = true;
		var span = U.DCE("span", "slider");
		label.appendChild(input);
		label.appendChild(span);
		t.element.appendChild(label);
		t.addClass('checkboxField');
	}
	addChangeListener(f){
		this.box.addEventListener("change", f);
	}
	setValue(bool){
		this.box.checked = bool;
	}
	getValue(){
		return this.box.checked;
	}
}


class Dialog{
	constructor(name){
		// console.log("Dialog " + name);
		var t = this;
		t.panel = new UIPanel().addClass("dialog"); // Covers the page
		t.box = new UIPanel().addClass("dialogBox"); // Box inside t.panel
		t.panel.appendChild(t.box);
		t.titleHolder = new UIPanel().addClass("titleHolder");
		t.titleBar = new TextField(name, true);
		t.titleHolder.appendChild(t.titleBar);
		t.closeBtn = new ButtonField("X").addClass("dialogCloseBtn");
		t.titleHolder.appendChild(t.closeBtn);
		t.box.appendChild(t.titleHolder);
		t.body = new UIPanel().addClass("dialogBody");
		var hldr = new UIPanel().addClass("dlgBodyHolder");
		hldr.appendChild(t.body);
		t.box.appendChild(hldr);

		t.closeBtn.addClickListener(function(){
			t.close();
		});
	}
	setId(id){
		this.panel.element.id = id;
	}
	appendChild(el){this.body.appendChild(el);}
	prependChild(el){this.body.prependChild(el);}
	removeChild(el){this.body.removeChild(el);}
	setCloseEnabled(n){
		this.closeBtn.setEnabled(n);
	}
	close(){
		var t = this;
		var res = t.onClose ? t.onClose() : null;
		if(res !== false)
			t.remove();
	}
	setTitle(str){
		this.titleBar.setText(str);
	}
	show(){
		var t = this;
		setTimeout(function(){
			t.panel.addClass("showing");
		}, 0);
		document.body.appendChild(t.panel.element);
	}
	remove(){
		var t = this;
		t.panel.removeClass("showing");
		t.box.setStyle("pointerEvents", "none");
		setTimeout(function(){
			var e = t.panel.element;
			if(e.parentElement)
				e.parentElement.removeChild(e);
		}, 150);
	}
	static isOpen(){
		return document.getElementsByClassName("dialogBox").length;
	}

	static isOpenById(str){
		var el = U.DGE(str);
		return el != null;
	}

	static removeById(str){
		var el = U.DGE(str);
		if(el){
			el.classList.remove("showing");
			setTimeout(function(){if(el.parentElement) el.parentElement.removeChild(el)}, 150);
		}
	}
}

class ConfirmationDialog extends Dialog{
	constructor(name, fn){
		super(name);
		var btn = new ButtonField("Confirm").addClass("dlgConfirmBtn");
		this.body.appendChild(btn);
		btn.addClickListener(fn);
	}
}

class OkayDialog extends Dialog{
	constructor(name, text){
		super(name);
		var t = this;
		var btn = new ButtonField("OK").addClass("dlgConfirmBtn");
		var txt = new TextField(text, true);
		t.body.appendChild(txt);
		t.body.appendChild(btn);
		btn.addClickListener(function(){
			t.remove();
		});
	}
}



/**
 * Class to display an Image element, maintaining its aspect ratio
 */
class ImageField extends UIPanel{
	constructor(url){
		super();
		var t = this;
		if(url == null)
			url = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; // Blank image
		t.landscape = true;
		t.addClass("imageField");
		t.setStyle("justifyContent", "center");
		t.image = U.DCE("img");
		t.image.src = url;
		t.lastSrc = url;
		t.element.appendChild(t.image);
		t.setResizePolicy();
	}

	calcSize(){
		super.calcSize();
		this.landscape = (this.element.clientWidth > this.element.clientHeight);
	}

	applySize(){
		super.applySize();
		this.setResizePolicy();
	}

	setSrc(src){
		if(this.lastSrc !== src){
			this.image.src = src;
			this.lastSrc = src;
		}
	}

	setResizePolicy(){
		var t = this;
		if(t.landscape !== t._pLandscape){
			var is = t.image.style;
			if(t.landscape){
				is.height = "100%";
				is.width = "auto";
				t.setStyle("flexDirection", "row");
			} else {
				is.height = "auto";
				is.width = "100%";
				t.setStyle("flexDirection", "column");
			}
		}
		t._pLandscape = t.landscape;
	}
}



class NumberField extends UIPanel{
	constructor(format){
		super();
		var t = this;
		t.format = format;
		t.value = 0;
		t.litColorOverride = null;
		t.litColor = "#FFF";
		t.unlitColor = "#111"
		t.bgColor = "#000";
		t.addClass("numberField");
		t.canvas = U.DCE("canvas");
		t.element.appendChild(t.canvas);
		var s = t.canvas.style;
		s.width = "100%";
		s.height = "100%";
		t.ctx = t.canvas.getContext("2d");
	}

	/**
	 * Set a color to override the default lit color
	 * If null, the behavior will return to default
	 * @param c Color as CSS color
	 */
	setLitColorOverride(c){
		this.litColorOverride = c;
	}

	setValue(num){
		this.value = parseInt(num);
	}

	applyStyle(obj){
		super.applyStyle(obj);
		var t = this;
		t.litColor = super.getApplyStyle(obj, "litColor", t.litColor);
		t.unlitColor = super.getApplyStyle(obj, "unlitColor", t.unlitColor);
		t.bgtColor = super.getApplyStyle(obj, "bgColor", t.bgtColor);
	}

	getDigit(pos){
		var t = this;
		var f = t.format;
		var fChar = f.charAt(f.length-pos-1);
		var rtn;
		switch(fChar){
			case "X": rtn = 0; break; // Number or '0'
			case "x": rtn = -1; break; // Number or ' ' if leading zero
			case "n": rtn = -2; break; // Number or ' ' if zero
			case "1": rtn = -3; break; // Number, omit if leading zero
			default: rtn = fChar; break;
		}
		if(typeof rtn == "number"){
			var apos = pos; // Get actual position in the number
			for(var x = pos; x >= 0; x--){
				var c = f.charAt(f.length-x-1);
				if(!(c === 'x' || c === 'X' || c === '1' || c === 'n'))
					apos--;
			}
			switch(fChar){
				case "X":
					return Math.floor(t.value / Math.pow(10, apos) % 10);
				case "x":
				case "1":
					var val = t.value / Math.pow(10, apos);
					if(val >= 1)
						return Math.floor(val % 10);
					else return -1;
				case "n":
					var val = Math.floor(t.value / Math.pow(10, apos) % 10);
					if(val >= 1)
						return val;
					else return -1;
				default:
					return rtn;
			}
		}

		return fChar;
	}
	// @Override
	calcSize(){
		super.calcSize(); var t = this;
		t.width = t.element.clientWidth;
		t.height = t.element.clientHeight;
	}
	// @Override
	applySize(){
		super.applySize(); var t = this;
		t.canvas.width = t.width;
		t.canvas.height = t.height;
		t.update();
	}
	// @Override
	update(){
		super.update();
		var t = this;
		var cw = t.canvas.width;
		var ch = t.canvas.height;
		var ctx = t.ctx;
		if(t.bgColor){
			ctx.fillStyle = t.bgColor;
			ctx.fillRect(0, 0, cw, ch);
		} else {
			ctx.clearRect(0, 0, cw, ch);
		}
		// -------- Digit Length Calculation
		var numDigits = t.format.length; // # of digits in display
		var numGiven = Math.ceil(Math.log(t.value + 0.1) / Math.log(10)); // # of digits in value
		var numLeading = 0; // # of digits that can be tacked on to display if required
		for(var x = 0; x < t.format.length; x++){
			if(t.format.charAt(x) === '1'){
				numLeading++; numDigits--;
			} else break;
		}
		// Tack on leading digits if necessary
		if(numGiven > numDigits){
			numDigits = Math.min(numGiven, numDigits + numLeading);
		}

		// -------- Layout Calculation
		var xStart = cw * 0.1, xEnd = cw * (1-0.1), yStart = ch * 0.1, yEnd = ch*(1-0.1);
		var acw = xEnd - xStart, ach = yEnd - yStart;
		var space = 0.67; // How many digit heights to advance each number
		var fullWidth = ach*space*numDigits - ach*(space-0.5)// Width of all the numbers
		var fullHeight = ach; // Height of all the numbers
		var numStartY = yStart; // Y-coordinate where numbers start
		if(fullWidth > acw){ // Maintain aspect ratio
			var squish = acw / fullWidth;
			fullHeight *= squish;
			fullWidth = acw;
			numStartY += (1-squish)*ach/2;
		}
		// --------Drawing
		// +1 to offset Math.floor() later
		var numStartX = xStart + (acw-fullWidth)/2 + 1; // X-coordinate where numbers start
		for(var x = 0; x < numDigits; x++){
			var thisNum = t.getDigit(numDigits-x-1);
			if(thisNum !== "-" && thisNum !== ":" && thisNum !== " "){
				ctx.fillStyle = t.unlitColor;
				t.drawDigit(ctx, numStartX+x*fullHeight*space, numStartY, fullHeight/2, fullHeight, 8, null);
			}
			ctx.fillStyle = t.litColorOverride ? t.litColorOverride : t.litColor;
			t.drawDigit(ctx, numStartX+x*fullHeight*space, numStartY, fullHeight/2, fullHeight, thisNum, null);
		}
	}

	drawDigit(ctx, xpos, ypos, nw, nh, snum, spChars){
		// Set up variables for drawing
		xpos = Math.floor(xpos); ypos = Math.floor(ypos);
		nw = Math.floor(nw); var nh2 = Math.floor(nh/2);
		nh = Math.floor(nh);
		var sw = Math.floor(nh/8); var svh = Math.floor(nh/2);
		var num = parseInt(snum);
		var sa=num&1,sb=num&2,sc=num&4,sd=num&8,se=num&16,sf=num&32,sg=num&64;
		if(!spChars) sa=sb=sc=sd=se=sf=sg=0;
		// Determine which segments need lit
		if(!spChars && num >= 0 && num <= 10){
			if(num !== 1 && num !== 4 && num !== 10) sa = true;
			if(num !== 5 && num !== 6 && num !== 10) sb = true;
			if(num !== 2 && num !== 10) sc = true;
			if(num !== 1 && num !== 4 && num !== 7 && num !== 9 && num !== 10) sd = true;
			if(num === 0 || num === 2 || num === 6 || num === 8) se = true;
			if(num === 0 || num === 4 || num === 5 || num === 6 || num === 8 || num === 9) sf = true;
			if(num !== 0 && num !== 1 && num !== 7 && num !== 10) sg = true;
			if(num === 10){
				ctx.fillRect(Math.floor(xpos+nw/2-sw/2), ypos+sw, sw, sw);
				ctx.fillRect(Math.floor(xpos+nw/2-sw/2), ypos+nh-sw*2, sw, sw);
			}
		} else if(!spChars && snum === "P"){
			sa=1;sb=1;sc=0;sd=0;se=1;sf=1;sg=1;
		}
		// Draw the lit segments
		if(sa) ctx.fillRect(xpos, ypos, nw, sw);
		if(sb) ctx.fillRect(xpos+nw-sw, ypos, sw, svh);
		if(sc) ctx.fillRect(xpos+nw-sw, ypos+nh2, sw, svh);
		if(sd) ctx.fillRect(xpos, Math.floor(ypos+nh*0.875+1), nw, sw);
		if(se) ctx.fillRect(xpos, ypos+nh2, sw, svh);
		if(sf) ctx.fillRect(xpos, ypos, sw, svh);
		if(sg) ctx.fillRect(xpos, Math.floor(ypos+nh*0.4375+1), nw, sw);
		else if(snum === "-"){
			ctx.fillRect(xpos, Math.floor(ypos+nh*0.4375+1), nw, sw);
		}
		else if(snum === ":"){
			ctx.fillRect(Math.floor(xpos+(nw-sw)/2), Math.floor(ypos+(nh-sw)*0.25),sw,sw);
			ctx.fillRect(Math.floor(xpos+(nw-sw)/2), Math.floor(ypos+(nh-sw)*0.75),sw,sw);
		}
	}
}

class ProgressBarField extends TextField{
	constructor(txt){
		super(txt);
		var t = this;
		t.addClass("progressBarField");
	}
	setColors(col1, col2){
		this.color1 = col1;
		this.color2 = col2;
		this.style();
	}
	setProgress(pct){
		this.progress = pct;
		this.style();
	}
	style(){
		this.setStyle("background", "linear-gradient(90deg, "+this.color1+" "+
			(this.progress-0.05)+"%, "+this.color2+" "+(this.progress+0.05)+"%)");
	}
	addClickListener(f){
		this.element.addEventListener("click", f);
	}
}



class TabSelector extends UIPanel {
	constructor(isVertical) {
		super();
		var t = this;
		t._autosel = true;
		t.addClass("tabSelector");
		if(isVertical)
			t.addClass("vertical");
		t.items = [];
		t.selObvs = new Set(); // Selection Observers
		t.selected = "";
		t.mobile = new TabSelectorMobile(this);
		t.appendChild(t.mobile);
		t.setMobileMode(false);
	}

	getTabNames(){
		var t = this;
		var rtn = [];
		for(var x = 0; x < t.items.length; x++){
			rtn.push(t.items[x].element.dataset.name);
		}
		return rtn;
	}

	setDelineate(val){
		if(val) this.addClass("ts-delineate");
		else this.removeClass("ts-delineate");
	}

	/**
	 * Set whether clicking the tab automatically selects it.
	 * Defaults to true
	 */
	setAutoSelect(x){
		this._autosel = x;
	}
	addIcon(img) {
		var t = this;
		if (t._iconField)
			t.removeIcon();
		if (!img)
			return;
		var addend = new ImageField(img).addClass("tabSelectorIcon");
		t._iconField = addend;
		t.prependChild(addend);
	}

	removeIcon() {
		var t = this;
		if (t._iconField) {
			t.removeChild(t._iconField);
			t._iconField = null;
		}
	}

	addTab(html, name, noSelect) {
		var t = this;
		var addend = new TabSelectorItem(html, name, t);
		addend.setSelectable(!noSelect);
		t.appendChild(addend);
		t.items.push(addend);
	}
	addSelectionListener(func) {
		if (typeof func == "function") this.selObvs.add(func);
	}
	removeSelectionListener(func) { this.selObvs.remove(func) }
	notifySelect(x) {
		this.selObvs.forEach(function (f) {
			f.call(null, x);
		});
	}

	setMaxVisible(num) {
		for (var x = 0; x < this.items.length; x++) {
			this.items[x].setStyle("display", x >= num ? "none" : "");
		}
	}

	/**
	 * Set a selection by calling the (normally click-triggered) selection handler
	 * This will still work even if autoSel is disabled by setAutoSelect()
	 * @param name Name of tab to click on
	 */
	setSelectedClick(name) {
		this.onSelect(name, true, true);
	}

	/**
	 * Selection handler
	 * @param name Event that was clicked
	 * @param noUpdate True to not call notifySelect()
	 * @param noClick True if not caused by click. Use to override autoSel
	 */
	onSelect(name, noUpdate, noClick) {
		var t = this;
		var i = t.getItem(name);
		if(!i) return;
		if (t.selected !== name) {
			if (i.selectable && (t._autosel || noClick)) {
				t.selected = name;
				t.setHighlighted(name);
			}
			if(!noUpdate)
				t.notifySelect(name);
		}
	}
	getItem(name) {
		for (var x = 0; x < this.items.length; x++) {
			var i = this.items[x];
			if (i.element.dataset.name === name)
				return i;
		}
	}
	setHighlighted(name) {
		for (var x = 0; x < this.items.length; x++) {
			var i = this.items[x];
			if (i.element.dataset.name === name) {
				i.setSelected(true);
				this.mobile.setLabel(i.getHtml() + " &#9660;");
			} else {
				i.setSelected(false);
			}
		}
	}

	calcSize() {
		var t = this;
		t._cWid = t.element.clientWidth;
		t._sWid = t.element.scrollWidth;
	}

	applySize() {
		this.setMobileMode(this._sWid > this._cWid + 1);
	}

	setMobileMode(mbl){
		var t = this;
		t.mobile.setStyle("display", mbl?"":"none");
		for(var x = 0; x < t.items.length; x++)
			t.items[x].element.style.visibility = mbl?"hidden":"";
	}
}

class TabSelectorMobile extends UIPanel {
	constructor(tsMain) {
		super();
		var t = this;
		t.tsMain = tsMain;
		t.setStyles("flexGrow", "flexShrink", "0")
			.setStyle("position", "relative")
			.setStyle("overflow", "visible");
		t.main = new UIPanel();
		t.main.setStyle("position", "absolute")
			.setStyle("alignItems", "baseline")
			.setStyle("flexDirection", "column");
		t.main.addClass("tabSelectorMobile");
		t.appendChild(t.main);
		t.curLbl = new TabSelectorItem("Uhh...", null, t);
		t.main.appendChild(t.curLbl);
		t.dropdown = new UIPanel()
			.setStyle("flexDirection", "column")
			.setStyle("position", "fixed")
			.setStyle("zIndex", "2")
			.setStyle("transform", "translateY(1.5em)")
			.addClass("tabSelectorMobileDD");
		t.main.appendChild(t.dropdown);
		t.element.setAttribute("tabindex", "0");
		t.element.addEventListener("focusout", t.onFocusOut.bind(t));

		if (!window.TAB)
			window.TAB = t;
	}

	setLabel(curr) {
		var c = this.curLbl;
		c.setHtml(curr);
	}

	onFocusOut(){
		this.showing = true;
		this.onSelect("null");
	}
	onSelect(name) {
		var t = this;
		t.showing = !t.showing;
		if (!t.showing) {
			t.dropdown.removeAll();
			t.dropdown.setStyle("borderTop", "");
		}
		else {
			t.dropdown.setStyle("borderTop", "1px solid var(--pure-bg)");
			var itms = t.tsMain.items;
			for (var x = 0; x < itms.length; x++) {
				// if(!itms[x].isDisplayable())
				// 	continue;
				var ts = new TabSelectorItem(itms[x].getHtml(), itms[x].getName(), this)
					.setStyle("width", "100%")
					.setStyle("justifyContent", "left")
					.setStyles("paddingTop", "paddingBottom", "0.5em");
				if (itms[x].isSelected())
					ts.setSelected(true);
				t.dropdown.appendChild(ts);
			}
		}
		if (name !== "null") {
			t.tsMain.onSelect(name);
		}
	}
}

class TabSelectorItem extends TextField {
	constructor(str, name, parent) {
		super();
		var t = this;
		t.setHtml(str).addClass("tabSelectorItem").setElasticity(0);
		t.parent = parent;
		t.element.dataset.name = name;
		t.selectable = true;
		t.element.addEventListener("mouseenter", t.enter.bind(t));
		t.element.addEventListener("mouseleave", t.leave.bind(t));
		t.element.addEventListener("click", t.click.bind(t));
	}
	getName() {
		return this.element.dataset.name;
	}
	setSelected(val) {
		if (val) this.addClass("selected");
		else this.removeClass("selected");
	}
	isSelected() {
		return this.hasClass("selected");
	}

	/**
	 * @Deprecated
	 * @returns {boolean} Whether the element should be displayed on the screen
	 */
	isDisplayable(){
		return this.element.style.display !== "none";
	}
	setSelectable(val) {
		this.selectable = val;
	}
	enter(e) {
		this.addClass("hovering");
	}
	leave(e) {
		this.removeClass("hovering");
	}
	click(e) {
		this.clickEl(e.target);
	}
	clickEl(e) {
		if (e.dataset.name)
			this.parent.onSelect(e.dataset.name);
		else
			this.clickEl(e.parentElement);
	}
}


// Toast objects are created to inform the user that something has happened.
// The constructor attaches the toast to the end of the DOM, shows automatically,
// and deletes itself when done.
class Toast {
	constructor(message, delay1) {
		if(!delay1) delay1 = 2500;
		var delay2 = 500;
		var oldEl = U.DGE("toastEl");
		if(oldEl){
			oldEl.parentElement.removeChild(oldEl);
			clearTimeout(oldEl.tTmrId);
		}
		var el = U.DCE("div", "toast");
		el.id = "toastEl";
		var el2 = U.DCE("span");
		el2.innerText = message;
		el.appendChild(el2);
		// if (!window.Toast_ToastRoot)
		document.body.appendChild(el);
		// else
		// 	window.Toast_ToastRoot.appendChild(el);
		el.tTmrId = setTimeout(function(){
			el.classList.add("ending");
			setTimeout(function(){
				if(el.parentElement)
					el.parentElement.removeChild(el);
			}, delay2);
		}, delay1);
	}
}

// function ToastSetRoot(id) {
//     window.Toast_ToastRoot = DGE(id);
// }