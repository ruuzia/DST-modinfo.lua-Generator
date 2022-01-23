interface _CodeOutput {
    line?: HTMLSpanElement | HTMLDivElement;
}

type CodeOutput = _CodeOutput & (HTMLSpanElement | HTMLDivElement);


interface BaseFormInput {
    output?: CodeOutput,
    outputs?: CodeOutput[] | null,
    focusElem?: HTMLElement | null

    triggerSetValue (value: string | Boolean): void;
}


type DefaultFormInput = BaseFormInput & HTMLInputElement;

type TextAreaFormInput = BaseFormInput & HTMLTextAreaElement;

type FormInput = DefaultFormInput | TextAreaFormInput;

interface _Option {
    default: DefaultFormInput,
    hoverInput: DefaultFormInput,
    labelInput: DefaultFormInput,
    dataInput: DefaultFormInput,
    config: Config,
    optionid: number;
    output: HTMLDivElement;
}

type Option = _Option & HTMLDivElement;

type OptionPartial = Partial<_Option> & HTMLDivElement;

interface OptionsForm extends HTMLDivElement {
    output: CodeOutput;
}

interface Config extends HTMLDivElement {
    hoverInput: DefaultFormInput,
    nameInput: DefaultFormInput,
    labelInput: DefaultFormInput,
    optionsForm: OptionsForm,
    optionsArr: Option[],
    legend: HTMLLegendElement,
    output: HTMLDivElement,
    configid: number,
}

interface ConfigsForm extends HTMLFieldSetElement {
    configsArr: Config[]
}




const configsCode = document.getElementById("configs") as HTMLDivElement;
const configsElem = ConfigsFormSetup(document.getElementById("configs-form") as HTMLFieldSetElement);


function ConfigsFormSetup(configsForm: Partial<ConfigsForm>) {
    configsForm.configsArr = [];
    return configsForm as ConfigsForm;
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

        legend.innerText = legend.innerText.replace(/[\d#]+/, (i+1).toString());
    }
}

function onRemoveConfigClick(btn: HTMLButtonElement) {
    const config = btn.getParentWithClass("configuration") as Config;
    if (config.output == null) {
        console.assert(false);
        return;
    }
    config.output.remove();

    if (configsElem.configsArr == null) { console.assert(false); return;}

    configsElem.configsArr.splice(configsElem.configsArr.indexOf(config), 1);
    window.scrollBy(0, (config.clientHeight ?? 0) * -1);
    if (!config.remove) { // why do i need to do this typescript?
        console.assert(false);
        return;
    }
    config.remove();
    resetConfigLegendNumbers();
}


function configInputSetup(config: Config, codeId: string) {
    if (config.labelInput == null || config.nameInput == null || config.hoverInput == null) {
        console.assert(false);
        return;
    }
    config.labelInput.output = document.querySelector(`#${codeId} .config-label`) as HTMLSpanElement;
    config.nameInput.outputs = Array.from(document.querySelectorAll(`#${codeId} .config-name`) as NodeListOf<HTMLSpanElement>);
    config.hoverInput.output = document.querySelector(`#${codeId} .config-hover`) as HTMLSpanElement;

    config.labelInput.addEventListener("input", _ => {
        setCodeFromInput(config.labelInput);
    });
    config.nameInput.addEventListener("input", _ => {
        setCodeFromInput(config.nameInput);
    });
    config.hoverInput.addEventListener("input", _ => {
        setCodeFromInput(config.hoverInput);
    });

    listenCompleteEmoji(config.labelInput)
    listenCompleteEmoji(config.nameInput)
    listenCompleteEmoji(config.hoverInput)

    const options = config.optionsForm.children as HTMLCollectionOf<Option>;
    const optionCodes = document.querySelectorAll(`#${codeId} .option-code`);
    config.optionsForm.output = optionCodes[0]?.parentNode as HTMLDivElement || document.querySelector(`#${codeId} .options-code`) as HTMLDivElement;

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const code = optionCodes[i] as HTMLDivElement;
        optionSetup(option, config.optionsForm as OptionsForm, code, option == options[0]);
        option.config.optionsArr.push(option);
    }
}

interface DuplicateButton extends HTMLButtonElement {
    config: Config,
}

