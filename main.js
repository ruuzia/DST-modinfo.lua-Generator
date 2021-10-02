"use strict"

let configIdCount = 0;
const code = document.getElementById("code");
const numberRegex = /^\-?\d*\.?\d*$/;
const modiconCheck = document.getElementById("modicon-check")
const configsDiv = document.getElementById("configs");


const replacements = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "\\&quot;",
    "'": "&#039;",
    "\n": "<br>",
    "]": "\\\]" 
}
const str = '[' + Object.keys(replacements)
                    .join('')
                    .replace(']', '\\]') + ']';
var pattern = new RegExp(str, 'g');

function escapeText(text) {
    return text.replaceAll(pattern, match => {
        return replacements[match]
    });
}

HTMLElement.prototype.isCheckable = function() {
    return this instanceof HTMLInputElement && /check|radio/.test(this.type);
}

HTMLInputElement.prototype.triggerSetValue = function(value) {
    if (this.isCheckable()) {
        this.checked =  value || false;
        this.dispatchEvent(new Event("change"));
    } else {
        this.value = value ?? "";
    }
    this.dispatchEvent(new Event("input"));
}

HTMLTextAreaElement.prototype.triggerSetValue = function(value) {
    this.value = value || "";
    this.dispatchEvent(new Event("input"));
}


HTMLElement.prototype.getParentWithClass = function(classHTML) {
    parent = this.parentNode
    while (!parent.classList || !parent.classList.contains(classHTML)) {
        parent = parent.parentNode
        if (!parent) return null;
    }
    return parent
}

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

HTMLElement.prototype.applyToAllChildrenDeep = function(func) {
    function inner(parent) {
        if (!parent.hasChildNodes()) return;
        Array.from(parent.children, child => {
            func(child);
            inner(child);
        });
    }
    inner(this);
}

function getLuaClassType(elem) {
    const classMatch =  elem.classList.value.match((/str|bool|num/));
    return classMatch && classMatch[0] || null 
}

function setLuaClassType(elem, newClass) {
    const classList = elem.classList;
    classList.value = classList.value.replaceAll(/ (str|bool|num)/g, '') + ` ${newClass}`
}

function getOutputForInput(inputElem) {
    return document.getElementById(inputElem.id.split("-")[0]);
}

function setCodeFromInput(input, override=null, typeCheck=false) {
    const inputValue = override != null ? override : input.value;
    let text;
    if (typeCheck) {
        text = typeAndOutput(inputValue, input.outputs || [input.output]);
    } else {
        text = escapeText(inputValue);
    }
    
    function inner(output) {
        code.scrollTop = output.offsetTop - code.clientHeight;
        if (input.isCheckable()) {
            output.innerText = input.checked && "true" || "false";
            return
        }
        
        output.innerHTML = text;
    }
    if (input.outputs) {
        input.outputs.forEach(elem => {
            inner(elem);
        });
    } else { // if (input.output)
        inner(input.output);
    }
}

