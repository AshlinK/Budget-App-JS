// Budget Controller

var budgetController=(function(){
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(current){
            sum+=current.value;
        })
        data.total[type]=sum;  
    };

    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        total:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };

    return {
        addItem:function(type,description,value){
            var newItem;
            // Create new ID and re create a new item based on inc or exp type
            if(data.allItems[type].length>0){
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }else{
                ID=0;
            }
            
            if (type==='exp'){
                newItem=new Expense(ID,description,value);
            }else if(type==='inc'){
                newItem=new Income(ID,description,value)
            }
            // Push it to our data structure.
            data.allItems[type].push(newItem);
            // return the new element.
            return newItem;
        },
        deleteItem:function(type,id){
            console.log(data.allItems[type]);
            var ids=data.allItems[type].map(function(current){
                return current.id;
            });
            index=ids.indexOf(parseInt(id));
            if(index!==-1){
                console.log("Deleting id"+id);
                data.allItems[type].splice(index,1); 
            }
        },
        calculateBudget:function(){
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // Calculate the budget: income - expenses
            data.budget=data.total.inc-data.total.exp;
            // Calculate percentage of income spent
            if (data.total.inc>0){
            data.percentage=Math.round((data.total.exp/data.total.inc)*100);
            }else{
                data.percentage=1;
            }
        },
        getBudget:function(){
            return {
                budget:data.budget,
                totalInc:data.total.inc,
                totalExp:data.total.exp,
                percentage:data.percentage
            }
        },
        testing:function(){
            console.log(data);
        }
    }
})();

// UI Controller

var UIController=(function(){

    var DOMStrings={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expenseContainer:'.expenses__list',
        budget:'.budget__value',
        totalIncome:'.budget__income--value',
        totalExp:'.budget__expenses--value',
        percentage:'.budget__expenses--percentage',
        container:'.container'

    }

    return{
        getInput:function(){
            return {
                    type:document.querySelector(DOMStrings.inputType).value,
                    description:document.querySelector(DOMStrings.inputDescription).value,
                    value:parseFloat(document.querySelector(DOMStrings.inputValue).value)
                }
        },
        addListItem:function(obj,type){
            // Create HTML string with placeholder text
            var html,newHtml,element;
            if(type==='inc'){
                element=DOMStrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">'+
                '<div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'+
                '</div></div></div>' ;
            }
            else if (type==='exp'){
                element=DOMStrings.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">'+
                '<div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'+
                '</div></div></div>' ;
            }
            // Replace placeholder with actual data
            newHtml=html.replace('%id%',obj.id); 
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',obj.value);

            // Insert the HTML into DO M
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);


        },
        deleteListItem:function(selectorId){
            var el=document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        clearFields:function(){
            var fields=document.querySelectorAll(DOMStrings.inputDescription+', '+DOMStrings.inputValue);
            var fieldsArr= Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value="";
            });
        },
        displayBudget:function(obj){
            document.querySelector(DOMStrings.budget).textContent=obj.budget;
            document.querySelector(DOMStrings.totalIncome).textContent=obj.totalInc;
            document.querySelector(DOMStrings.totalExp).textContent=obj.totalExp;
            if(obj.percentage>0){
            document.querySelector(DOMStrings.percentage).textContent=obj.percentage+"%";
            }else{
                document.querySelector(DOMStrings.percentage).textContent="----";
            }

        },
        getDOMStrings:function(){
            return DOMStrings;
        }
    }
})();

// Global App Controller

var controller=(function(budgetCtrl,UICtrl){

    var setUpEventListeners=function(){
        var DOM=UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(e){
        if (e.keyCode===13||e.which===13){
            ctrlAddItem(); 
        }});

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

    }

    var updateBudget=function(){
        // Calculate budget
        budgetCtrl.calculateBudget();

        // Return budget
        var budget=budgetCtrl.getBudget();

        // Display budget on UI.
        UICtrl.displayBudget(budget);
        
    }
    var ctrlAddItem=function(){
        // Get the field input data.
        var input=UICtrl.getInput();
        
        if (input.description !='' && !isNaN(input.value) && input.value>0){
        
         // Add the item to the budget controller.
        var newItem=budgetCtrl.addItem(input.type,input.description,input.value);
 
         // Add the item to the UI.
        UICtrl.addListItem(newItem,input.type);

         // Clear the fields
        UICtrl.clearFields();
 
         // Calculate the budget
        updateBudget();
        }
 
         // Display the budget on the UI.
 
     };
     var ctrlDeleteItem=function(event){
         var itemId,splitId,type,ID;
         itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
         if (itemId){
             splitId=itemId.split('-');
             type=splitId[0];
             ID=splitId[1];
            
             budgetCtrl.deleteItem(type,ID);
             UICtrl.deleteListItem(itemId);
             updateBudget();
         }
     };

    return{
        init:function(){
            console.log('Application has started.');
            setUpEventListeners();
            UICtrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:0    
            });
        }
    }; 
    
   
})(budgetController,UIController);
controller.init();