function onDuplicateConfigClick(btn: DuplicateButton) {
    if (!btn.config) {
        btn.config = btn.getParentWithClass("configuration") as Config;
    }

    let tempUncheckIndex; // need to do this so when it is cloned it doesnt steal the radio check before 
    let tempUnchecked: any;    // its name is changed 
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

    const newConfigDiv = btn.config.cloneNode(true) as HTMLDivElement;

    if (tempUnchecked != null && tempUnchecked) {
        tempUnchecked.checked = true;
    }

    configsElem.insertBefore(newConfigDiv, btn.config.nextElementSibling);
    const index = configsElem.configsArr.indexOf(btn.config) + 1;
    
    const newConfig: Config = configSetup(newConfigDiv);
    //newConfig.legend.dispatchEvent(new Event("click"));
    
    const newCode = btn.config.output.cloneNode(true) as HTMLDivElement;
    newCode.id = "configcode-" + newConfig.configid
    configsCode.insertBefore(newCode, btn.config.output.nextElementSibling);
    newConfig.output = newCode;
    configInputSetup(newConfig, newCode.id);
    
    if (tempUncheckIndex != null) {
        newConfig.optionsArr[tempUncheckIndex].default.checked = true;
    }
    configsElem.configsArr.splice(index, 0, newConfigDiv as Config);
    resetConfigLegendNumbers();
    return newConfig
}

const addBtn = document.getElementById("add-config") as HTMLButtonElement;
const configClone = document.querySelector(".configuration") as HTMLFieldSetElement;
addBtn.addEventListener("click", _ => {
    addConfig().nameInput.focus();
});

function addConfig(): Config {
    const newConfig = configClone.cloneNode(true) as Partial<Config>;
    newConfig.hidden = false;
    configsElem.insertBefore(newConfig as HTMLFieldSetElement, addBtn);
    configSetup(newConfig);
    window.scrollBy(0, newConfig.clientHeight ?? 0);
    createConfigCode(newConfig);
    configsElem.configsArr.push(newConfig as Config); 
    return <Config>newConfig;
}

