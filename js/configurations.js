"use strict";
const configsCode = document.getElementById("configs");
const configsElem = ConfigsFormSetup(document.getElementById("configs-form"));
function ConfigsFormSetup(configsForm) {
    configsForm.configsArr = [];
    return configsForm;
}
function resetConfigLegendNumbers() {
    const configsArr = configsElem.configsArr;
    if (configsArr == null) {
        console.assert(false);
        return;
    }
    for (let i = 0; i < configsArr.length; i++) {
        const legend = configsArr[i].legend;
        if (legend == null) {
            console.error("Config does not have legend property", configsArr[i]);
            return;
        }
        legend.innerText = legend.innerText.replace(/[\d#]+/, (i + 1).toString());
    }
}
function onRemoveConfigClick(btn) {
    const config = btn.getParentWithClass("configuration");
    if (config.output == null) {
        console.assert(false);
        return;
    }
    config.output.remove();
    if (configsElem.configsArr == null) {
        console.assert(false);
        return;
    }
    configsElem.configsArr.splice(configsElem.configsArr.indexOf(config), 1);
    window.scrollBy(0, (config.clientHeight ?? 0) * -1);
    if (!config.remove) { // why do i need to do this typescript?
        console.assert(false);
        return;
    }
    config.remove();
    resetConfigLegendNumbers();
}
function configInputSetup(config, codeId) {
    if (config.labelInput == null || config.nameInput == null || config.hoverInput == null) {
        console.assert(false);
        return;
    }
    config.labelInput.output = document.querySelector(`#${codeId} .config-label`);
    config.nameInput.outputs = Array.from(document.querySelectorAll(`#${codeId} .config-name`));
    config.hoverInput.output = document.querySelector(`#${codeId} .config-hover`);
    config.labelInput.addEventListener("input", _ => {
        setCodeFromInput(config.labelInput);
    });
    config.nameInput.addEventListener("input", _ => {
        setCodeFromInput(config.nameInput);
    });
    config.hoverInput.addEventListener("input", _ => {
        setCodeFromInput(config.hoverInput);
    });
    listenCompleteEmoji(config.labelInput);
    listenCompleteEmoji(config.nameInput);
    listenCompleteEmoji(config.hoverInput);
    const options = config.optionsForm.children;
    const optionCodes = document.querySelectorAll(`#${codeId} .option-code`);
    config.optionsForm.output = optionCodes[0]?.parentNode || document.querySelector(`#${codeId} .options-code`);
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const code = optionCodes[i];
        optionSetup(option, config.optionsForm, code, option == options[0]);
        option.config.optionsArr.push(option);
    }
}
function onDuplicateConfigClick(btn) {
    if (!btn.config) {
        btn.config = btn.getParentWithClass("configuration");
    }
    let tempUncheckIndex; // need to do this so when it is cloned it doesnt steal the radio check before 
    let tempUnchecked; // its name is changed 
    // TODO: alternative to any that doesnt make compiler thing it's type "never"
    btn.config.optionsArr.every((option, index) => {
        if (option.default.checked) {
            tempUncheckIndex = index;
            tempUnchecked = option.default;
            option.default.checked = false;
            return false;
        }
        return true;
    });
    const newConfigDiv = btn.config.cloneNode(true);
    if (tempUnchecked != null && tempUnchecked) {
        tempUnchecked.checked = true;
    }
    configsElem.insertBefore(newConfigDiv, btn.config.nextElementSibling);
    const index = configsElem.configsArr.indexOf(btn.config) + 1;
    const newConfig = configSetup(newConfigDiv);
    //newConfig.legend.dispatchEvent(new Event("click"));
    const newCode = btn.config.output.cloneNode(true);
    newCode.id = "configcode-" + newConfig.configid;
    configsCode.insertBefore(newCode, btn.config.output.nextElementSibling);
    newConfig.output = newCode;
    configInputSetup(newConfig, newCode.id);
    if (tempUncheckIndex != null) {
        newConfig.optionsArr[tempUncheckIndex].default.checked = true;
    }
    configsElem.configsArr.splice(index, 0, newConfigDiv);
    resetConfigLegendNumbers();
    return newConfig;
}
const addBtn = document.getElementById("add-config");
const configClone = document.querySelector(".configuration");
addBtn.addEventListener("click", _ => {
    addConfig().nameInput.focus();
});
function addConfig() {
    const newConfig = configClone.cloneNode(true);
    newConfig.hidden = false;
    configsElem.insertBefore(newConfig, addBtn);
    configSetup(newConfig);
    window.scrollBy(0, newConfig.clientHeight ?? 0);
    createConfigCode(newConfig);
    configsElem.configsArr.push(newConfig);
    return newConfig;
}
function configSetup(config) {
    configIdCount++;
    config.optionsArr = [];
    config.configid = configIdCount;
    config.id = `configform-${configIdCount}`;
    const legend = config.querySelector(".configuration-legend");
    const count = configsElem.configsArr.length + 1;
    legend.innerText = legend.innerText.replace(/[#\d]+/, count.toString());
    makeCollapsable(legend, legend.nextElementSibling);
    config.nameInput = document.querySelector(`#${config.id} .config-name-input`);
    config.hoverInput = document.querySelector(`#${config.id} .config-hover-input`);
    config.labelInput = document.querySelector(`#${config.id} .config-label-input`);
    config.optionsForm = document.querySelector(`#${config.id} .options`);
    config.legend = legend;
    return config;
}
const configCodeClone = document.querySelector(".configCode");
function createConfigCode(configForm) {
    const newConfigCode = configCodeClone.cloneNode(true);
    newConfigCode.hidden = false;
    configForm.output = newConfigCode;
    configsCode.appendChild(newConfigCode);
    const id = "configcode-" + configForm.configid;
    newConfigCode.id = id;
    configInputSetup(configForm, id);
}
function onOptionDeleteClick(btn) {
    const option = btn.getParentWithClass("option");
    option.output.remove();
    const optionsArr = option.config.optionsArr;
    const index = optionsArr.indexOf(option);
    optionsArr.splice(index, 1);
    if (option.default.checked) {
        if (optionsArr.length) {
            optionsArr[Math.min(index, optionsArr.length - 1)].default.checked = true;
        }
    }
    option.remove();
}
function onOptionDuplicateClick(btn) {
    if (btn.option == null) {
        btn.option = btn.getParentWithClass("option");
    }
    const radio = btn.option.default;
    const wasChecked = radio.checked; //temp
    radio.checked = false;
    const newOption = btn.option.cloneNode(true);
    //dont want cloned option to steal radio check!
    radio.checked = wasChecked;
    const optionsDiv = btn.option.parentNode;
    const optionCode = btn.option.output.cloneNode(true);
    unCheckRadios(newOption);
    optionsDiv.insertBefore(newOption, btn.option.nextElementSibling);
    optionsDiv.output.insertBefore(optionCode, btn.option.output.nextElementSibling);
    optionSetup(newOption, optionsDiv, optionCode);
    if (newOption.config == null) {
        throw new Error("newOption.config == null");
    }
    const optionsArr = newOption.config.optionsArr;
    const index = optionsArr.indexOf(btn.option) + 1;
    optionsArr.splice(index, 0, newOption);
}
function optionSetup(option, optionsDiv, optionCode, radioChecked = null) {
    const config = optionsDiv.getParentWithClass("configuration");
    const countStr = optionsDiv.getAttribute("optioncount");
    if (countStr == null) {
        throw new Error("countStr == null");
    }
    const count = parseInt(countStr);
    if (radioChecked == null) {
        radioChecked = !config.optionsArr.some((option) => {
            return option.default.checked;
        });
    }
    option.optionid = count;
    option.config = config;
    option.id = `config-${config.configid}-option-${option.optionid}-input`;
    option.output = optionCode;
    option.output.id = option.id.replace("input", "output");
    optionsDiv.setAttribute("optioncount", (count + 1).toString());
    for (const input of option.querySelectorAll(`.input-config`)) {
        switch (input.name) {
            case "option-data":
                option.dataInput = input;
                registerDataOptionInput(input, option);
                break;
            case "option-label":
                option.labelInput = input;
                registerLabelOptionInput(input, option);
                listenCompleteEmoji(input);
                break;
            case "option-hover":
                option.hoverInput = input;
                registerHoverOptionInput(input, option);
                listenCompleteEmoji(input);
                break;
        }
    }
    const radio = document.querySelector(`#${option.id} .option-radio-input`);
    option.default = radio;
    registerRadioConfigListener(radio, config, radioChecked);
    window.scrollBy(0, option.clientHeight ?? 0);
}
function registerDataOptionInput(input, option) {
    input.output = document.querySelector(`#${option.output.id} .option-data`);
    input.addEventListener("input", _ => {
        setCodeFromInput(input, input.value ? null : '""', true);
    });
}
function registerLabelOptionInput(input, option) {
    input.output = document.querySelector(`#${option.output.id} .option-label`);
    input.addEventListener("input", _ => {
        setCodeFromInput(input, null, false);
    });
}
function registerHoverOptionInput(input, option) {
    input.output = document.querySelector(`#${option.output.id} .option-hover`);
    input.focusElem = document.querySelector(`#${option.output.id} .option-hover-focus`);
    const line = input.output.getParentWithClass("option-hover-line");
    if (line == null)
        throw new Error();
    input.addEventListener("input", _ => {
        onInputFocus(input);
        if (input.value) {
            setCodeFromInput(input, null, false);
            line.hidden = false;
        }
        else {
            line.hidden = true;
        }
    });
}
let checkedRadio;
function registerRadioConfigListener(unsetupRadio, config, startChecked) {
    // console.log(config.output.children);
    unsetupRadio.output = config.output.querySelector(".config-default");
    console.assert(unsetupRadio.output && true, config.output);
    if (unsetupRadio.name == null)
        throw new Error("unsetupRadio.name == null");
    unsetupRadio.name = unsetupRadio.name.replace(/[#\d]+/, config.configid.toString());
    unsetupRadio.input = unsetupRadio.parentNode?.querySelector(".option-data-input");
    const radio = unsetupRadio;
    function onchange() {
        if (checkedRadio)
            checkedRadio.input.outputs = null;
        radio.input.outputs = [radio.input.output, radio.output];
        radio.input.dispatchEvent(new Event("input"));
        checkedRadio = radio;
    }
    if (startChecked) {
        unsetupRadio.checked = true;
        onchange();
    }
    unsetupRadio.addEventListener("change", onchange);
}
const optionClone = document.querySelector(".option");
optionClone.optionid = 0;
const optionCodeClone = document.querySelector(".option-code");
if (!optionClone || !optionCodeClone)
    throw new Error();
function onAddOptionClick(btn) {
    if (!btn.optionsDiv || !btn.select) {
        if (!(btn.nextElementSibling instanceof HTMLSelectElement) || !btn.parentNode)
            throw new Error();
        btn.optionsDiv = btn.getParentWithClass("configuration-content")?.querySelector(".options");
        if (!(btn.optionsDiv instanceof HTMLDivElement)) {
            throw new Error();
        }
        btn.select = btn.nextElementSibling;
    }
    switch (btn.select.value) {
        case "1":
            addOption(btn.optionsDiv).dataInput.focus();
            break;
        case "KEYS":
            const KEY_A = 65;
            const KEY_Z = KEY_A + 25;
            for (let i = KEY_A; i <= KEY_Z; i++) {
                const newOption = addOption(btn.optionsDiv);
                const char = String.fromCharCode(i);
                newOption.dataInput.triggerSetValue(char);
                newOption.labelInput.triggerSetValue(char);
            }
            btn.select.value = "1";
            break;
        case "INCREMENT":
            btn.select.value = "1";
            const modal = increment.modal;
            modal.optionsDiv = btn.optionsDiv;
            modal.show();
            //window.alert("Not implemented");
            break;
    }
}
function addOption(optionsDiv) {
    const newOption = optionClone.cloneNode(true);
    const newOptionCode = optionCodeClone.cloneNode(true);
    unCheckRadios(newOption);
    optionsDiv.appendChild(newOption);
    optionsDiv.output.appendChild(newOptionCode);
    optionSetup(newOption, optionsDiv, newOptionCode);
    if (!newOption.config)
        throw new Error();
    newOption.config.optionsArr.push(newOption);
    return newOption;
}