function typeAndOutput(value, outputs) {
    let text = "";
    let type = "";
    if (/^(false|true)$/.test(value)) {
        type = "bool";
        text = escapeText(value);
    } else if (/^(["']).*\1$/.test(value)) {
        type = "str";
        text = value[0] + escapeText(value.slice(1,-1)) + value[0];
    } else if (/^\[\[.*\]\]$/.test(value)) {
        type = "str";
        text = '[[' + escapeText(value.slice(2,-2))  + ']]';
    } else if (numberRegex.test(value)) {
        type = "num";
        text = escapeText(value);
    } else {
        type = "str";
        text = '"' + escapeText(value) + '"';
    }
    if (outputs instanceof HTMLElement) {
        outputs = [outputs];
    }
    outputs.forEach(elem => {
        setLuaClassType(elem, type);
    });
    return text
}

function makeCollapsable(toggle, content) {
    toggle.style.cursor = "pointer";
    toggle.addEventListener("click", _ => {
        content.toggleAttribute("hidden");
        toggle.innerText = toggle.innerText.replace(/[►▼]/, content.hidden && '►' || '▼')
    });
}

function unCheckRadios(parent) {
    // doesnt require parent to be inserted in document yet
    parent.applyToAllChildrenDeep(elem => {
        if (elem.type == "radio") {
            elem.checked = false;
        }
    });
}

function copyButtonHandler() {
    // hacks - cant use clipboard API for compatibility with Firefox
    const btn = document.getElementById("copy-button");
    btn.addEventListener("click", _ => {
        const temp = document.createElement("textarea");
        const text = code.innerText;
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
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
    });
}

function optionSetUp(option, optionsDiv, optionCode, radioChecked=false) {
    const config = optionsDiv.getParentWithClass("configuration");
    const countStr = optionsDiv.getAttribute("optioncount");
    
    option.optionid = countStr;
    option.config = config;
    option.id = `config-${config.configid}-option-${option.optionid}-input`;
    option.output = optionCode;
    option.output.id = option.id.replace("input", "output");
    optionsDiv.setAttribute("optioncount", parseInt(countStr) + 1);
    Array.from(document.querySelectorAll(`#${option.id} .input-config`), input => {
        switch (input.name) {
            case "option-data":
                option.dataInput = input;
                registerDataOptionInput(input, option);
                break;
            case "option-label":
                option.labelInput = input;
                registerLabelOptionInput(input, option);
                break;
            case "option-hover":
                option.hoverInput = input;
                registerHoverOptionInput(input, option);
                break;
        }
    });
    const radio = document.querySelector(`#${option.id} .option-radio-input`);
    option.default = radio;
    registerRadioConfigListener(radio, config, radioChecked);
    window.scrollBy(0, option.clientHeight);
}

function registerDataOptionInput(input, option) {
    input.output = document.querySelector(`#${option.output.id} .option-data`)
    input.addEventListener("input", _ => {
        setCodeFromInput(input, input.value ? null : '""', true)
    });
}

function registerLabelOptionInput(input, option) {
    input.output = document.querySelector(`#${option.output.id} .option-label`)
    input.addEventListener("input", _ => {
        setCodeFromInput(input, null, false)
    });
}

function registerHoverOptionInput(input, option) {
    input.output = document.querySelector(`#${option.output.id} .option-hover`)
    const line = input.output.getParentWithClass("option-hover-line");
    input.addEventListener("input", _ => {
        if (input.value) {
            setCodeFromInput(input, null, false)
            line.hidden = false;
        } else {
            line.hidden = true;
        }
    });
}

let checkedRadio;
function registerRadioConfigListener(radio, config, startChecked) {
    const output = config.output.getChildWithClass("config-default");
    radio.name = radio.name.replace(/#/, config.configid);
    radio.input = radio.parentNode.getChildWithClass("option-data-input");

    function onchange() {
        if (checkedRadio) checkedRadio.input.outputs = null;
        radio.input.outputs = [radio.input.output, output];
        radio.input.dispatchEvent(new Event("input"));
        checkedRadio = radio;
    }
    if (startChecked) {
        radio.checked = true;
        onchange();
    }

    radio.addEventListener("change", onchange);
}

const optionClone = document.querySelector(".option");
optionClone.optionid = 0
const optionCodeClone = document.querySelector(".option-code");

function onAddOptionClick(event) {
    const btn = event.target;
    if (!btn.optionsDiv) {
        btn.optionsDiv = btn.parentNode.getChildWithClass("options");
        btn.select = btn.nextElementSibling;
    }

    switch (btn.select.value) {
        case "1":
            addOption(btn.optionsDiv);
            break;
        case "KEYS":
            const KEY_A = 65;
            const KEY_Z = KEY_A + 25;
            for (let i = KEY_A; i <= KEY_Z; i++) {
                console.log("TEST");
                const newOption = addOption(btn.optionsDiv);
                const char = String.fromCharCode(i);
                newOption.dataInput.triggerSetValue(char);
                newOption.labelInput.triggerSetValue(char);
            }
            break;
    }
}

function addOption(optionsDiv) {
    const newOption = optionClone.cloneNode(true);
    const newOptionCode = optionCodeClone.cloneNode(true)
    unCheckRadios(newOption);
    optionsDiv.appendChild(newOption);
    optionsDiv.output.appendChild(newOptionCode);
    optionSetUp(newOption, optionsDiv, newOptionCode);
    newOption.config.optionsArr.push(newOption);
    return newOption
}



const addBtn = document.getElementById("add-config");
const configClone = document.querySelector(".configuration");
addBtn.addEventListener("click", addConfig);

function addConfig() {
    const newConfig = configClone.cloneNode(true);
    newConfig.hidden = false;
    addBtn.parentNode.insertBefore(newConfig, addBtn);
    configIdCount++;
    configSetup(newConfig);
    window.scrollBy(0, newConfig.clientHeight);
    return newConfig;
}

function configSetup(config) {
    config.optionsArr = [];
    configsDiv.configsArr.push(config); // will need to move this once configs can be duplicated
    config.configid = configIdCount;
    config.id = `configform-${configIdCount}`;

    const legend = config.getChildWithClass("configuration-legend");
    const count = document.querySelectorAll(".configuration").length - 1;
    legend.innerText = legend.innerText.replace(/#/, count);
    makeCollapsable(legend, legend.nextElementSibling);
    
    config.nameInput = document.querySelector(`#${config.id} .config-name-input`);
    config.hoverInput = document.querySelector(`#${config.id} .config-hover-input`);
    config.labelInput = document.querySelector(`#${config.id} .config-label-input`);
    config.optionsForm = document.querySelector(`#${config.id} .options`);
    config.legend = legend;

    createConfigCode(config);
    console.log("Config set up with id of " + config.id);
}


const configCodeClone = document.querySelector(".configCode");

function createConfigCode(configForm) {
    const newConfigCode = configCodeClone.cloneNode(true);
    newConfigCode.hidden = false;
    configForm.output = newConfigCode;
    configsDiv.appendChild(newConfigCode);
    const id = "configcode-" + configForm.configid;
    newConfigCode.id = id;

    configInputSetup(configForm.id, id);
}


function configInputSetup(formId, codeId) {
    const inputs = [];
    inputs[0] = document.querySelector(`#${formId} .config-label-input`);
    inputs[0].output = document.querySelector(`#${codeId} .config-label`);

    inputs[1] = document.querySelector(`#${formId} .config-name-input`);
    inputs[1].outputs = Array.from(document.querySelectorAll(`#${codeId} .config-name`));

    inputs[2] = document.querySelector(`#${formId} .config-hover-input`);
    inputs[2].output = document.querySelector(`#${codeId} .config-hover`);

    inputs.forEach(input => {
        input.addEventListener("input", _ => {
            setCodeFromInput(input);
        });
    });

    const optionForms = document.querySelectorAll(`#${formId} .option`);
    const optionCodes = document.querySelectorAll(`#${codeId} .option-code`);
    for (let i = 0; i < optionForms.length; i++) {
        const form = optionForms[i];
        const code = optionCodes[i];
        
        form.parentNode.output = code.parentNode;
        optionSetUp(form, form.parentNode, code, form==optionForms[0]);
        form.config.optionsArr.push(form);
    }
}


function onOptionDeleteClick(event) {
    const option = event.target.getParentWithClass("option");
    option.output.remove();
    const optionArr = option.config.optionsArr;
    optionArr.splice(optionArr.indexOf(option), 1);
    option.remove();
}

function unCheckRadios(parent) {
    parent.applyToAllChildrenDeep(elem => {
        if (elem.type == "radio") {
            elem.checked = false;
        }
    });
}

let dragCount = 0;
let dragged;
function dragenter(event) {
    if (!dragged) dragged = event.target;
    if (event.target === dragged) 
    event.target.classList.add("dragover");
    dragCount++;
}

function dragleave(event) {
    dragCount--;
    if (dragCount == 0) {
        event.target.classList.remove("dragover")
        dragged = null;
    }
}

function receivedText() {
    document.getElementById('editor').appendChild(document.createTextNode(fr.result));
  }    

const codeImportInput = document.getElementById("code-input");
function dragdropped(event) {
    dragCount = 0;
    event.target.classList.remove("dragover")
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
    fr.onloadend = function() {
        codeImportInput.value = fr.result;
    }
    fr.readAsText(file);
}

function onOptionDuplicateClick(event) {
    const btn = event.target;
    if (!btn.optionDiv) {
        btn.option = btn.getParentWithClass("option");
    }

    const newOption = btn.option.cloneNode(true);
    const optionsDiv = btn.option.parentNode
    const optionCode = btn.option.output.cloneNode(true);
    unCheckRadios(newOption);
    optionsDiv.insertBefore(newOption, btn.option.nextElementSibling);
    optionsDiv.output.insertBefore(optionCode, btn.option.output.nextElementSibling);
    optionSetUp(newOption, optionsDiv, optionCode);
    const optionsArr = newOption.config.optionsArr
    const index = optionsArr.indexOf(btn.option) + 1;
    optionsArr.splice(index, 0, newOption);
}

function resetConfigLegendNumbers() {
    let count = 0;
    Array.from(document.querySelectorAll(".configuration-legend"), elem => {
        if (!elem.parentNode.hidden) {
            count++;
            elem.innerText = elem.innerText.replace(/\d+/, count);
        }
    });
}

function onRemoveConfigClick(event) {
    const btn = event.target;
    const config = btn.getParentWithClass("configuration");
    config.output.remove();
    configsDiv.configsArr.splice(configsDiv.configsArr.indexOf(config), 1);
    window.scrollBy(0, config.clientHeight * -1);
    config.remove();
    resetConfigLegendNumbers();
}

function makeConfigOutput(event) {
    const input = event.target;
    if (input.output) return input.output;
}


function respondToInputs() {
    const inputs = document.getElementsByClassName("input-code");
    Array.from(inputs, item => {
        item.output = getOutputForInput(item);
        if (item.isCheckable()) {
            item.checked = Boolean(item.getAttribute("default"));
        } else {
            item.value = item.getAttribute("default") || '';
        }
        setCodeFromInput(item);
        switch (item.id) {
            case "version-input":
            case "dsapiversion-input":
            case "apiversion-input":
                {
                    const versionError = document.getElementById(item.output.id + "-error");
                    item.addEventListener("input", _ => {
                        if (/[^\.\d]/.test(item.value)) {
                            versionError.hidden = false;
                            return
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
                    item.addEventListener("change", _ => {
                        setCodeFromInput(otherCheck);
                        setCodeFromInput(item);
                    });
                    break;
                }
            case "forumthread-input":
                {
                    const errorText = document.getElementById("forumthread-error");
                    const link = document.getElementById("forumthread-link");
                    item.addEventListener('input', _ => {
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
                    item.addEventListener('input', _ => {
                        if (!item.value.endsWith(suffix)) {
                            setCodeFromInput(item, item.value + suffix);
                        } else {
                            setCodeFromInput(item);
                        }
                    });
                    break;
                }
            case "priority-input":
                {
                    const errorText = document.getElementById("priority-error");
                    item.addEventListener('input', _ => {
                        if (numberRegex.test(item.value)) {
                            setCodeFromInput(item)
                            errorText.hidden = true;
                        } else {
                            errorText.hidden = false;
                        }
                    });
                    break;
                }
            case "filtertags-input":
                {
                    const argSplit = /[\s,;"']+/g
                    item.addEventListener("input", _ => {
                        if (!item.value) {
                            item.output.innerHTML = "";
                            return;
                        }
                        const args = item.value.replaceAll(argSplit, ' ').trim().split(/\s+/)
                        const numArgs = args.length;
                        for (let i = 0; i < numArgs; i++) {
                            args[i] = `<span class="str">"${escapeText(args[i])}"</span>${i+1 == numArgs ? "" : ", "}`
                        }
                        item.output.innerHTML = args.join('');
                    });
                    break;
                }
            case "ds-check":
            case "dst-check":
                {
                    const hiddenElements = document.getElementsByClassName(item.id.split('-')[0] + "-require");
                    Array.from(hiddenElements, elem => {elem.hidden = !item.checked;});

                    item.addEventListener("input", _ => {
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
                    item.addEventListener("input", _ => {
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
    }
    btn.addEventListener("click", event => {
        const code = codeImportInput.value;
        const foundVars = new Set();
        let info;
        try {
            info = lua_load(code)()?.str;
        } 
        catch (error) {
            console.log(error, typeof(error));
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
            inputElem?.triggerSetValue(result);
        }
        if (info.icon) {
            modiconCheck.triggerSetValue(true);
        }
        const serverFilterTags = info.server_filter_tags?.uints;
        if (serverFilterTags && serverFilterTags instanceof Array) {
            const filterTagsInput = document.getElementById("filtertags-input");
            filterTagsInput.triggerSetValue(serverFilterTags?.join(", "))
        }

        const configurationOptions = info.configuration_options?.uints;
        if (configurationOptions && configurationOptions instanceof Array) {
            for (let i = 0; i < configurationOptions.length; i++) {
                const luaConfig = configurationOptions[i].str;
                let inputConfig = configs.configsArr[i] || addConfig();
                inputConfig.nameInput.triggerSetValue(luaConfig.name);
                inputConfig.hoverInput.triggerSetValue(luaConfig.hover);
                inputConfig.labelInput.triggerSetValue(luaConfig.label);
                inputConfig.legend.dispatchEvent(new Event("click"));
                const luaOptions = luaConfig.options?.uints;

                const inputOptions = inputConfig.optionsArr;
                const defaultOption = luaConfig.default;
                if (!luaOptions) continue;
                let start = 1;
                if (luaOptions instanceof Array) start = 0;
                for (let i = start; true; i++) { // cant use luaOptions.length because lua js can be funky
                    const codeOption = luaOptions[i]?.str;
                    if (codeOption == null) break;
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



configsDiv.configsArr = [];
respondToInputs();
makeCollapsable(document.getElementById("advanced-toggle"), document.getElementById("advanced"));
//makeCollapsable(document.querySelector(".configuration-legend"), document.querySelector(".configuration-content"));
modiconCheckBox();
copyButtonHandler();
importCodeButtonSetup();