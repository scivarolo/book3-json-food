/* 
  Function to build DOM elements
  Allows other DOM elements to be added as children
*/

function buildElement(el, cssClass, content, ...children) {
  let element = document.createElement(el);
  if (cssClass) {
    element.setAttribute("class", cssClass);
  }
  element.innerHTML = content || null;
  
  children.forEach((child) => {
    element.appendChild(child);
  });
  return element;
}

/* Function to build a food component with Build Element */

const buildFoodElement = (foodItem, externalDataEls) => {
  let itemHeader = buildElement("h1", null, foodItem.name);
  let itemType = buildElement("p", null, foodItem.type);
  let itemEthnicity = buildElement("p", null, foodItem.ethnicity);

  if (externalDataEls) {
    return buildElement("section", "foodItem", null, itemHeader, itemType, itemEthnicity, ...externalDataEls);
  } else {
    return buildElement("section", "foodItem", null, itemHeader, itemType, itemEthnicity);
  }
}

/* 
  Loop through food array to combine foodItems into a document fragment.
  Output the fragment into the specified container in DOM  
*/

const buildFoodGroup = (foodArray, container) => {
  let foodContainer = document.querySelector(container);
  let foodGroup = document.createDocumentFragment();
  foodArray.forEach((foodItem) => {
    // foodGroup.appendChild(buildFoodElement(foodItem));
    foodGroup.appendChild(foodItem);
  });

  foodContainer.appendChild(foodGroup);
}

/* 
  Fetch food from database and then query the Open Food API 
  and get more info about each item.
  https://world.openfoodfacts.org/api/v0/product/[barcode].json
*/

const fetchOpenFoodData = (localData) => {
  let promiseArray = [];

  //Build a Promise array of fetches to the external API
  localData.forEach((localFoodItem) => {
    promiseArray.push(
      fetch(`https://world.openfoodfacts.org/api/v0/product/${localFoodItem.barcode}.json`).then(response => response.json())
    );
  });
  return Promise.all(promiseArray);
}

/* 
  Gets data from local API.
  Then builds elements with just local data.
  Then uses local data to query the external API.
  Then builds elements with external data included.
*/

fetch('http://localhost:8088/food')
  .then((localFoodData) => localFoodData.json())
  .then((localFoodData) => {

    //Build elements with local data only
    let localOnlyEls = [];
    localFoodData.forEach((foodItem) => {
      localOnlyEls.push(buildFoodElement(foodItem));
    });
    buildFoodGroup(localOnlyEls, "#foodList");
    
    // Loop through Promise array to build out the elements to the DOM
    fetchOpenFoodData(localFoodData)
      .then((promiseArray) => {

        let foodEls = [];

        promiseArray.forEach((externalItemData, i) => {
          let externalDataEls = [];
          let localFoodItem = localFoodData[i];
          
          console.log(`API Data for ${localFoodItem.name}: `, externalItemData);

          externalDataEls.push(buildElement("p", null, externalItemData.product.ingredients_text));
          externalDataEls.push(buildElement("p", null, externalItemData.product.countries));
          externalDataEls.push(buildElement("p", null, externalItemData.product.nutriments.energy));
          externalDataEls.push(buildElement("p", null, externalItemData.product.nutriments.fat));
          externalDataEls.push(buildElement("p", null, externalItemData.product.nutriments.sugars));
          
          foodEls.push(buildFoodElement(localFoodItem, externalDataEls));
        });
        
        buildFoodGroup(foodEls, "#foodList2");
      
      });
  });
