class Calc {
    constructor() {
        this.ERROR = 'ERROR';
        this._displayEl = document.querySelector("#display");
        this._historyEl = document.querySelector("#history");

        this._operations = [];
        this._operators = ['-', '+', '*', '/', '%', '√', 'x²', '¹/x', '^', '(-'];
        this._basicOperators = ['-', '+', '*', '/', '%'];
        this._digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this._expOpen = false;
        this.initialize();
    }

    set display(value) {
        //if (typeof(value) == "undefined") value = this.ERROR;
        if (value == 'null') {
            this._displayEl.innerHTML = '0';
        } else {
            this._displayEl.innerHTML = value.replace('.', ',');
        }
    }

    set history(value) {
        this._historyEl.innerHTML = value;
    }

    initialize() {

        document.querySelectorAll(".btn").forEach(btn=>{
            btn.addEventListener('click', e=> {
                btn.blur(); // necessário para impedir que a tecla ENTER repita a ação do últimi botão clicado
                this.execAction(btn.innerHTML);
            });
        } );

        document.addEventListener('keyup', e=> {
            this.execAction(e.key);
        });

        this.history = '';
    }

    getOperation(position = 'last') {
        //console.log('Iniciando sequência getOperation (position = ' + position + ')');
        let index;
        if (this._operations.length == 0) index = 'null'
        else {
            switch(position) {
                case 'first'       : index = 0; break;
                case 'last'        : index = this._operations.length -1; break;
                case 'penultimate' : index = this._operations.length -2; break;
                default            : {
                    if (isNaN(position)) {
                        index = 'null';
                        //console.log('index 1', index);
                    } else {
                        index = parseInt(position);
                        //console.log('index 2', index);
                        if (index < 0) index = this._operations.length + index;
                        //console.log('index 3', index);
                    }
                    if (index > (this._operations.length - 1)) index = 'null';
                    //console.log('index 4', index);
                }
            }
        }
        //console.log('index 5', index);
        //console.log('Finalizando sequência getOperation');
        if ((index != 'null') && (index < this._operations.length)) return this._operations[index]
        else return index;
    }

    setOperation(operation, position = 'new') {
        if (position == 'new') this._operations.push(operation)
        else if (position == 'last') this._operations[this._operations.length -1] = operation
        else if (!isNaN(position)) this._operations[parseInt(position)] = operation;
        this.history = this._operations.join('');
        //console.log(this._operations);
    }

    deleteOperation(position = 'last') {
        if (this._operations.length > 0) {
            //console.log(this._operations);
            if (position == 'last') this._operations.pop()
            else if (!isNaN(position) && parseInt(position) < this._operations.length) this._operations.splice(position, 1);
            //console.log(this._operations);
            this.history = this._operations.join('');
            if (this.isOperator(this.getOperation('last'))) this.display = this.getOperation('penultimate')
            else this.display = this.getOperation('last');
        } this.clearCalculator();
}

    isOperator(value) {
        return this._operators.indexOf(value) > -1;
    }

    isBasicOperator(value) {
        return this._basicOperators.indexOf(value) > -1;
    }

    isDigit(value) {
        return this._digits.indexOf(value) > -1;
    }

    addNumber(number) {
        let newNumber = '';
        let lastOperation = this.getOperation('last');
        if (lastOperation == 'null' || this.isOperator(lastOperation)) {
            if (!((lastOperation == '%') && (this._operations.length > 2))) {
                newNumber = number;
                this.setOperation(newNumber, 'new');
            }
        } else {
            newNumber = lastOperation.replace('(', '').replace(')', '') + number;
            if (this.isBasicOperator(this.getOperation('penultimate')) && (parseFloat(newNumber) < 0)) {
                this.setOperation('(' + newNumber + ')', 'last');
            } else {
                this.setOperation(newNumber, 'last');
            }
        }  
        //console.log('addNumber', newNumber);
        if (newNumber != '') this.display = newNumber;
    }

    changeSign() {
        let newNumber;
        let lastOperation = this.getOperation('last');
        if (lastOperation != 'null' && !this.isOperator(lastOperation)) {
            newNumber = parseFloat(lastOperation.replace('(', '').replace(')', '')) * -1;
            lastOperation = newNumber.toString();
            if (newNumber < 0) lastOperation = '('+lastOperation+')';
            this.setOperation(lastOperation, 'last');
            this.display = newNumber.toString();
        }
    }

    addDot() {
        let newNumber;
        let lastOperation = this.getOperation('last');
        if (lastOperation == 'null' || this.isOperator(lastOperation)) {
            newNumber = '0.';
            this.setOperation(newNumber, 'new');
        } else {
            newNumber = lastOperation;
            if (lastOperation.split('').indexOf('.') == -1) newNumber += '.';
            this.setOperation(newNumber, 'last');
        }  
        this.display = newNumber;
    }