function configSetup(config: Partial<Config>): Config {
    configIdCount++;
    config.optionsArr = [];
    config.configid = configIdCount;
    config.id = `configform-${configIdCount}`;

    const legend = (config as HTMLFieldSetElement).querySelector(".configuration-legend") as HTMLLegendElement;
    const count = configsElem.configsArr.length + 1;
    legend.innerText = legend.innerText.replace(/[#\d]+/, count.toString());
    makeCollapsable(legend, legend.nextElementSibling as HTMLElement);
    
    config.nameInput = document.querySelector(`#${config.id} .config-name-input`) as DefaultFormInput;
    config.hoverInput = document.querySelector(`#${config.id} .config-hover-input`) as DefaultFormInput;
    config.labelInput = document.querySelector(`#${config.id} .config-label-input`) as DefaultFormInput;
    config.optionsForm = document.querySelector(`#${config.id} .options`) as Option;
    config.legend = legend;

    return config as Config
}


const configCodeClone = document.querySelector(".configCode") as HTMLDivElement;

function createConfigCode(configForm: Partial<Config>) {
    const newConfigCode = configCodeClone.cloneNode(true) as HTMLDivElement;
    newConfigCode.hidden = false;
    configForm.output = newConfigCode;
    configsCode.appendChild(newConfigCode);
    const id = "configcode-" + configForm.configid;
    newConfigCode.id = id;

    configInputSetup(configForm as Config, id);
}


function onOptionDeleteClick(btn: HTMLButtonElement) {
    const option = btn.getParentWithClass("option") as Option;
    option.output.remove();
    const optionsArr = option.config.optionsArr;
    const index = optionsArr.indexOf(option);
    optionsArr.splice(index, 1);
    if (option.default.checked) {
        if (optionsArr.length) {
            optionsArr[Math.min(index, optionsArr.length-1)].default.checked = true;
        }
    }
    option.remove();
}

interface DuplicateOptionButton extends HTMLButtonElement {
    option?: Option;
}

function onOptionDuplicateClick(btn: DuplicateOptionButton) {
    if (btn.option == null) {
        btn.option = btn.getParentWithClass("option") as Option;
    }
    const radio = btn.option.default as DefaultFormInput;
    const wasChecked = radio.checked; //temp
    radio.checked = false;

    const newOption: OptionPartial = btn.option.cloneNode(true) as HTMLDivElement; 
    //dont want cloned option to steal radio check!
    radio.checked = wasChecked;

    const optionsDiv = btn.option.parentNode as OptionsForm;
    const optionCode = btn.option.output.cloneNode(true) as HTMLDivElement;
    unCheckRadios(newOption);
    optionsDiv.insertBefore(newOption as HTMLDivElement, btn.option.nextElementSibling);
    optionsDiv.output.insertBefore(optionCode, btn.option.output.nextElementSibling);
    optionSetup(newOption, optionsDiv, optionCode);
    if (newOption.config == null) {
        throw new Error("newOption.config == null");
    }
    const optionsArr = newOption.config.optionsArr
    const index = optionsArr.indexOf(btn.option) + 1;
    optionsArr.splice(index, 0, newOption as Option);
}

type PartiallySetupOption = Pick<Option, "optionid" | "config" | "output"> & HTMLDivElement;

function optionSetup (
        option: OptionPartial, 
        optionsDiv: OptionsForm, 
        optionCode: HTMLDivElement, 
        radioChecked: Boolean | null = null,
) {
    const config = optionsDiv.getParentWithClass("configuration") as Config;
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
    for (const input of (option.querySelectorAll(`.input-config`) as NodeListOf<DefaultFormInput>)) {
        switch (input.name) {
            case "option-data":
                option.dataInput = input;
                registerDataOptionInput(input, option as PartiallySetupOption);
                break;
            case "option-label":
                option.labelInput = input;
                registerLabelOptionInput(input, option as PartiallySetupOption);
                listenCompleteEmoji(input)
                break;
            case "option-hover":
                option.hoverInput = input;
                registerHoverOptionInput(input, option as PartiallySetupOption);
                listenCompleteEmoji(input)
                break;
        }
    }
    const radio = document.querySelector(`#${option.id} .option-radio-input`) as DefaultFormInput;
    option.default = radio;
    registerRadioConfigListener(radio, config, radioChecked);
    window.scrollBy(0, option.clientHeight ?? 0);
}

function registerDataOptionInput(input: DefaultFormInput, option: PartiallySetupOption) {
    input.output = document.querySelector(`#${option.output.id} .option-data`) as HTMLSpanElement;
    (input as HTMLInputElement).addEventListener("input", _ => {
        setCodeFromInput(input, input.value ? null : '""', true)
    });
}

function registerLabelOptionInput(input: DefaultFormInput, option: PartiallySetupOption) {
    input.output = document.querySelector(`#${option.output.id} .option-label`) as HTMLSpanElement;
    input.addEventListener("input", _ => {
        setCodeFromInput(input, null, false)
    });
}

function registerHoverOptionInput(input: DefaultFormInput, option: PartiallySetupOption) {
    input.output = document.querySelector(`#${option.output.id} .option-hover`) as HTMLSpanElement;
    input.focusElem = document.querySelector(`#${option.output.id} .option-hover-focus`) as HTMLSpanElement;
    const line = input.output.getParentWithClass("option-hover-line");
    if (line == null) throw new Error();
    input.addEventListener("input", _ => {
        onInputFocus(input);
        if (input.value) {
            setCodeFromInput(input, null, false)
            line.hidden = false;
        } else {
            line.hidden = true;
        }
    });
}

interface OptionDefaultRadio extends DefaultFormInput {
    input: FormInput;
}

let checkedRadio: OptionDefaultRadio | null;
function registerRadioConfigListener(unsetupRadio: Partial<OptionDefaultRadio> & HTMLInputElement, config: Config, startChecked: Boolean) {
    // console.log(config.output.children);
    
    unsetupRadio.output = config.output.querySelector(".config-default") as HTMLSpanElement;
    console.assert(unsetupRadio.output && true, config.output)
    if (unsetupRadio.name == null) throw new Error("unsetupRadio.name == null");
    unsetupRadio.name = unsetupRadio.name.replace(/[#\d]+/, config.configid.toString());
    unsetupRadio.input = unsetupRadio.parentNode?.querySelector(".option-data-input") as DefaultFormInput;

    const radio = unsetupRadio as OptionDefaultRadio;
    function onchange() {
        if (checkedRadio) checkedRadio.input.outputs = null;
        radio.input.outputs = [radio.input.output as CodeOutput, radio.output as CodeOutput];
        radio.input.dispatchEvent(new Event("input"));
        checkedRadio = radio;
    }
    if (startChecked) {
        unsetupRadio.checked = true;
        onchange();
    }

    unsetupRadio.addEventListener("change", onchange);
}


const optionClone: OptionPartial = document.querySelector(".option") as HTMLDivElement;
optionClone.optionid = 0
const optionCodeClone = document.querySelector(".option-code");
if (!optionClone || !optionCodeClone) throw new Error();

interface AddOptionButton extends HTMLButtonElement {
    optionsDiv?: OptionsForm,
    select?: HTMLSelectElement,
}

function onAddOptionClick(btn: AddOptionButton) {
    if (!btn.optionsDiv || !btn.select) {
        if(!(btn.nextElementSibling instanceof HTMLSelectElement) || !btn.parentNode) throw new Error();
        btn.optionsDiv = btn.getParentWithClass("configuration-content")?.querySelector(".options") as OptionsForm;
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

function addOption(optionsDiv: OptionsForm): Option {
    const newOption: OptionPartial = (optionClone as HTMLDivElement).cloneNode(true) as HTMLDivElement;
    const newOptionCode = (optionCodeClone as HTMLDivElement).cloneNode(true) as HTMLDivElement;
    unCheckRadios(newOption);
    optionsDiv.appendChild(newOption as HTMLDivElement);
    optionsDiv.output.appendChild(newOptionCode);
    optionSetup(newOption, optionsDiv, newOptionCode);
    if (!newOption.config) throw new Error();
    newOption.config.optionsArr.push(newOption as Option);
    return newOption as Option;
}
