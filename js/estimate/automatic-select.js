var t = TrelloPowerUp.iframe();
var cardInfoKey = 'pappira.cardInfo';
var listId = '5a9ef0ce024c776a21220836';
var wizardForm =  document.getElementById('wizardForm');
var work;
var finalWorkOptions;

t.render(function(){
	return t.get('card', 'shared', cardInfoKey)
	.then(function(cardInfo){
    if(!t.arg('update')){
      createWorkTypeSelectPanel();
		}
	});
});

var createWorkTypeSelectPanel = function(){
  var wizardElement = createScreen('workType','Tipo de trabajo',workTypes,nextAfterWorkTypeSelect);
  wizardForm.appendChild(wizardElement);
}

var createWorkSelectPanel = function(works){
  var wizardElement = createScreen('work','Trabajo',works,nextAfterWorkSelect);
  wizardForm.appendChild(wizardElement);
}

var createScreen = function(type,titulo,possibilities,nextFunction){
  var div = createElement('div','row setup-content',type); 
  var title = createElement('h3','','',titulo); 
  var divRow = createElement('div','row','','');
  div.appendChild(title);
  for (var i = 0; i < possibilities.length;i++){
    var possibility = possibilities[i];
    var card = createHTMLCard(possibility.image,possibility.name,type,possibility.id,nextFunction);
    divRow.appendChild(card);
  }
  div.appendChild(divRow);
  return div;
}

var nextAfterWorkTypeSelect = function(){
  selectedWorkTypeId = $(this).attr('id').substring($(this).attr('id').indexOf('-')+1);
  var possibleWorks = works.filter(work => work.workTypeId == selectedWorkTypeId);
  deleteWizard();
  createWorkSelectPanel(possibleWorks);
}

var deleteWizard = function(){
  while(wizardForm.firstChild){
    wizardForm.removeChild(wizardForm.firstChild);
  }
  $(".stepwizard-step").remove();
}


var nextAfterWorkSelect = function(){
  var elementId = $(this).attr('id');
  var id = elementId.substring(elementId.indexOf('-')+1);
  selectedWorkId = id;
  work = works[id];
  deleteWizard();
  
  work.options.forEach(function(option){
    if(option.values!=null){
      var subDiv = createMultipleSelect(option);
      wizardForm.appendChild(subDiv);
    }else{
      var subDiv = createChips(option);
      wizardForm.appendChild(subDiv);
    }
  });
  var div = createElement('div','chips');
  var input = createElement('input','','','','number');
  div.appendChild(input);
  var divLoader = createElement('div','','loader');
  wizardForm.appendChild(divLoader);
  var a = createElement('a','waves-effect waves-light btn','button-generate-estimate','Presupuestar');
  wizardForm.appendChild(a);
  
  document.getElementById('button-generate-estimate').addEventListener('click', createEstimateAndUpdateCard);

  $('.chips').each(function() {
    var currentElement = $(this);
    var id = currentElement.attr('id');
    currentElement.chips({
      placeholder: id,
      secondaryPlaceholder: '+' + id
    });
  });

  $('select').formSelect();
  $('select').each(function() {
    var currentElement = $(this);
    currentElement.on('change', function(){
      checkIncidences($(this));
    });
  });
}

var createEstimateAndUpdateCard = function(){
  startLoader();
  var workRequest = createRequest();
  var estimate = sendRequest(workRequest);
  estimate.work.items.sort(orderItems());
  createCard(estimate);
}

var createRequest = function(){
  finalWorkOptions = JSON.parse(JSON.stringify(work));
  var cellsInformation = [];
  $('.chips').each(function() {
    var currentElement = $(this);
    var id = currentElement.attr('id');
    for (i = 0; i < work.options.length;i++){
      var option = work.options[i];
      if (option.name==id){
        var cellInformation = {};
        cellInformation.range = option.cell;
        cellInformation.values = M.Chips.getInstance(currentElement).chipsData.map(chip => chip.tag);
        finalWorkOptions.options[i].values = cellInformation.values;
        cellsInformation.push(cellInformation);
        break;
      }
    }
  });
  $('select').each(function() {
    var currentElement = $(this);
    var id = currentElement.parent().parent().attr('id');
    for (i = 0; i < work.options.length;i++){
      var option = work.options[i];
      if (option.name==id){
        var materializeSelect = M.FormSelect.getInstance(currentElement);
        if (!materializeSelect.input.disabled){
          var cellInformation = {};
          cellInformation.range = option.cell;
          cellInformation.values = materializeSelect.getSelectedValues();
          finalWorkOptions.options[i].values = cellInformation.values;
          cellsInformation.push(cellInformation);
        }
        break;
      }
    }
  });
  workRequest = {};
  workRequest.spreadSheetId = work.spreadSheetId;
  workRequest.sheetName = work.sheetName;
  workRequest.cellsInformation = cellsInformation;
  return workRequest;
}

