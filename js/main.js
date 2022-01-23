"use strict";
let configIdCount = 0;
const code = document.getElementById("code");
const codeDiv = document.getElementById("code-div");
const inputForm = document.querySelector(".form-outline");
const numberRegex = /^\-?\d*\.?\d*$/;
const modiconCheck = document.getElementById("modicon-check");
const formInputs = Array.from(document.getElementsByClassName("input-code"));
const advancedToggle = document.getElementById("advanced-toggle");
const replacements = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "\\&quot;",
    "'": "&#039;",
    "\n": "<br>",
    " ": "&nbsp"
};
const str = '[' + Object.keys(replacements)
    .join('')
    .replace(']', '\\]') + ']';
var pattern = new RegExp(str, 'g');
function escapeText(text) {
    return text.replaceAll(pattern, match => {
        return replacements[match];
    });
}
let dstEmojis = {
    "abigail": "󰀜",
    "alchemy": "󰀝",
    "arcane": "󰀀",
    "backpack": "󰀞",
    "battle": "󰀘",
    "beefalo": "󰀁",
    "beehive": "󰀟",
    "berry": "󰀠",
    "carrot": "󰀡",
    "chest": "󰀂",
    "chester": "󰀃",
    "crockpot": "󰀄",
    "egg": "󰀢",
    "eyeball": "󰀅",
    "eyeplant": "󰀣",
    "faketeeth": "󰀆",
    "farm": "󰀇",
    "fire": "󰀈",
    "firepit": "󰀤",
    "flex": "󰀙",
    "ghost": "󰀉",
    "gold": "󰀚",
    "grave": "󰀊",
    "hambat": "󰀋",
    "hammer": "󰀌",
    "heart": "󰀍",
    "horn": "󰀥",
    "hunger": "󰀎",
    "lightbulb": "󰀏",
    "meat": "󰀦",
    "pig": "󰀐",
    "poop": "󰀑",
    "redgem": "󰀒",
    "refine": "󰀧",
    "salt": "󰀨",
    "sanity": "󰀓",
    "sciencemachine": "󰀔",
    "shadow": "󰀩",
    "shovel": "󰀪",
    "skull": "󰀕",
    "thumbsup": "󰀫",
    "tophat": "󰀖",
    "torch": "󰀛",
    "trap": "󰀬",
    "trophy": "󰀭",
    "wave": "󰀮",
    "web": "󰀗",
    "wormhole": "󰀯"
};
function emojiCompletions(input) {
    const formFloating = input.parentElement;
    if (formFloating === null)
        throw new Error(input.className + ' : ' + input.parentElement?.className);
    let completion = formFloating.querySelector(".completion");
    const s = input.value.substring(0, input.selectionStart || -1);
    const match = /:(\w+)$/.exec(s);
    if (match === null) {
        completion?.remove();
        return;
    }
    let code = `<div class="dropdown-menu-lg-end">`;
    let count = 0;
    for (const emojiName in dstEmojis) {
        if (emojiName.startsWith(match[1])) {
            code += `<a class="dropdown-item${count ? '' : ' focused-completion'}">
                       <img src="emojis/${emojiName}.png"
                         alt="${dstEmojis[emojiName]}"
                         width=36>
                       <b>:${match[1]}</b>${emojiName.slice(match[1].length)}:
                     </a>`;
            count++;
        }
        if (count > 10)
            break;
    }
    if (!count) {
        completion?.remove();
        return;
    }
    code += `</div>`;
    if (completion instanceof HTMLDivElement) {
        completion.innerHTML = code;
    }
    else {
        completion = document.createElement("div");
        completion.className = "completion";
        completion.innerHTML = code;
        formFloating.appendChild(completion);
    }
    const inputRect = input.getBoundingClientRect();
    completion.style.top = inputRect.height + "px";
    completion.style.width = input.clientWidth + "px";
    //completion.style.left = inputRect.left + "px"
}
function listenCompleteEmoji(input) {
    input.addEventListener("click", () => emojiCompletions(input));
    input.addEventListener("focus", () => emojiCompletions(input));
    input.addEventListener("input", () => emojiCompletions(input));
    input.addEventListener("-focusout", () => {
        input.parentElement?.querySelector(".completion")?.remove();
    });
    input.addEventListener("keydown", e => {
        if (!(e instanceof KeyboardEvent))
            throw new Error("Annoying I have to do this.");
        const completion = input.parentElement?.querySelector(".dropdown-menu-lg-end");
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
                window.setTimeout(() => emojiCompletions(input), 1);
                break;
            case 'Tab':
            case 'ArrowDown': {
                if (typeof completion === 'undefined' || completion === null)
                    return;
                if (typeof completion.children === "undefined")
                    throw new Error();
                e.preventDefault();
                for (let i = 0; i < completion.children.length; i++) {
                    if (completion.children[i].classList.contains("focused-completion")) {
                        let newFocus = completion.children[i + 1];
                        if (!(newFocus instanceof HTMLElement))
                            newFocus = completion.children[0];
                        if (!(newFocus instanceof HTMLElement))
                            new Error();
                        completion.children[i].classList.remove("focused-completion");
                        newFocus.classList.add("focused-completion");
                        return;
                    }
                }
                if (!(completion.children[0] instanceof HTMLDivElement))
                    throw new Error();
                completion.children[0].classList.add("focused-completion");
                break;
            }
            case 'ArrowUp': {
                if (typeof completion === 'undefined' || completion === null)
                    return;
                if (typeof completion.children === "undefined")
                    throw new Error();
                e.preventDefault();
                for (let i = 0; i < completion.children.length; i++) {
                    if (completion.children[i].classList.contains("focused-completion")) {
                        let newFocus = completion.children[i - 1];
                        if (!(newFocus instanceof HTMLElement))
                            newFocus = completion.children[completion.children.length - 1];
                        if (!(newFocus instanceof HTMLElement))
                            throw new Error();
                        completion.children[i].classList.remove("focused-completion");
                        newFocus.classList.add("focused-completion");
                        return;
                    }
                }
                const newCompletion = completion.children[completion.children.length - 1];
                if (!(newCompletion instanceof HTMLElement))
                    throw new Error();
                newCompletion.classList.add("focused-completion");
                break;
            }
            case 'Enter':
                {
                    e.preventDefault();
                    completeEmoji(input, completion?.querySelector(".focused-completion") ?? null);
                    completion?.remove();
                }
                break;
            case 'Escape':
                completion?.remove();
                break;
        }
    });
}
function completeEmoji(input, completion) {
    if (completion === null)
        return;
    const name = completion.innerText.trim().replaceAll(':', '');
    const match = completion.querySelector("b")?.innerText ?? "";
    const caret = input.selectionStart ?? 0;
    input.value = input.value.slice(0, caret - match.length)
        + dstEmojis[name]
        + input.value.slice(caret);
    console.log(input.value);
    input.dispatchEvent(new Event("input"));
}
HTMLElement.prototype.isCheckable = function () {
    return this instanceof HTMLInputElement && /check|radio/.test(this.type);
};
HTMLInputElement.prototype.triggerSetValue = function (value) {
    if (value == null)
        return;
    if (this.isCheckable()) {
        if (typeof (value) != "boolean")
            throw new Error();
        this.checked = value;
        this.dispatchEvent(new Event("change"));
    }
    else {
        this.value = value.toString();
    }
    this.dispatchEvent(new Event("input"));
};
HTMLTextAreaElement.prototype.triggerSetValue = function (value) {
    if (value == null)
        return;
    this.value = value.toString();
    this.dispatchEvent(new Event("input"));
};
Node.prototype.getParentWithClass = function (classHTML) {
    let parent = this.parentNode;
    while (!parent.classList || !parent.classList.contains(classHTML)) {
        parent = parent.parentNode;
        if (!parent)
            return null;
    }
    return parent;
};
/*
HTMLElement.prototype.getChildWithClass = function(classHTML) {
    let correctChild;
    Array.from(this.children, child => {
        if (child.classList.contains(classHTML)) {
            correctChild = child;
            return
        }
    });
    if (correctChild) {
        return correctChild
    }
    console.log("Could not find child of class", classHTML)
    return null
}
*/
HTMLElement.prototype.applyToAllChildrenDeep = function (func) {
    function inner(parent) {
        if (!parent.hasChildNodes())
            return;
        Array.from(parent.children, child => {
            if (!(child instanceof HTMLElement))
                return;
            func(child);
            inner(child);
        });
    }
    inner(this);
};
function adjustCodeHeight() {
    codeDiv.style.maxHeight = inputForm.clientHeight + "px";
}
function getLuaClassType(elem) {
    const classMatch = elem.classList.value.match(/ str|bool|num /);
    return classMatch && classMatch[1] || null;
}
function setLuaClassType(elem, newClass) {
    const classList = elem.classList;
    classList.value = classList.value.replaceAll(/ (str|bool|num) /g, ' ') + ` ${newClass} `;
}
function getOutputForInput(inputElem) {
    const output = document.getElementById(inputElem.id.split("-")[0]);
    if (!output) {
        throw new Error("No output found for " + inputElem);
    }
    return output;
}
function setCodeFromInput(input, override = null, typeCheck = false) {
    const inputValue = override != null ? override : input.value;
    let text;
    if (typeCheck) {
        const outputs = input.outputs || input.output;
        if (outputs == null)
            throw new Error();
        text = typeAndOutput(inputValue, outputs);
    }
    else {
        text = escapeText(inputValue);
    }
    function inner(output) {
        if (input.isCheckable()) {
            output.innerText = input.checked && "true" || "false";
            return;
        }
        output.innerHTML = text;
    }
    if (input.outputs) {
        input.outputs.forEach(elem => {
            inner(elem);
        });
    }
    else if (input.output) {
        inner(input.output);
    }
    else
        throw new Error();
}
function typeAndOutput(value, outputs) {
    let text = "";
    let type = "";
    if (/^(false|true)$/.test(value)) {
        type = "bool";
        text = escapeText(value);
    }
    else if (/^(["']).*\1$/.test(value)) {
        type = "str";
        text = value[0] + escapeText(value.slice(1, -1)) + value[0];
    }
    else if (/^\[\[.*\]\]$/.test(value)) {
        type = "str";
        text = '[[' + escapeText(value.slice(2, -2)) + ']]';
    }
    else if (numberRegex.test(value)) {
        type = "num";
        text = escapeText(value);
    }
    else {
        type = "str";
        text = '"' + escapeText(value) + '"';
    }
    if (outputs instanceof HTMLElement) {
        outputs = [outputs];
    }
    outputs.forEach(elem => {
        setLuaClassType(elem, type);
    });
    return text;
}
function makeCollapsable(toggle, content) {
    toggle.style.cursor = "pointer";
    toggle.addEventListener("click", () => {
        content.toggleAttribute("hidden");
        toggle.innerText = toggle.innerText.replace(/[►▼]/, content.hidden && '►' || '▼');
        adjustCodeHeight();
    });
}
function unCheckRadios(parent) {
    // doesnt require parent to be inserted in document yet
    parent.applyToAllChildrenDeep((elem) => {
        if (!(elem instanceof HTMLInputElement))
            return;
        if (elem.type == "radio") {
            elem.checked = false;
        }
    });
}
function roundFixFloatingPoint(num, maxDeximalPlaces = 4) {
    if (Number.isInteger(num))
        return num.toString();
    // round to 4th place and remove 
    const rounded = num.toFixed(maxDeximalPlaces);
    for (let i = rounded.length - 1; i >= 0; i--) {
        if (/[1-9]/.test(rounded[i])) {
            return rounded.slice(0, i + 1);
        }
    }
    return '0';
}
function copyButtonHandler() {
    // hacks - cant use clipboard API for compatibility with Firefox
    const btn = document.getElementById("copy-button");
    if (!(btn instanceof HTMLButtonElement))
        throw new Error();
    btn.addEventListener("click", event => {
        const temp = document.createElement("textarea");
        const text = code.innerText;
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
        //searchForErrors();
    });
}
function onInputFocus(elem) {
    const output = elem.focusElem || elem.output || (elem.outputs && elem.outputs[0]);
    if (output == null)
        throw new Error();
    const minPadding = 30;
    // minPadding < (elem.getBoundingClientRect().top - code.getBoundingClientRect().top) < (code.clientHeight - minPadding)
    const inputHeightFromCodeTop = Math.max(Math.min(elem.getBoundingClientRect().top - code.getBoundingClientRect().top, code.clientHeight - minPadding), minPadding);
    // scroll up less the further down the input is on the screen
    code.scrollTop = output.offsetTop - inputHeightFromCodeTop;
}
const increment = {
    "modal": new bootstrap.Modal(document.getElementById("increment-settings-modal")),
    "from": document.getElementById("increment-from-input"),
    "to": document.getElementById("increment-to-input"),
    "every": document.getElementById("increment-every-input"),
    "dataOper": document.getElementById("increment-data-operator"),
    "data": document.getElementById("increment-data-operand-input"),
    "label": document.getElementById("increment-label-option-input"),
    "hover": document.getElementById("increment-hover-option-input"),
    "var": document.getElementById("increment-var-input"),
    "generate": document.getElementById("generate-increment-button"),
};
function incrementSetup() {
    [increment.from, increment.to, increment.every, increment.data].forEach(input => {
        let trustedValue = "";
        input.addEventListener("beforeinput", () => {
            trustedValue = input.value;
        });
        input.addEventListener("input", () => {
            if (input.value && isNaN(parseFloat(input.value))) {
                input.value = trustedValue;
            }
            else {
                trustedValue = input.value;
            }
        });
    });
    increment.generate.addEventListener("click", () => {
        const start = parseFloat(increment.from.value);
        const end = parseFloat(increment.to.value);
        const incr = parseFloat(increment.every.value);
        const dataOperand = parseFloat(increment.data.value);
        const MAX_ADDITIONS = 100;
        if (Math.floor((end - start) / incr) > MAX_ADDITIONS) {
            window.alert("You may not add more than 100 options.");
            return;
        }
        if (isNaN(start) || isNaN(end) || isNaN(incr)) {
            window.alert("You must use valid numbers for 'From', 'To', and 'Increment' inputs.");
        }
        const labelValue = increment.label.value;
        const hoverValue = increment.hover.value;
        const replace = increment.var.value;
        const optionsDiv = increment.modal.optionsDiv;
        let getData = null;
        switch (increment.dataOper.value) {
            case '*':
                getData = (n) => { return roundFixFloatingPoint(n * dataOperand); };
                break;
            case '+':
                getData = (n) => { return roundFixFloatingPoint(n + dataOperand); };
                break;
            case '..':
                getData = (n) => { return n.toString() + increment.data.value; };
                break;
        }
        if (getData == null)
            throw new Error();
        for (let n = start; n <= end; n += incr) {
            const newOption = addOption(optionsDiv);
            newOption.dataInput.triggerSetValue(getData(n));
            newOption.labelInput.triggerSetValue(labelValue.replace(replace, n));
            newOption.hoverInput.triggerSetValue(hoverValue.replace(replace, n));
        }
    });
}
function modiconCheckBox() {
    const modInputs = document.getElementById("modicons");
    const tex = document.getElementById("comment-modicon-tex");
    const xml = document.getElementById("comment-modicon-xml");
    const texLine = document.getElementById("modicontex-line");
    const xmlLine = document.getElementById("modiconxml-line");
    modiconCheck.checked = false;
    modiconCheck.addEventListener("change", event => {
        modInputs.toggleAttribute("hidden");
        tex.toggleAttribute("hidden");
        xml.toggleAttribute("hidden");
        texLine.classList.toggle("comment");
        xmlLine.classList.toggle("comment");
        adjustCodeHeight();
    });
}
let dragCount = 0;
let dragged = null;
function dragenter(elem) {
    if (dragged == null)
        dragged = elem;
    elem.classList.add("dragover");
    dragCount++;
}
function dragleave(elem) {
    dragCount--;
    if (dragCount == 0) {
        elem.classList.remove("dragover");
        dragged = null;
    }
}
const codeImportInput = document.getElementById("code-input");
function dragdropped(elem) {
    dragCount = 0;
    elem.classList.remove("dragover");
}
const modDependencyInputs = [];
const codeDependencies = document.getElementById("moddependencies");
const codeDependencyClone = document.querySelector(".dependency").cloneNode(true);
const modDependencyClone = document.querySelector(".moddependency-div").cloneNode(true);
const addInputBtn = document.getElementById("add-dependency-button");
if (codeDependencyClone == null || !(codeDependencyClone instanceof HTMLDivElement))
    throw new Error();
if (modDependencyClone == null || !(modDependencyClone instanceof HTMLDivElement))
    throw new Error();
let dependencyIdCount = 0;
modDependencyClone.hidden = false;
function modDependencySetup() {
    // codeDependencyClone.hidden = false;
    addInputBtn.onclick = function () {
        addModDependencyInput().focus();
    };
}
function addModDependencyInput() {
    const newDependency = modDependencyClone.cloneNode(true);
    const newCode = codeDependencyClone.cloneNode(true);
    const input = newDependency.querySelector(".moddependency-input");
    if (codeDependencies == null || !(codeDependencies instanceof HTMLDivElement))
        throw new Error();
    if (addInputBtn == null || !(addInputBtn instanceof HTMLButtonElement))
        throw new Error();
    codeDependencies.hidden = false;
    newCode.id = `dependency-${dependencyIdCount}`;
    modDependencyInputs.push(input);
    const addInputBtnParentNode = addInputBtn.parentNode;
    if (addInputBtnParentNode == null)
        throw new Error();
    addInputBtnParentNode.insertBefore(newDependency, addInputBtn);
    codeDependencies.appendChild(newCode);
    input.focusElem = document.createElement("span");
    codeDependencies.appendChild(input.focusElem);
    input.output = document.querySelector(`#${newCode.id} .dependency-name-output`);
    if (input.parentNode == null)
        throw new Error();
    input.deleteButton = input.parentNode.querySelector(".smart-input-delete-button");
    input.output.line = newCode;
    modDependencyInputRegister(input);
    dependencyIdCount++;
    return input;
}
function modDependencyInputRegister(inputElem) {
    inputElem.addEventListener("input", () => {
        inputElem.classList.remove("unfilled");
        let linkId = inputElem.value.match(/steamcommunity.com.+\?id=(?<id>\d{10})/)?.groups?.id;
        if (/^workshop-\d+$/.test(inputElem.value)) {
            setCodeFromInput(inputElem);
        }
        else if (/^\d+/.test(inputElem.value)) {
            setCodeFromInput(inputElem, `workshop-${inputElem.value}`);
        }
        else if (linkId) {
            setCodeFromInput(inputElem, `workshop-${linkId}`);
        }
        else if (inputElem.value) {
            inputElem.classList.add("unfilled");
        }
        if (inputElem?.output?.line == null)
            throw new Error();
        inputElem.output.line.hidden = inputElem.value ? false : true;
    });
}
function onModDependencyDeleteClick(btn) {
    const div = btn.getParentWithClass("moddependency-div");
    if (!(div instanceof HTMLDivElement))
        throw new Error();
    const input = div.querySelector(".moddependency-input");
    modDependencyInputs.splice(modDependencyInputs.indexOf(input), 1);
    if (!input?.output?.line)
        throw new Error();
    input.output.line.remove();
    div.remove();
    if (!modDependencyInputs.length) {
        if (codeDependencies == null)
            throw new Error();
        codeDependencies.hidden = true;
    }
}
function fileSelected(event) {
    const file = event.target.files[0];
    const ext = file.name.slice(-4);
    if (ext != '.lua') {
        event.preventDefault();
        event.stopPropagation();
        event.target.value = "";
        return;
    }
    let fr = new FileReader();
    fr.onloadend = function () {
        if (codeImportInput == null)
            throw new Error();
        codeImportInput.value = fr.result;
    };
    fr.readAsText(file);
}
function resetAll() {
    formInputs[0].focus();
    formInputs.forEach(input => {
        if (input.isCheckable() && input instanceof HTMLInputElement) {
            input.checked = Boolean(input.getAttribute("default"));
        }
        else {
            input.value = input.getAttribute("default") || '';
        }
        setCodeFromInput(input);
    });
    increment.from.value = 0;
    increment.to.value = 100;
    increment.every.value = 5;
    increment.dataOper.value = "*";
    increment.data.value = "0.01";
    increment.label.value = "#%";
    increment.hover.value = "#%";
    increment.var.value = "#";
    // Array.from(document.getElementsByClassName("remove-config"), btn => {
    //     console.log(btn);
    //     btn.dispatchEvent(new Event("click"));
    // });;
}
function respondToInputs() {
    formInputs.forEach(item => {
        if (item instanceof HTMLTextAreaElement || item instanceof HTMLInputElement) {
            listenCompleteEmoji(item);
        }
        item.output = getOutputForInput(item);
        formInputs.push(item);
        switch (item.id) {
            case "version-input":
            case "dsapiversion-input":
            case "apiversion-input":
                {
                    const versionError = document.getElementById(item.output.id + "-error");
                    if (versionError == null)
                        throw new Error();
                    item.addEventListener("input", () => {
                        if (/[^\.\d]/.test(item.value)) {
                            versionError.hidden = false;
                            return;
                        }
                        versionError.hidden = true;
                        setCodeFromInput(item);
                    });
                    break;
                }
            case "server-check":
            case "client-check":
                {
                    const otherCheck = document.getElementById(item.id == "client-check" && "server-check" || "client-check");
                    item.addEventListener("change", () => {
                        setCodeFromInput(otherCheck);
                        setCodeFromInput(item);
                    });
                    break;
                }
            case "forumthread-input":
                {
                    const errorText = document.getElementById("forumthread-error");
                    const link = document.getElementById("forumthread-link");
                    item.addEventListener('input', () => {
                        if (!item.value) {
                            link.innerText = "";
                            link.href = "";
                            setCodeFromInput(item);
                            return;
                        }
                        if (/ /.test(item.value)) {
                            errorText.hidden = false;
                            return;
                        }
                        const outputSite = "https://forums.kleientertainment.com/index.php?";
                        const value = item.value.replace(/^(?:https?:\/\/)?forums\.kleientertainment\.com/, '');
                        setCodeFromInput(item, value);
                        link.innerText = outputSite + value;
                        link.href = outputSite + value;
                        errorText.hidden = true;
                    });
                    break;
                }
            case "modicontex-input":
            case "modiconxml-input":
                {
                    const suffix = item.getAttribute("suffix");
                    if (suffix == null)
                        throw new Error();
                    item.addEventListener('input', () => {
                        if (!item.value.endsWith(suffix)) {
                            setCodeFromInput(item, item.value + suffix);
                        }
                        else {
                            setCodeFromInput(item);
                        }
                    });
                    break;
                }
            case "priority-input":
                {
                    const errorText = document.getElementById("priority-error");
                    if (errorText == null)
                        throw new Error();
                    item.addEventListener('input', () => {
                        if (numberRegex.test(item.value)) {
                            setCodeFromInput(item);
                            errorText.hidden = true;
                        }
                        else {
                            errorText.hidden = false;
                        }
                    });
                    break;
                }
            case "filtertags-input":
                {
                    const argSplit = /[\s,;"']+/g;
                    item.addEventListener("input", () => {
                        if (item.output == null)
                            throw new Error();
                        if (!item.value) {
                            item.output.innerHTML = "";
                            return;
                        }
                        const args = item.value.replaceAll(argSplit, ' ').trim().split(/\s+/);
                        const numArgs = args.length;
                        for (let i = 0; i < numArgs; i++) {
                            args[i] = `<span class="str">"${escapeText(args[i])}"</span>${i + 1 == numArgs ? "" : ", "}`;
                        }
                        item.output.innerHTML = args.join('');
                    });
                    break;
                }
            case "ds-check":
            case "dst-check":
                {
                    const hiddenElements = document.getElementsByClassName(item.id.split('-')[0] + "-require");
                    if (!(item instanceof HTMLInputElement))
                        throw new Error();
                    Array.from(hiddenElements, elem => { elem.hidden = !item.checked; });
                    item.addEventListener("input", () => {
                        setCodeFromInput(item);
                        const hidden = !item.checked;
                        Array.from(hiddenElements, elem => {
                            elem.hidden = hidden;
                        });
                    });
                    break;
                }
            case "description-input": {
                const strOpen = item.output?.parentElement?.querySelector(".str-open");
                if (!(strOpen instanceof HTMLSpanElement))
                    throw new Error();
                const strClose = item.output?.parentElement?.querySelector(".str-close");
                if (!(strClose instanceof HTMLSpanElement))
                    throw new Error();
                item.addEventListener("input", () => {
                    setCodeFromInput(item);
                    let delim = '';
                    while (item.value.includes(']' + delim + ']')) {
                        delim += '=';
                    }
                    strOpen.innerText = '[' + delim + '[';
                    strClose.innerText = ']' + delim + ']';
                });
                break;
            }
            default:
                {
                    item.addEventListener("input", () => {
                        setCodeFromInput(item);
                    });
                    break;
                }
        }
    });
}
function importCodeButtonSetup() {
    const btn = document.getElementById("import-button");
    const varnameToInputId = {
        "name": "name-input",
        "author": "author-input",
        "description": "description-input",
        "version": "version-input",
        "dst_compatible": "dst-check",
        "dont_starve_compatible": "ds-check",
        "reign_of_giants_compatible": "rog-check",
        "hamlet_compatible": "ham-check",
        "shipwrecked_compatible": "sw-check",
        "forge_compatible": "forge-check",
        "gorge_compatible": "gorge-check",
        "client_only_mod": "client-check",
        "all_clients_require_mod": "server-check",
        "icon_atlas": "modiconxml-input",
        "icon": "modicontex-input",
        "forumthread": "forumthread-input",
        "api_version_dst": "apiversion-input",
        "api_version": "dsapiversion-input",
        "priority": "priority-input",
    };
    const importError = document.getElementById("import-error");
    btn.addEventListener("click", event => {
        const codeInput = codeImportInput.value;
        const foundVars = new Set();
        let info;
        try {
            info = lua_load(codeInput)()?.str;
        }
        catch (error) {
            console.log(error, typeof (error));
            event.preventDefault();
            const errorLineMatch = error.toString().match(/Parse error on line (\d+)/);
            console.log(errorLineMatch);
            if (errorLineMatch) {
                let lineNumber = parseInt(errorLineMatch[1]);
                const inputLineMatch = codeInput.match(new RegExp(`^(?:.*\\n){${lineNumber - 1}}(.*)`));
                console.log(inputLineMatch);
                if (inputLineMatch && inputLineMatch.index != null) {
                    const line = inputLineMatch[1];
                    const endIndex = inputLineMatch.index + inputLineMatch[0].length;
                    codeImportInput.focus();
                    codeImportInput.setSelectionRange(endIndex - line.length, endIndex);
                    codeImportInput.scrollTop = (lineNumber - 1) * 20; // DEPENDENT ON LINE HEIGHT
                }
            }
            importError.innerText = error.toString();
            importError.hidden = false;
            //window.alert(error.toString());
            return;
        }
        importError.innerText = "";
        document.getElementById("exit-import-modal")?.dispatchEvent(new Event("click"));
        if (info.api_version_dst == null) {
            info.api_version_dst = info.api_version;
        }
        for (const varName in varnameToInputId) {
            const inputElem = document.getElementById(varnameToInputId[varName]);
            const result = info[varName];
            if (!(inputElem instanceof HTMLInputElement || inputElem instanceof HTMLTextAreaElement))
                throw new Error(inputElem?.toString());
            inputElem?.triggerSetValue(result);
        }
        if (info.icon) {
            modiconCheck.triggerSetValue(true);
        }
        const serverFilterTags = info.server_filter_tags?.uints;
        if (serverFilterTags && serverFilterTags instanceof Array) {
            const filterTagsInput = document.getElementById("filtertags-input");
            filterTagsInput.triggerSetValue(serverFilterTags?.join(", "));
        }
        const dependencies = info.mod_dependencies?.uints;
        if (dependencies && dependencies instanceof Array) {
            for (let i = 0; i < dependencies.length; i++) {
                const dependencyInput = modDependencyInputs[i] || addModDependencyInput();
                dependencyInput.triggerSetValue(Object.keys(dependencies[i].str)[0]);
            }
        }
        const configurationOptions = info.configuration_options?.uints;
        if (configurationOptions && configurationOptions instanceof Array) {
            for (let i = 0; i < configurationOptions.length; i++) {
                const luaConfig = configurationOptions[i].str;
                let inputConfig = configsElem.configsArr[i] || addConfig();
                inputConfig.nameInput.triggerSetValue(luaConfig.name);
                inputConfig.hoverInput.triggerSetValue(luaConfig.hover);
                inputConfig.labelInput.triggerSetValue(luaConfig.label);
                inputConfig.legend.dispatchEvent(new Event("click"));
                const luaOptions = luaConfig.options?.uints;
                const inputOptions = inputConfig.optionsArr;
                const defaultOption = luaConfig.default;
                if (!luaOptions)
                    continue;
                let start = 1;
                if (luaOptions instanceof Array)
                    start = 0;
                for (let i = 0; true; i++) { // cant use luaOptions.length because lua js can be funky
                    const codeOption = luaOptions[i + start]?.str;
                    if (codeOption == null)
                        break;
                    const formOption = inputOptions[i] || addOption(inputConfig.optionsForm);
                    formOption.dataInput.triggerSetValue(codeOption.data);
                    formOption.labelInput.triggerSetValue(codeOption.description);
                    formOption.hoverInput.triggerSetValue(codeOption.hover);
                    if (codeOption.data == defaultOption) {
                        formOption.default.triggerSetValue(true);
                    }
                }
            }
        }
    });
}
respondToInputs();
makeCollapsable(advancedToggle, document.getElementById("advanced"));
//makeCollapsable(document.querySelector(".configuration-legend"), document.querySelector(".configuration-content"));
modiconCheckBox();
copyButtonHandler();
importCodeButtonSetup();
incrementSetup();
adjustCodeHeight();
resetAll();
modDependencySetup();
//start with one config to make it look fancier
addConfig();
