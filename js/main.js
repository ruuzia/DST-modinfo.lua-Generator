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
    "]": "\\\]"
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
    this.value = value.toString() || "";
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
HTMLElement.prototype.getChildWithClass = function (classHTML) {
    let correctChild;
    Array.from(this.children, child => {
        if (child.classList.contains(classHTML)) {
            correctChild = child;
            return;
        }
    });
    if (correctChild) {
        return correctChild;
    }
    console.log("Could not find child of class", classHTML);
    return null;
};
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
    let overflowHeight = parseInt(codeDiv.style.maxHeight) + code.scrollHeight - code.offsetHeight;
    let newHeight = Math.min(inputForm.clientHeight, overflowHeight);
    codeDiv.style.maxHeight = newHeight.toString();
    code.style.maxHeight = (newHeight - 20).toString();
}
function getLuaClassType(elem) {
    const classMatch = elem.classList.value.match((/str|bool|n/));
    return classMatch && classMatch[0] || null;
}
function setLuaClassType(elem, newClass) {
    const classList = elem.classList;
    classList.value = classList.value.replaceAll(/ (str|bool|n)/g, '') + ` ${newClass}`;
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
    const output = elem.output || elem.outputs && elem.outputs[0];
    if (output == null)
        throw new Error();
    code.scrollTop = code.clientHeight - output.offsetTop;
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
                getData = (n) => { return (n * dataOperand).toString(); };
                break;
            case '+':
                getData = (n) => { return (n + dataOperand).toString(); };
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
    const input = newDependency.getChildWithClass("moddependency-input");
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
    input.output = document.querySelector(`#${newCode.id} .dependency-name-output`);
    if (input.parentNode == null)
        throw new Error();
    input.deleteButton = input.parentNode.getChildWithClass("smart-input-delete-button");
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
    const input = div.getChildWithClass("moddependency-input");
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
            window.alert(error.toString());
            return;
        }
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
