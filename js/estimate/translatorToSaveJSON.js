var translate = function(key){
    switch (key) {
        case 'workTypeId':
            return 'A'; 
        case 'workType':
            return 'B';
        case 'image':
            return 'C';
        case 'name':
            return 'D';
        case 'closedSizes':
            return 'E';
        case 'quantities':
            return 'F';
        case 'mandatoryFinishes':
            return 'G';
        case 'groupName':
            return 'H';
        case 'finishes':
            return 'I';
        case 'finish':
            return 'J';
        case 'comment':
            return 'K';
        case 'showToClientFinish':
            return 'L';
        case 'showToClient':
            return 'M';
        case 'incidences':
            return 'N';
        case 'itemId':
            return 'O';
        case 'type':
            return 'P';
        case 'action':
            return 'Q';
        case 'values':
            return 'R';
        case 'items':
            return 'S';
        case 'bleedPrint':
            return 'T';
        case 'ink':
            return 'U';
        case 'inksDetails':
            return 'V';
        case 'openedSize':
            return 'W';
        case 'allTheSame':
            return 'X';
        case 'optionalFinishes':
            return 'Y';
        case 'quantityOfPages':
            return 'Z';
        case 'quantityOfVias':
            return 'a';
        case 'quantityOfSheets':
            return 'b';
        case 'faces':
            return 'c';
        case 'material':
            return 'd';
        case 'paper':
            return 'e';
        case 'price':
            return 'f';
        case 'inksQuantity':
            return 'g';
        case 'closedSize':
            return 'h';
        case 'optionalFinishesPrices':
            return 'i';
        case 'quantity':
            return 'j';
        case 'workId':
            return 'k';
        case 'prices':
            return 'l';
        case 'cutsPerSheet':
            return 'm';
        case 'excess':
            return 'n';
        case 'machine':
            return 'o';
        case 'paperSize':
            return 'p';
        case 'quantityPerPaper':
            return 'q';
        case 'sheetSize':
            return 'r';
        case 'totalPrice':
            return 's';
        case 'internalInformation':
            return 't';
        case 'Ordinal':
            return 'u';
        case 'processDetails':
            return 'v';
        case 'priceWithFinishes':
            return 'w';
        case 'propertiesToSelectByCustomer':
            return 'x';
        case 'work':
            return '';
        default:
            return key;
    }
}

var deTranslate = function(key){
    switch (key) {
        case 'A': 
            return 'workTypeId';
        case 'B':
            return 'workType';
        case 'C':
            return 'image';
        case 'D':
            return 'name';
        case 'E':
            return 'closedSizes';
        case 'F':
            return 'quantities';
        case 'G':
            return 'mandatoryFinishes';
        case 'H':
            return 'groupName';
        case 'I':
            return 'finishes';
        case 'J':
            return 'finish';
        case 'K':
            return 'comment';
        case 'L':
            return 'showToClientFinish';
        case 'M':
            return 'showToClient';
        case 'N':
            return 'incidences';
        case 'O':
            return 'itemId';
        case 'P':
            return 'type';
        case 'Q':
            return 'action';
        case 'R':
            return 'values';
        case 'S':
            return 'items';
        case 'T':
            return 'bleedPrint';
        case 'U':
            return 'ink';
        case 'V':
            return 'inksDetails';
        case 'W':
            return 'openedSize';
        case 'X':
            return 'allTheSame';
        case 'Y':
            return 'optionalFinishes';
        case 'Z':
            return 'quantityOfPages';
        case 'a':
            return 'quantityOfVias';
        case 'b':
            return 'quantityOfSheets';
        case 'c':
            return 'faces';
        case 'd':
            return 'material';
        case 'e':
            return 'paper';
        case 'f':
            return 'price';
        case 'g':
            return 'inksQuantity';
        case 'h':
            return 'closedSize';
        case 'i':
            return 'optionalFinishesPrices';
        case 'j':
            return 'quantity';
        case 'k':
            return 'workId';
        case 'l':
            return 'prices';
        case 'm':
            return 'cutsPerSheet';
        case 'n':
            return 'excess';
        case 'o':
            return 'machine';
        case 'p':
            return 'paperSize';
        case 'q':
            return 'quantityPerPaper';
        case 'r':
            return 'sheetSize';
        case 's':
            return 'totalPrice';
        case 't':
            return 'internalInformation';
        case 'u':
            return 'Ordinal';
        case 'v':
            return 'processDetails';
        case 'w':
            return 'priceWithFinishes';
        case 'x':
            return 'propertiesToSelectByCustomer';
        case 'y':
            return 'work';
        default:
            return key;
    }
}