var createChips = function(option){
  var div = createElement('div','chips',option.name);
  var input = createElement('input','','','','number');
  div.appendChild(input);
  
  return div;
}
var createMultipleSelect = function(option){
  var div = createElement('div','input-field col s12',option.name);
  var attirbuteName = ['multiple'];
  var attributeValue = [true];
  if(option.disabled){
    attirbuteName.push('disabled');
    attributeValue.push(true);
  }
  var select = createElement('select','','','', '','','','','',attirbuteName,attributeValue);
  var label = createElement('label','','',option.name);
  for(j=0; j < option.values.length; j++){
    var value = option.values[j];
    var optionHtml = createElement('option','','',value, '','',j+1,'',true);
    select.appendChild(optionHtml);
  }
  div.appendChild(select);
  div.appendChild(label);
  return div;

}

var checkIncidences = function(element){
  var option =  work.options.filter(option => option.name == element.parent().parent().attr('id'))[0];
  if (option !=null){
    if (option.incidences !=null){
      for (k = 0; k < option.incidences.length; k++){
        var incidence = option.incidences[k];
        $('select').each(function() {
          var currentElement = $(this).parents().children('input');
          var currentElement2 = $(this);
          var id = currentElement.parent().parent().attr('id');
          if(id == incidence.name){
            if(M.FormSelect.getInstance(element).getSelectedValues().some(selectedValue => incidence.selected.includes(selectedValue))){
              if(incidence.active){
                currentElement.removeAttr('disabled');
                currentElement2.removeAttr('disabled');
              }else{
                currentElement.attr('disabled',true);
                currentElement2.attr('disabled',true);
              }
            }else{
              if(incidence.active){
                currentElement.attr('disabled',true);
                currentElement2.attr('disabled',true);
              }else{
                currentElement.removeAttr('disabled');
                currentElement2.removeAttr('disabled');
              }
            }
            currentElement2.formSelect();
          }
        });
      }
    }
  }
} 

var createHTMLCard = function(image,title,type,id,functionOnClick){
  var divCol = createElement('div','col m4','','');
  var divCard = createElement('div','card',type + '-' + id,'');
  var divCardImage = createElement('div','card-image waves-effect waves-block waves-light','','');
  var img = createElement('img','activator','','','','','','','',['src'],[image]);
  var span = createElement('span','card-title activator grey-text text-darken-4','',title);

  divCardImage.appendChild(img);
  divCardImage.appendChild(span);
  divCard.appendChild(divCardImage);
  divCol.appendChild(divCard);
  if (functionOnClick){
    divCard.addEventListener('click',functionOnClick)
  }
  return divCol;
}

