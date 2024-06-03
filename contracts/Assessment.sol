//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract Assessment {
    
    mapping(address => uint) private balances;
    mapping(address => bool) private freezedAccounts;
    mapping(address => Loan) private loans;

    event Deposit(address indexed owner, uint amount);
    event Withdraw(address indexed owner, uint amount);
    event Transfer(address indexed from, address indexed to, uint amount);
    event LoanRequested(address indexed borrower, uint256 amount);
    event LoanApproved(address indexed borrower, uint256 amount);
    event LoanRepaid(address indexed borrower, uint256 amount);

    struct Loan {
        uint amount;
        bool approved;
        bool repaid;
    }

    modifier UnFreezed(){
        require(!freezedAccounts[msg.sender], "Sorry, your account is currently freezed");
        _;
    }
    function getBalance() public view returns(uint) {
        return balances[msg.sender];
    } 
    function freeze() public{
        freezedAccounts[msg.sender] = true;
    }
    function unfreeze() public{
        freezedAccounts[msg.sender] = false;
    }
    function enoughBalance(address _address, uint _no) private view {
        uint balance = balances[_address];
        assert(balance >= _no);
    }
    function deposit(uint _number) public UnFreezed payable {
        require(_number>0, "Only positive amount can be deposited");
        balances[msg.sender] += _number;
        emit Deposit(msg.sender, _number);
    }

    function withdraw(uint _number) public UnFreezed payable {
        enoughBalance(msg.sender,_number);
        balances[msg.sender] -= _number;
        emit Withdraw(msg.sender, _number);
    }

    function transfer(address _to, uint _number) public UnFreezed payable {
        enoughBalance(msg.sender, _number);
        balances[msg.sender] -= _number;
        balances[_to] += _number;
        emit Transfer(msg.sender, _to, _number);
    }
    function requestLoan(uint amount) public UnFreezed {
        require(amount > 0, "Loan amount must be greater than zero");
        loans[msg.sender] = Loan(amount, false, false);
        emit LoanRequested(msg.sender, amount);
    }
    function approveLoan(address senderAddress) public UnFreezed {
        Loan storage loan = loans[msg.sender];
        require(loan.amount > 0, "No loan requested");
        require(!loan.approved, "Loan already approved");
        if(balances[senderAddress]<=loan.amount){
            revert("Sorry, sender don't have enough funds to grant loan!");
        }
        loan.approved = true;
        balances[senderAddress] -= loan.amount;
        balances[msg.sender] += loan.amount;
        emit LoanApproved(msg.sender, loan.amount);
    }
    function repayLoan(address senderAddress, uint repayAmount) public payable UnFreezed {
        Loan storage loan = loans[msg.sender];
        require(loan.approved, "Loan not approved");
        require(!loan.repaid, "Loan already repaid");
        require(repayAmount <= loan.amount, "Incorrect repayment amount");
        if(balances[msg.sender]<=repayAmount){
            revert("Sorry, Receiver don't have enough funds to repay the loan!");
        }
        balances[msg.sender] -= repayAmount;
        balances[senderAddress] += repayAmount;
        loan.amount -= repayAmount;
        if(loan.amount ==0){
            loan.repaid = true;
        }
        emit LoanRepaid(msg.sender, repayAmount);
    }    
}