    addBasicOperator(operator) {
        let lastOperation = this.getOperation('last');
        if (operator == '-') {
            if (this.isBasicOperator(lastOperation)) {
                this.setOperation('(-', 'new');
            } else if (lastOperation != '(-') {
                if (this.getOperation(-3) == '(-') this.setOperation(')', 'new');
                this.setOperation(operator, 'new');
            }
        } else if (((lastOperation != 'null') && !this.isOperator(lastOperation)) || (lastOperation == '%')) {
            //console.log('Operation => (-3)', this.getOperation(-3));
            if (!((operator == '%') && (this.getOperation('penultimate') == '%'))) {
                if ((this.getOperation('-3') == '(-') || (this.getOperation('penultimate') == '(-')) this.setOperation(')', 'new');
                this.setOperation(operator, 'new');
            }
        } else if (this.isBasicOperator(lastOperation)) this.setOperation(operator, 'last');
        //console.log('addBasic', operator);
    }

    addExtendedOperator(operator) {
        let lastOperation = this.getOperation('last');
        switch (operator) {
            case '√' : {
                if ((lastOperation == 'null') || this.isOperator(lastOperation)) this.setOperation(operator, 'new');
                break;
            }
            case 'x²' : {
                if (!isNaN(lastOperation)) {
                    this.setOperation('^', 'new');                 
                    this.setOperation('2', 'new');                
                } 
                break;
            }
            case '¹/x' : {
                if (!isNaN(lastOperation)) {
                    this.setOperation('1', 'last');                 
                    this.setOperation('/');                 
                    this.setOperation(lastOperation);                 
                } 
                break;
            }
        }
        //console.log('addExtended', operator);
    }

    calc() {
        if (this._operations.length >= 3) {
            let result = this.getResult();
            if (result == this.ERROR) {
                this._operations = [];
            } else {
                this._operations = [];
                result = result.toString();
                this.setOperation(result);
            }
            //console.log(result);
            this.display = result;
        }
    }

    getResult() {
        let result = '', i, penultimate = '', operations = [];
        //console.log('initilize getResult of ', this._operations.length, 'operations');
        //console.log('My operations is ', this._operations);
        for (i = 0; i < this._operations.length; i++) {
            if (this._operations[i] == '%' && i > 2) {
                if (['*', '/'].indexOf(this._operations[i - 2]) > -1) {
                    operations[operations.length - 1] = operations[operations.length - 1] / 100
                } else if (['-', '+'].indexOf(this._operations[i - 2]) > -1) {
                    operations[operations.length - 1] = operations[operations.length - 3] * operations[operations.length - 1] / 100;
                } else result = this.ERROR;
            } else if (this._operations[i] == '^') {
                operations[operations.length - 1] = 'Math.pow(' + this._operations[i-1] + ', ' + this._operations[i+1] + ')';
            } else if (penultimate == '√') {
                operations[operations.length - 1] = 'Math.sqrt(' + this._operations[i] + ')';
            } else if (penultimate != '^') operations.push(this._operations[i]);
            penultimate = this._operations[i];
            //console.log('with i =', i, 'news operations is', operations);
        }
        if (result == '') {
            try {
                result = eval(operations.join("")); 
            } catch(e) {
                result = this.ERROR;
            }
            //console.log('Result of', operations, 'is', result); 
        } //else console.log('Erro na operação', this._operations.join("")); 
        return result;
    }

    clearCalculator() {
        this._operations = [];
        this.display = '0';
        this.history = '';
    }

    clearEntry() {
        if (this._operations.length == 0) {
            this.clearCalculator();
        } else {
            this.deleteOperation('last');
        }
    }

    clearDigit() {
        if (this._operations.length == 0) this.clearCalculator()
        else {
            let lastOperation = this.getOperation('last');
            if (this.isOperator(lastOperation) || (lastOperation.length < 2)) this.deleteOperation('last')
            else {
                lastOperation = lastOperation.substr(0, (lastOperation.length - 1));
                this.setOperation(lastOperation, 'last');
                this.display = lastOperation;
            }
        }
    }

    execAction(action) {
        //console.log('action', action);
        if (action.toUpperCase() == 'X') action = '*';
        if (action.toUpperCase() == '÷') action = '/';
        if (this.isDigit(action)) this.addNumber(action)
        else if (this.isOperator(action)) {
            if (this.isBasicOperator(action)) this.addBasicOperator(action) 
            else this.addExtendedOperator(action)
        } else {
            switch(action) {
                case 'Escape':
                case 'c':
                case 'C': this.clearCalculator(); break;
                case 'Delete':
                case 'CE': this.clearEntry(); break;
                case 'Backspace':
                case '←': this.clearDigit(); break;
                case '±': this.changeSign(); break;
                case '.':
                case ',': this.addDot(); break;
                case 'Enter':
                case '=': this.calc(); break;
            }
        }
    }

}