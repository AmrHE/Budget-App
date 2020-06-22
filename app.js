//Module for Budget control
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    //add the calculatePercentage method to the prototype of the Expense constructor
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };

    //Add getPercentage method to the prototype of the Expense constructor
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };


    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //calculate the total expenses and income
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    //The data structure object
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: [],
            inc: []
        },
        budget: 0,
        percentage: -1,
    };

    return{
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //Create new item ID
            //ID = last ID + 1
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            
            //Create New Item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            //push into data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            // ids = [1, 2, 4, 6, 8]
            // id = 6;
            // index = 3;

            //Create a new array for all the ids
           ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            //retrieve the index of each id
            index = ids.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            //1.Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //2.Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. calculate the percentage of expenses
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc)  * 100);

            }else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            /*
            income=100
            a=20 ==>20%
            b=10 ==>10%
            c=40 ==>40%
            */
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: function() {
           var allPercentages =  data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
           });
           return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        testing: function() {
            console.log(data);
        }
    };

})();








//Module for user interface controller
var UIController = (function() {


    //DOM handler
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        //+ or - before the number
        //2 decimal points
        //comma separator for the thousands
        // EXAMPLE: 2310.4567 ==> +2,310.46


        //Math.abs is a method that return the absolute value of the passed parameter (number)
        num = Math.abs(num);

        //toFixed is a method that used to put 2 decimal points
        num = num.toFixed(2);

        //Adding the comma to the thousnads numbers
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3) {
            int.substr(0, int.length - 3 ) + ',' + int.substr(int.length -3 , 3)
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++){
            callback(list[i], i)
        }
    };


    //Public Methods
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,//will be either inc for income or exp for expenses
                description: document.querySelector(DOMstrings.inputDescription).value,
                
                // Using parseFloat to convert string to Floats "decimal numbers"
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {

            //Create HTML string with placeholder text
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //Replace the placeholder text with the data we receive from the object
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(SelectorID) {
            var element = document.getElementById(SelectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function() {
            var fields, fieldsArr;
            
            //call the fields we need to clear
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            //create an array instead of the list that querySelectorAll return as default
            fieldsArr = Array.prototype.slice.call(fields);

            //loop over the Array items (fields) to clear them using forEach loop
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });

            //turn the focus back to the description field
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent =formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
           
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            
            nodeListForEach(fields, function(current, index) {

            if(percentages[index] > 0){
                current.textContent = percentages[index] + '%';
            }else {
                current.textContent = '---';
            }
            });
        },


        //Add the date to the top part 
        displayDate: function() {
            var now, year, month, months;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
           
             //Current month getter
            month = now.getMonth();
            
            //Current year getter
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
             
        },

        //Toggle the input fields and button from blue to red and viceVersa
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus')
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();









//Global App Controller
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {

        //calling the DOMstrings object
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
        // "which" keyword is the alternative for "keyCode" keyword in the older browsers
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        //1. calculate the budget
        budgetCtrl.calculateBudget();

        //2. returnn the budget
        var budget = budgetCtrl.getBudget();

        //3. display the budget on the UI
        UICtrl.displayBudget(budget)
    };

    var updatePercentages = function() {
        //1. calculate precentage
        budgetCtrl.calculatePercentages();

        //2. Read precentage from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Display the new percentages
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function() {
        var input, newItem;

        //1. get the field input data
        var input = UICtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value >0){
            //2. add the item to the budget controller
        var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3. add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        //4. clear the input fields
        UICtrl.clearFields();

        //5. calculate and update budget
        updateBudget();

        //6.calculate and update precentages
        updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID,  splitID, type, ID;

        //Selecting the div element through the delete icon using the parentNode (Evenet delegation)
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            //the split method splits the string right after the ('-')
            //inc-1 ===> 'inc', '1'
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. Delete the Item from the data structure
            budgetController.deleteItem(type, ID);

            //2.delete the item from the user interface
            UICtrl.deleteListItem(itemID);

            //3.update and show the new totals
            updateBudget();

            //4.calculate and update precentages
            updatePercentages();
        }
   
    };

    return {
        init: function() {
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            })
            setupEventListeners();
        }
    }

    
})(budgetController, UIController);

//setupEventListeners invoking/calling
controller.init();