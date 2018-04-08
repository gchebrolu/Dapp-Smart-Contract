pragma solidity ^0.4.17;

contract PayRoll{


    Payee[] public employees;
    
    uint8 private currentDay;
    uint8 private currentMonth;
    uint16 private currentYear;
    uint private unixTime;
    
    uint public availableBalanceInEth = 0;
    uint public reqBalanceInEth = 0;
    
    address public contractAddress;
    
    
    function PayRoll() payable public {
        availableBalanceInEth = msg.value/1000000000000000000;
        contractAddress = this;
    }
    
    function() payable public {
        availableBalanceInEth += msg.value/1000000000000000000;
    }
    
    
    function loadAmount() payable public {
        msg.value;
        availableBalanceInEth = availableBalanceInEth + msg.value/1000000000000000000;
    }
    
    struct Payee {
        address receiver;
        uint amount;
        uint8 dayDD;
        uint8 monthMM;
        uint16 yearYYYY;
        bool isTransactionDone;
    }
    
    
// current _DateTime //
    struct _DateTime {
        uint16 year;
        uint8 month;
        uint8 day;
        uint8 hour;
        uint8 minute;
        uint8 second;
        uint8 weekday;
    }
    
    uint constant DAY_IN_SECONDS = 86400;
    uint constant YEAR_IN_SECONDS = 31536000;
    uint constant LEAP_YEAR_IN_SECONDS = 31622400;
    uint constant HOUR_IN_SECONDS = 3600;
    uint constant MINUTE_IN_SECONDS = 60;
    uint16 constant ORIGIN_YEAR = 1970;
    
    function isLeapYear(uint16 year) private pure returns (bool) {
        if (year % 4 != 0) {
                return false;
        }
        if (year % 100 != 0) {
                return true;
        }
        if (year % 400 != 0) {
                return false;
        }
        return true;
    }
    
    function leapYearsBefore(uint year) private pure returns (uint) {
        year -= 1;
        return year / 4 - year / 100 + year / 400;
    }
    
    function getDaysInMonth(uint8 month, uint16 year) private pure returns (uint8) {
        if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                return 31;
        }
        else if (month == 4 || month == 6 || month == 9 || month == 11) {
                return 30;
        }
        else if (isLeapYear(year)) {
                return 29;
        }
        else {
                return 28;
        }
    }
    
    function parseTimestamp(uint timestamp) internal pure returns (_DateTime dt) {
        uint secondsAccountedFor = 0;
        uint buf;
        uint8 i;
    
        // Year
        dt.year = getYear(timestamp);
        buf = leapYearsBefore(dt.year) - leapYearsBefore(ORIGIN_YEAR);
    
        secondsAccountedFor += LEAP_YEAR_IN_SECONDS * buf;
        secondsAccountedFor += YEAR_IN_SECONDS * (dt.year - ORIGIN_YEAR - buf);
    
        // Month
        uint secondsInMonth;
        for (i = 1; i <= 12; i++) {
                secondsInMonth = DAY_IN_SECONDS * getDaysInMonth(i, dt.year);
                if (secondsInMonth + secondsAccountedFor > timestamp) {
                        dt.month = i;
                        break;
                }
                secondsAccountedFor += secondsInMonth;
        }
    
        // Day
        for (i = 1; i <= getDaysInMonth(dt.month, dt.year); i++) {
                if (DAY_IN_SECONDS + secondsAccountedFor > timestamp) {
                        dt.day = i;
                        break;
                }
                secondsAccountedFor += DAY_IN_SECONDS;
        }
    
    
    }
    
    function getYear(uint timestamp) private pure returns (uint16) {
        uint secondsAccountedFor = 0;
        uint16 year;
        uint numLeapYears;
    
        // Year
        year = uint16(ORIGIN_YEAR + timestamp / YEAR_IN_SECONDS);
        numLeapYears = leapYearsBefore(year) - leapYearsBefore(ORIGIN_YEAR);
    
        secondsAccountedFor += LEAP_YEAR_IN_SECONDS * numLeapYears;
        secondsAccountedFor += YEAR_IN_SECONDS * (year - ORIGIN_YEAR - numLeapYears);
    
        while (secondsAccountedFor > timestamp) {
                if (isLeapYear(uint16(year - 1))) {
                        secondsAccountedFor -= LEAP_YEAR_IN_SECONDS;
                }
                else {
                        secondsAccountedFor -= YEAR_IN_SECONDS;
                }
                year -= 1;
        }
        return year;
    }
    
    function getMonth(uint timestamp) private pure returns (uint8) {
        return parseTimestamp(timestamp).month;
    }
    
    function getDay(uint timestamp) private pure returns (uint8) {
        return parseTimestamp(timestamp).day;
    }
    
    
    function addPayee(address receiver, uint amountInEth, uint8 dayDD, uint8 monthMM, uint16 yearYYYY) public returns (bool success) {
        uint ethToWeiConv = amountInEth * 1000000000000000000;
        Payee memory newPayee;
        newPayee.receiver = receiver;
        newPayee.amount = ethToWeiConv;
        newPayee.dayDD = dayDD;
        newPayee.monthMM = monthMM;
        newPayee.yearYYYY = yearYYYY;
        newPayee.isTransactionDone = false;
        employees.push(newPayee);
        reqBalanceInEth += amountInEth;
        
        return true;
    }
    
    function transfer(address to, uint value) private returns(bool){
        require(availableBalanceInEth >= reqBalanceInEth && value > 0);
        to.transfer(value);
        availableBalanceInEth = availableBalanceInEth - value/1000000000000000000;
        reqBalanceInEth = reqBalanceInEth - value/1000000000000000000;
        return true;
    }

    function directTransfer(address transferTo) payable public {
        transferTo.transfer(msg.value);
    }
    
    function executeTransactions() public {
     unixTime = now;
     currentDay = getDay(unixTime);
     currentMonth = getMonth(unixTime);
     currentYear = getYear(unixTime);
        
        for(uint i = 0; i < employees.length; i++) {
            if(employees[i].yearYYYY <= currentYear && employees[i].monthMM <= currentMonth && employees[i].isTransactionDone == false) {
                if(employees[i].dayDD <= currentDay){
                    transfer(employees[i].receiver, employees[i].amount);
                    employees[i].isTransactionDone = true;
                }
            }
            else if(employees[i].yearYYYY < currentYear && employees[i].isTransactionDone == false) {
                transfer(employees[i].receiver, employees[i].amount);
                employees[i].isTransactionDone = true;
            }
            else if(employees[i].yearYYYY <= currentYear && employees[i].monthMM < currentMonth && employees[i].isTransactionDone == false) {
                transfer(employees[i].receiver, employees[i].amount);
                employees[i].isTransactionDone = true;
            }
            
        }
    }
    
    function getPayees() public constant returns(address[], uint256[], uint8[], uint8[], uint16[], bool[]) {
        
        uint arrayLength = employees.length;
        
        address[] memory _toAddress = new address[](arrayLength);
        uint[] memory _amount = new uint[](arrayLength);
        uint8[] memory _day = new uint8[](arrayLength);
        uint8[] memory _month = new uint8[](arrayLength);
        uint16[] memory _year = new uint16[](arrayLength);
        bool[] memory _isDone = new bool[](arrayLength);
        
        for(uint i=0; i<employees.length; i++) {
            Payee memory currentPayee;
            currentPayee = employees[i];
            _toAddress[i] = currentPayee.receiver;
            _amount[i] = currentPayee.amount;
            _day[i] = currentPayee.dayDD;
            _month[i] = currentPayee.monthMM;
            _year[i] = currentPayee.yearYYYY;
            _isDone[i] = currentPayee.isTransactionDone;
        }
        
        return(_toAddress,_amount,_day,_month,_year,_isDone);
        
    }
        
}