var sendRequest = function(workRequest){
  var estimate = JSON.parse('{"id": 18402,"prices": [{"id": 18437,"quantity": 100,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 3592,"internalInformation": "Rulo 19","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra"},"allTheSame": true,"bleedPrint": true,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 80,"name": "Obra"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "36x51","quantityPerPaper": 4,"machine": "GTO52 Cromo","excess": 50},"price": 6485,"priceWithFinishes": 6485},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "42x27","faces": "SIMPLE_FAZ","material": {"gr": 150,"name": "Coteado"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Dura","price": 8775,"showToClient": true}],"price": 1758,"priceWithFinishes": 11402,"subItem": {"name": "Retiro de Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "30x21","faces": "SIMPLE_FAZ","material": {"gr": 120,"name": "#VALUE!"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 2,"machine": "Konica 1070 Color","excess": 4},"price": 869,"priceWithFinishes": 869}},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1350,"totalPrice": 26879},{"id": 18457,"quantity": 50,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 1330,"internalInformation": "Rulo 19","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": true,"bleedPrint": false,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 90,"name": "Obra"},"processDetails": {"sheetSize": "72x92","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "GTO46","excess": 50},"price": 3146,"priceWithFinishes": 3146},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "42x27","faces": "SIMPLE_FAZ","material": {"gr": 150,"name": "Coteado"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Dura","price": 3250,"showToClient": true}],"price": 676,"priceWithFinishes": 4272,"subItem": {"name": "Retiro de Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "30x21","faces": "SIMPLE_FAZ","material": {"gr": 120,"name": "#VALUE!"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 2,"machine": "Konica 1070 Color","excess": 4},"price": 346,"priceWithFinishes": 346}},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1000,"totalPrice": 11248},{"id": 18477,"quantity": 50,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 1188,"internalInformation": "Rulo 16","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra"},"allTheSame": true,"bleedPrint": true,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 90,"name": "Obra"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "36x51","quantityPerPaper": 4,"machine": "GTO52 Cromo","excess": 50},"price": 3046,"priceWithFinishes": 3046},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "33x21","faces": "SIMPLE_FAZ","material": {"gr": 250,"name": "Cartulina"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Semi-Dura","price": 750,"showToClient": true}],"price": 772,"priceWithFinishes": 1522},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1000,"totalPrice": 8256},{"id": 18493,"quantity": 100,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 3208,"internalInformation": "Rulo 16","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": true,"bleedPrint": false,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 90,"name": "Obra"},"processDetails": {"sheetSize": "72x92","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "GTO46","excess": 50},"price": 7034,"priceWithFinishes": 7034},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "33x21","faces": "SIMPLE_FAZ","material": {"gr": 250,"name": "Cartulina"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Semi-Dura","price": 2025,"showToClient": true}],"price": 2009,"priceWithFinishes": 4034},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1350,"totalPrice": 19676},{"id": 18507,"quantity": 50,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 1330,"internalInformation": "Rulo 19","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra"},"allTheSame": true,"bleedPrint": true,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 80,"name": "Obra"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "36x51","quantityPerPaper": 4,"machine": "GTO52 Cromo","excess": 50},"price": 2840,"priceWithFinishes": 2840},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "42x27","faces": "SIMPLE_FAZ","material": {"gr": 150,"name": "Coteado"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Dura","price": 3250,"showToClient": true}],"price": 676,"priceWithFinishes": 4272,"subItem": {"name": "Retiro de Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "30x21","faces": "SIMPLE_FAZ","material": {"gr": 120,"name": "#VALUE!"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 2,"machine": "Konica 1070 Color","excess": 4},"price": 346,"priceWithFinishes": 346}},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1000,"totalPrice": 9442},{"id": 18524,"quantity": 50,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 1188,"internalInformation": "Rulo 16","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra"},"allTheSame": true,"bleedPrint": true,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 80,"name": "Obra"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "36x51","quantityPerPaper": 4,"machine": "GTO52 Cromo","excess": 50},"price": 2840,"priceWithFinishes": 2840},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "33x21","faces": "SIMPLE_FAZ","material": {"gr": 250,"name": "Cartulina"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Semi-Dura","price": 750,"showToClient": true}],"price": 772,"priceWithFinishes": 1522},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1000,"totalPrice": 6550},{"id": 18539,"quantity": 50,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 1188,"internalInformation": "Rulo 16","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": true,"bleedPrint": false,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 90,"name": "Obra"},"processDetails": {"sheetSize": "72x92","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "GTO46","excess": 50},"price": 3146,"priceWithFinishes": 3146},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "33x21","faces": "SIMPLE_FAZ","material": {"gr": 250,"name": "Cartulina"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Semi-Dura","price": 750,"showToClient": true}],"price": 772,"priceWithFinishes": 1522},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1000,"totalPrice": 6856},{"id": 18552,"quantity": 100,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 3208,"internalInformation": "Rulo 16","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra"},"allTheSame": true,"bleedPrint": true,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 90,"name": "Obra"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "36x51","quantityPerPaper": 4,"machine": "GTO52 Cromo","excess": 50},"price": 7025,"priceWithFinishes": 7025},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "33x21","faces": "SIMPLE_FAZ","material": {"gr": 250,"name": "Cartulina"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Semi-Dura","price": 2025,"showToClient": true}],"price": 2009,"priceWithFinishes": 4034},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1350,"totalPrice": 15617},{"id": 18583,"quantity": 100,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 3208,"internalInformation": "Rulo 16","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": true,"bleedPrint": false,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 80,"name": "Obra"},"processDetails": {"sheetSize": "72x92","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "GTO46","excess": 50},"price": 6548,"priceWithFinishes": 6548},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "33x21","faces": "SIMPLE_FAZ","material": {"gr": 250,"name": "Cartulina"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Semi-Dura","price": 2025,"showToClient": true}],"price": 2009,"priceWithFinishes": 4034},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1350,"totalPrice": 19190},{"id": 18619,"quantity": 100,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 3208,"internalInformation": "Rulo 16","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra"},"allTheSame": true,"bleedPrint": true,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 80,"name": "Obra"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "36x51","quantityPerPaper": 4,"machine": "GTO52 Cromo","excess": 50},"price": 6485,"priceWithFinishes": 6485},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "33x21","faces": "SIMPLE_FAZ","material": {"gr": 250,"name": "Cartulina"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Semi-Dura","price": 2025,"showToClient": true}],"price": 2009,"priceWithFinishes": 4034},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1350,"totalPrice": 19127},{"id": 18650,"quantity": 100,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 3592,"internalInformation": "Rulo 19","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": true,"bleedPrint": false,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 80,"name": "Obra"},"processDetails": {"sheetSize": "72x92","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "GTO46","excess": 50},"price": 6548,"priceWithFinishes": 6548},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "42x27","faces": "SIMPLE_FAZ","material": {"gr": 150,"name": "Coteado"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Dura","price": 8775,"showToClient": true}],"price": 1758,"priceWithFinishes": 11402,"subItem": {"name": "Retiro de Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "30x21","faces": "SIMPLE_FAZ","material": {"gr": 120,"name": "#VALUE!"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 2,"machine": "Konica 1070 Color","excess": 4},"price": 869,"priceWithFinishes": 869}},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1350,"totalPrice": 26942},{"id": 18670,"quantity": 100,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 3592,"internalInformation": "Rulo 19","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": true,"bleedPrint": false,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 90,"name": "Obra"},"processDetails": {"sheetSize": "72x92","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "GTO46","excess": 50},"price": 7034,"priceWithFinishes": 7034},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "42x27","faces": "SIMPLE_FAZ","material": {"gr": 150,"name": "Coteado"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Dura","price": 8775,"showToClient": true}],"price": 1758,"priceWithFinishes": 11402,"subItem": {"name": "Retiro de Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "30x21","faces": "SIMPLE_FAZ","material": {"gr": 120,"name": "#VALUE!"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 2,"machine": "Konica 1070 Color","excess": 4},"price": 869,"priceWithFinishes": 869}},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1350,"totalPrice": 23378},{"id": 18704,"quantity": 50,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 1330,"internalInformation": "Rulo 19","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra"},"allTheSame": true,"bleedPrint": true,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 90,"name": "Obra"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "36x51","quantityPerPaper": 4,"machine": "GTO52 Cromo","excess": 50},"price": 3046,"priceWithFinishes": 3046},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "42x27","faces": "SIMPLE_FAZ","material": {"gr": 150,"name": "Coteado"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Dura","price": 3250,"showToClient": true}],"price": 676,"priceWithFinishes": 4272,"subItem": {"name": "Retiro de Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "30x21","faces": "SIMPLE_FAZ","material": {"gr": 120,"name": "#VALUE!"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 2,"machine": "Konica 1070 Color","excess": 4},"price": 346,"priceWithFinishes": 346}},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1000,"totalPrice": 11148},{"id": 18808,"quantity": 100,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 3592,"internalInformation": "Rulo 19","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra"},"allTheSame": true,"bleedPrint": true,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 90,"name": "Obra"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "36x51","quantityPerPaper": 4,"machine": "GTO52 Cromo","excess": 50},"price": 7025,"priceWithFinishes": 7025},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "42x27","faces": "SIMPLE_FAZ","material": {"gr": 150,"name": "Coteado"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Dura","price": 8775,"showToClient": true}],"price": 1758,"priceWithFinishes": 11402,"subItem": {"name": "Retiro de Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "30x21","faces": "SIMPLE_FAZ","material": {"gr": 120,"name": "#VALUE!"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 2,"machine": "Konica 1070 Color","excess": 4},"price": 869,"priceWithFinishes": 869}},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1350,"totalPrice": 23369},{"id": 18826,"quantity": 50,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 1330,"internalInformation": "Rulo 19","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": true,"bleedPrint": false,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 80,"name": "Obra"},"processDetails": {"sheetSize": "72x92","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "GTO46","excess": 50},"price": 2960,"priceWithFinishes": 2960},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "42x27","faces": "SIMPLE_FAZ","material": {"gr": 150,"name": "Coteado"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Dura","price": 3250,"showToClient": true}],"price": 676,"priceWithFinishes": 4272,"subItem": {"name": "Retiro de Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "30x21","faces": "SIMPLE_FAZ","material": {"gr": 120,"name": "#VALUE!"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 2,"machine": "Konica 1070 Color","excess": 4},"price": 346,"priceWithFinishes": 346}},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1000,"totalPrice": 9562},{"id": 18904,"quantity": 50,"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","price": 1188,"internalInformation": "Rulo 16","showToClient": true}],"items": [{"ordinal": 0,"name": "Interior","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": true,"bleedPrint": false,"quantityOfSheets": 80,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 80,"name": "Obra"},"processDetails": {"sheetSize": "72x92","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "GTO46","excess": 50},"price": 2960,"priceWithFinishes": 2960},{"ordinal": 1,"name": "Tapa","ink": {"inksQuantity": 4,"inksDetails": "Full Color CMYK"},"allTheSame": false,"bleedPrint": true,"quantityOfPages": 1,"quantityOfVias": 1,"openedSize": "33x21","faces": "SIMPLE_FAZ","material": {"gr": 250,"name": "Cartulina"},"processDetails": {"sheetSize": "72x102","cutsPerSheet": 4,"paperSize": "33x48","quantityPerPaper": 1,"machine": "Konica 1070 Color","excess": 4},"mandatoryFinishes": [{"name": "Tipo Semi-Dura","price": 750,"showToClient": true}],"price": 772,"priceWithFinishes": 1522},{"ordinal": 2,"name": "Inserto","ink": {"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},"allTheSame": false,"bleedPrint": false,"quantityOfSheets": 2,"quantityOfVias": 1,"openedSize": "15x21","faces": "DOBLE_FAZ","material": {"gr": 130,"name": "Coteado"},"processDetails": {"sheetSize": "66x96","cutsPerSheet": 4,"paperSize": "32x46","quantityPerPaper": 4,"machine": "Konica 951","excess": 3},"price": 0,"priceWithFinishes": 0}],"price": 1000,"totalPrice": 8170}],"work": {"id": 18403,"quantity": [50,100],"openedSize": "15x21","mandatoryFinishes": [{"name": "Encuadernado Rulo","comment": "Rulo metálico de doble espiral","showToClient": true}],"optionalFinishes": [{"name": "Cierre Elástico","showToClient": true,"propertiesToSelectByCustomer": ["negro","blanco"]}],"items": [{"ordinal": 2,"name": "Inserto","ink": [{"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"}],"allTheSame": false,"bleedPrint": false,"quantityOfPages": [null],"quantityOfSheets": [2],"quantityOfVias": [1],"faces": ["DOBLE_FAZ"],"material": [{"gr": 130,"name": "Coteado"}]},{"ordinal": 1,"name": "Tapa","ink": [{"inksQuantity": 4,"inksDetails": "Full Color CMYK"}],"allTheSame": false,"bleedPrint": true,"quantityOfPages": [1],"quantityOfSheets": [null],"quantityOfVias": [1],"faces": ["SIMPLE_FAZ"],"material": [{"gr": 150,"name": "Coteado"},{"gr": 250,"name": "Cartulina"}],"mandatoryFinishes": [{"name": "Tipo Dura","comment": "La tapa dura es una tapa rígida hecha con suela forrada.","showToClient": true},{"name": "Tipo Semi-Dura","comment": "La tapa semidura es una tapa hecha con dos cartulinas de 250gr. contraencoladas formando un material semi rígido de más de 500gr.","showToClient": true}]},{"ordinal": 0,"name": "Interior","ink": [{"inksQuantity": 1,"inksDetails": "Tinta Negra fondo blanco sin grisados"},{"inksQuantity": 1,"inksDetails": "Tinta Negra"}],"allTheSame": true,"bleedPrint": true,"quantityOfPages": [null],"quantityOfSheets": [80],"quantityOfVias": [1],"faces": ["DOBLE_FAZ"],"material": [{"gr": 80,"name": "Obra"},{"gr": 90,"name": "Obra"}]}]},"optionalFinishes": [{"name": "Cierre Elástico","price": 4050,"propertiesToSelectByCustomer": ["negro","blanco"],"itemOrdinal": -1,"showToClient": true,"quantity": 100},{"name": "Cierre Elástico","price": 1500,"propertiesToSelectByCustomer": ["negro","blanco"],"itemOrdinal": -1,"showToClient": true,"quantity": 50}]}');
  estimate.work.name = 'Cuadernos';
  return estimate;
}