let configIdCount = 0;
const code = document.getElementById("code");
const numberRegex = /^\-?\d*\.?\d*$/;

{
    const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "\\&quot;",
        "'": "&#039;",
        "\n": "<br>",
        "]": "\\\]" 
<<<<<<< HEAD
    }
    const str = '[' + Object.keys(replacements)
                        .join('')
                        .replace(']', '\\]') + ']';
    let pattern = new RegExp(str, 'g');
    
    function escapeText(text) {
        return text.replaceAll(pattern, match => {
            return replacements[match]
        });
    }
=======
    }
    const str = '[' + Object.keys(replacements)
                        .join('')
                        .replace(']', '\\]') + ']';
    const pattern = new RegExp(str, 'g');
    
    function escapeText(text) {
        return text.replaceAll(pattern, match => {
            return replacements[match]
        });
    }
>>>>>>> c827c35b1e036c66dec955a7c0feb0c68f7a7225
}

HTMLElement.prototype.getParentWithClass = function(classHTML) {
    parent = this.parentNode
    while (!parent.classList || !parent.classList.contains(classHTML)) {
        parent = parent.parentNode
        if (!parent) return null;
    }
    console.log("FOUND PARENT WITH CLASS " + classHTML)
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
        console.log("FOUND CHILD WITH CLASS " + classHTML);
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

function getOutputForInput(inputElem) {
    return document.getElementById(inputElem.id.split("-")[0]);
}

function setCodeFromInput(input, override=null, typeCheck=false) {
    if (typeCheck) {
        text = typeAndOutput(input.value, input.outputs || [input.output]);
    } else {
        text = escapeText(override != null && override || input.value);
    }
    
    function inner(output) {
        code.scrollTop = output.offsetTop - 150;
        if (input.type.match(/checkbox|radio/)) {
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
        elem.classList.value = elem.classList.value.replaceAll(/ (str|bool|num)/g, '') + ` ${type}`;
    });
    return text
}

function makeCollapsable(toggle, content) {
    toggle.style.cursor = "pointer";
    toggle.addEventListener("click", _ => {
        content.toggleAttribute("hidden");
        toggle.innerText.replace(/[►▼]/, content.hidden && '►' || '▼')
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
    const checkBox = document.getElementById("modicon-check");
    const modInputs = document.getElementById("modicons");
    const tex = document.getElementById("comment-modicon-tex");
    const xml = document.getElementById("comment-modicon-xml");
    const texLine = document.getElementById("modicontex-line");
    const xmlLine = document.getElementById("modiconxml-line");
    checkBox.checked = false;
    checkBox.addEventListener("change", event => {
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
    option.id = `config-${config.configid}-option-${option.optionid}-input`;
    option.output = optionCode;
    option.output.id = option.id.replace("input", "output");
    optionsDiv.setAttribute("optioncount", parseInt(countStr) + 1);
    Array.from(document.querySelectorAll(`#${option.id} .input-config`), input => {
        switch (input.name) {
            case "option-data":
                registerOptionInputListener(input, option, true);
                break;
            case "option-label":
            case "option-hover":
                registerOptionInputListener(input, option, false);
                break;
        }
    });
    const radio = document.querySelector(`#${option.id} .option-radio-input`);
    registerRadioConfigListener(radio, config, radioChecked);
    window.scrollBy(0, option.clientHeight);
    console.log("Option set up with id of " + option.id);
}

function registerOptionInputListener(input, option, calcDataType=false) {
    input.output = document.querySelector(`#${option.output.id} .${input.name}`)
    input.addEventListener("input", _ => {
        setCodeFromInput(input, override=null, typeCheck = input.name == "option-data")
    });
}

let checkedRadio;
function registerRadioConfigListener(radio, config, startChecked) {
    const output = config.output.getChildWithClass("config-default");
    radio.name = radio.name.replace(/#/, config.configid);
    radio.input = radio.parentNode.getChildWithClass("option-data-input");

    function onchange() {
        if (checkedRadio) checkedRadio.input.outputs = null;
        output.innerText = typeAndOutput(radio.input.value, output);
        radio.input.outputs = [radio.input.output, output];
        checkedRadio = radio;
    }
    if (startChecked) {
        radio.checked = true;
        onchange();
    }

    radio.addEventListener("change", onchange);
}

{
    const optionClone = document.querySelector(".option");
    optionClone.optionid = 0
    const optionCodeClone = document.querySelector(".option-code");
    function onAddOptionClick(event) {
        const btn = event.target;
        if (!btn.optionsDiv) {
            btn.optionsDiv = btn.parentNode.getChildWithClass("options");
        }
        newOption = optionClone.cloneNode(deep=true);
        newOptionCode = optionCodeClone.cloneNode(deep=true)
        unCheckRadios(newOption);
        btn.optionsDiv.appendChild(newOption);
        btn.optionsDiv.output.appendChild(newOptionCode);
        optionSetUp(newOption, btn.optionsDiv, newOptionCode);
    }
}


{
    const addBtn = document.getElementById("add-config");
    const configClone = document.querySelector(".configuration");
    addBtn.addEventListener("click", addConfig);
    function addConfig() {
        const newConfig = configClone.cloneNode(deep=true);
        newConfig.hidden = false;
        addBtn.parentNode.insertBefore(newConfig, addBtn);
        configIdCount++;
        configSetup(newConfig);
        window.scrollBy(0, newConfig.clientHeight);
        
    }
}

function configSetup(config) {
    config.configid = configIdCount;
    config.id = `configform-${configIdCount}`;
    const legend = config.getChildWithClass("configuration-legend");
    const count = document.querySelectorAll(".configuration").length - 1;
    legend.innerText = legend.innerText.replace(/#/, count);
    makeCollapsable(legend, legend.nextElementSibling);
    console.log("Config set up with id of " + config.configid);
    createConfigCode(config);
}
{
    const configCodeClone = document.querySelector(".configCode");
    const configs = document.getElementById("configs");

    function createConfigCode(configForm) {
        const newConfigCode = configCodeClone.cloneNode(deep=true);
        newConfigCode.hidden = false;
        configForm.output = newConfigCode;
        configs.appendChild(newConfigCode);
        const id = "configcode-" + configForm.configid;
        newConfigCode.id = id;

        configInputSetup(configForm.id, id);
    }
}

function configInputSetup(formId, codeId) {
    console.log("CONFIG INPUT SETUP");
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
    for (i = 0; i < optionForms.length; i++) {
        const form = optionForms[i];
        const code = optionCodes[i];
        
        form.parentNode.output = code.parentNode;
        optionSetUp(form, form.parentNode, code, radioChecked = form==optionForms[0]);
    }
}


function onOptionDeleteClick(event) {
    const option = event.target.getParentWithClass("option");
    option.output.remove();
    option.remove();
}

<<<<<<< HEAD
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

function dragdropped(event) {
    dragCount = 0;
    event.target.classList.remove("dragover")
    console.log(event.target.files);
    let content = "";
    let fr = new FileReader();
    fr.onloadend = function() {
        content = fr.result;
    }
    fr.readAsText(event.target.files[0]);
    console.log(content);
}

=======
>>>>>>> c827c35b1e036c66dec955a7c0feb0c68f7a7225
function onOptionDuplicateClick(event) {
    const btn = event.target;
    if (!btn.optionDiv) {
        btn.option = btn.getParentWithClass("option");
    }

    const newOption = btn.option.cloneNode(deep=true);
    const optionsDiv = btn.option.parentNode
    const optionCode = btn.option.output.cloneNode(deep=true);
    unCheckRadios(newOption);
    optionsDiv.insertBefore(newOption, btn.option.nextElementSibling);
    optionsDiv.output.insertBefore(optionCode, btn.option.output.nextElementSibling);
    optionSetUp(newOption, optionsDiv, optionCode);
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
        if (item.type.match(/checkbox|radio/)) {
            item.checked = Boolean(item.getAttribute("default"));
        } else {
            item.value = item.getAttribute("default") || '';
        }
        setCodeFromInput(item);
        switch (item.id) {
            case "version-input":
            case "apiversion-input":
                {
                    const versionError = document.getElementById(item.output.id + "-error");
                    item.addEventListener("input", _ => {
                        if (item.value.match(/[^.\d]/)) {
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
                    item.addEventListener('input', _ => {
                        if (item.value && !item.value.startsWith('https://forums.kleientertainment.com/')) {
                            errorText.hidden = false;
                        } else {
                            setCodeFromInput(item);
                            errorText.hidden = true;
                        }
                    });
                    break;
                }
            case "modicontex-input":
            case "modiconxml-input":
                {
                    const suffix = item.getAttribute("suffix");
                    item.addEventListener('input', _ => {
                        if (!item.value.endsWith(suffix)) {
                            setCodeFromInput(item, override=item.value + suffix);
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
                        args = item.value.replaceAll(argSplit, ' ').trim().split(/\s+/)
                        console.log(args);
                        for (i = 0; i < args.length; i++) {
                            args[i] = `<span class="str">"${escapeText(args[i])}"</span>, `
                        }
                        item.output.innerHTML = args.join('');
                    });
                    break;
                }
            default:
                {
                    console.log(item.id);
                    item.addEventListener("input", _ => {
                        setCodeFromInput(item);
                    });
                    break;
                }
        }
    
    });
}

respondToInputs();
makeCollapsable(document.getElementById("advanced-toggle"), document.getElementById("advanced"));
//makeCollapsable(document.querySelector(".configuration-legend"), document.querySelector(".configuration-content"));
modiconCheckBox();
copyButtonHandler();
