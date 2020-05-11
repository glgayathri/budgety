//BUDGET Controller
let budgetController = (() => {
    let Expense = function (id, description, value)  {             //function constructor
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = (totalIncome) =>{
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = () => {
        return this.percentage;
    };

    let Income = function (id, description, value)  {             //function constructor
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach((current) => {
            sum += current.value;
        });
        data.totals[type] = sum;        
    };
    
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: (type, des, val) => {
            let newItem, ID;            
            //eg: [1, 2, 3, 4, 5] so, the next ID = 6
            // --what if certain elements are deleted from the array!
            //eg: [1, 2, 4, 5, 7] then next ID = 8 and != 6
            //:. ID = last ID + 1

            // create new ID
            if(data.allItems[type].length>0){
                ID = data.allItems[type][data.allItems[type].length - 1].id +1
            }
            else{
                ID = 0;
            }      
            //recreate new item based on 'inc' or 'exp' 
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            //push it into the data structure
            data.allItems[type].push(newItem);
            
            //finally return the new element
            return newItem;
        },

        deleteItem: (type, id) => {
            let index;
            //[1, 2, 4, 6, 8] ==> id = 6, index = 3
            // :. data.allItems[type][id] ----> doesn't work as we need index
            let ids = data.allItems[type].map((current) => {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: () => {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate the budget = (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.income) * 100);
                } else{
                    data.percentage = -1;
                }
        },

        calculatePercentages: ()=> {
            data.allItems.exp.forEach((cur) =>{
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: () => {
            let allPerc = data.allItems.exp.map((cur) => {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: () => {
            return{
                budget: data.budget, 
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: () => {
            console.log(data);
        }
    }
})();

//UI Controller
let UIController = (() => {
    
    let DOMStrings = {
        inputType:'.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLable: '.item__percentage',
        dateLable: '.budget__title--month'
    }; 
    
    let formatNumber = (num, type) => {
        let numSplit, int, dec;
        /* + or - in front of the number
            precetion til 2 decimal points
            comma separating the thousands*/
        num = Math.abs(num);
        num = num.toFixed(2);   // fixes to 2 decimals
        
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3,3); // i/p: 2310 --> o/p: 2.310
        }
        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + ' ' + int +'.' + dec;
    };

    let nodeListForEach = (list, callback) => {
        for (i=0; i< list.length; i++){
            callback(list[i], i);
        }
    };

    return{
        getinput: () => {
            return{
                type: document.querySelector(DOMStrings.inputType).value,   // will be either inc (+) or exp(-)
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: (obj, type) => {
            let html, newHtml, element;       
            //create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                //%id% --> place holder text is easier to find and doesn't get overwritten
                html ='<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)            
        },

        deleteListItem: (selectorID) => {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: () => {
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            //'queryselectorall method doesn't give an array, rather gives a list. so, call the array prototype and pass the field list as a argument
            fieldsArr = Array.prototype.slice.call(fields);           
            
            fieldsArr.forEach(current => {
                current.value = "";                
            });
            fieldsArr[0].focus();
        },

        displayBudget: (obj) => {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLable).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLable).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLable).textContent = obj.percentage + '%';
                } else {
                    document.querySelector(DOMStrings.percentageLable).textContent = '---';
                }
        },

        displayPercentages: (percentages) => {
            let fields = document.querySelectorAll(DOMStrings.expensesPercLable);

            nodeListForEach(fields, (current, index) =>{
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: () => {
            let now, year, month, months;
            now = new Date(); // jul = new Date (2020, 12, 25);
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLable).textContent = months[month] + ' ' + year;
        },

        changedType: () => {
            let fields = document.querySelectorAll(
                DOMStrings.inputType +','+
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );
            nodeListForEach(fields, (cur) => {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStings: () => {
            return DOMStrings;
        }
    }    
})();

//GLOBAL APP Controller
let controller =((budgetctrl, UICtrl) => {

    let setupEventListeners = () => {
        let DOM = UICtrl.getDOMStings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    
    }    

    let updateBudget = () => {
        
        //1. Calculate the budget
        budgetctrl.calculateBudget();

        //2. Return the budget
        let budget = budgetctrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    let updatePercentages = () => {
        //1. Calculate the percentages
        budgetctrl.calculatePercentages();

        //2. Read percentages from Budgert controller
        let percentages = budgetctrl.getPercentages();
        
        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);        
    };

    let ctrlAddItem = () => {
        let input, newItem;        
        
        //1. get the filed input data
        input = UICtrl.getinput();  //getinput() is the public method

        if(input.description !== "" && input.value !== NaN && input.value > 0){            //(**----** && !isNaN(input.value) && **----**)
        //2. Add the item to the budget controller
        newItem = budgetctrl.addItem(input.type, input.description, input.value);

        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        //4. clear the fields
        UICtrl.clearFields();

        //5. calculate and update budget
        updateBudget();

        //6. calculate and update percentages
        updatePercentages();
        }        
    };
    let ctrlDeleteItem = (event) => {
        let itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            //1. delete the item from the data structure
            budgetctrl.deleteItem(type, id);

            //2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. update and show the new budget
            updateBudget();

            //4. calculate and update percentages
            updatePercentages();
        }
    }
    return {
        init: () =>{
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0, 
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();